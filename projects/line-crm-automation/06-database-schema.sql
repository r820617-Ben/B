-- ============================================================
-- 知育 AI 企業診斷 LINE Funnel｜Database Schema
-- Target: Supabase (PostgreSQL 15+)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUM
-- ------------------------------------------------------------
create type segment_code   as enum ('GM','AX','PO','CT','BC','DS');
create type lead_status     as enum ('HOT','WARM','NURTURE');
create type contact_status  as enum ('NEW','CONTACTED','MEETING_BOOKED','PROPOSAL_SENT','WON','LOST','NO_RESPONSE');
create type session_status  as enum ('IN_PROGRESS','COMPLETED','ABANDONED');
create type service_code    as enum ('consulting','ai','marketing','training');

-- ------------------------------------------------------------
-- users：一個 LINE 好友一列
-- ------------------------------------------------------------
create table users (
  id                uuid primary key default gen_random_uuid(),
  line_user_id      text not null unique,
  display_name      text,
  picture_url       text,
  language          text default 'zh-TW',
  source            text default 'UNKNOWN',       -- WEBSITE_AI / WEBSITE_TRAINING / ...
  source_detail     jsonb default '{}'::jsonb,    -- utm 參數原文
  current_state     text not null default 'NEW',  -- State Machine
  current_segment   segment_code,
  is_blocked        boolean default false,        -- 封鎖官方帳號
  do_not_contact    boolean default false,        -- 明示拒絕聯繫
  handled_by        text,                         -- 接手顧問
  followed_at       timestamptz default now(),
  unfollowed_at     timestamptz,
  last_active_at    timestamptz default now(),
  anonymized_at     timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index idx_users_state   on users(current_state);
create index idx_users_active  on users(last_active_at desc);
create index idx_users_source  on users(source);

-- ------------------------------------------------------------
-- companies：一個 user 可能有多間公司紀錄，取最新一筆
-- ------------------------------------------------------------
create table companies (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  company_name   text,
  industry       text,          -- IND_FOOD / IND_RETAIL / ...
  employees      text,          -- s1to5 / s6to19 / s20to49 / s50plus
  role_raw       text,          -- 使用者自填職稱原文
  role_tier      text,          -- owner / vp / manager / staff
  website        text,
  created_at     timestamptz default now()
);
create index idx_companies_user on companies(user_id);

-- ------------------------------------------------------------
-- diagnostic_sessions：一次診斷 = 一列
-- ------------------------------------------------------------
create table diagnostic_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  segment          segment_code,
  routed_from      segment_code,    -- Discovery 路由來源
  source           text,
  status           session_status default 'IN_PROGRESS',
  completed_all    boolean default false,
  question_count   int default 0,
  started_at       timestamptz default now(),
  completed_at     timestamptz,
  abandoned_at     timestamptz,
  duration_seconds int
);
create index idx_sessions_user   on diagnostic_sessions(user_id, started_at desc);
create index idx_sessions_status on diagnostic_sessions(status);

-- ------------------------------------------------------------
-- answers：每一題一列
-- ------------------------------------------------------------
create table answers (
  id            bigserial primary key,
  session_id    uuid not null references diagnostic_sessions(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  question_id   text not null,      -- GM1 / AX3 / U1 / LEAD5 ...
  question_text text,
  answer_value  text not null,      -- 短代碼
  answer_label  text,               -- 顯示文字
  answer_raw    text,               -- 自由文字題原文
  answered_at   timestamptz default now(),
  unique (session_id, question_id)
);
create index idx_answers_session on answers(session_id);

-- ------------------------------------------------------------
-- diagnostics：AI 診斷輸出
-- ------------------------------------------------------------
create table diagnostics (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null unique references diagnostic_sessions(id) on delete cascade,
  user_id             uuid not null references users(id) on delete cascade,

  ai_ready_score      int check (ai_ready_score between 0 and 100),
  score_maturity      int,
  score_readiness     int,
  score_clarity       int,
  tier                text,               -- Ready / Buildable / Foundational / Discovery
  maturity_level      text,               -- L0–L5
  maturity_name       text,               -- AI Explorer / AI User / ...

  current_state_text  text,
  priorities          jsonb,              -- ["...","...","..."]
  insight             text,
  opportunity         text,
  steps               jsonb,              -- ["...","...","..."]
  primary_service     service_code,
  secondary_service   service_code,
  next_step_title     text,
  confidence          text,

  llm_provider        text,               -- anthropic / openai / fallback
  llm_model           text,
  llm_tokens_in       int,
  llm_tokens_out      int,
  llm_latency_ms      int,
  is_fallback         boolean default false,
  needs_regeneration  boolean default false,
  raw_response        jsonb,

  created_at          timestamptz default now()
);
create index idx_diag_user on diagnostics(user_id, created_at desc);
create index idx_diag_regen on diagnostics(needs_regeneration) where needs_regeneration = true;

-- ------------------------------------------------------------
-- leads：Lead Qualification 結果
-- ------------------------------------------------------------
create table leads (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  session_id        uuid references diagnostic_sessions(id) on delete set null,
  company_id        uuid references companies(id) on delete set null,

  contact_name      text,
  contact_channel   text,              -- line / email / phone
  contact_email     text,
  contact_phone     text,

  timeline          text,              -- now / m1to3 / m3to6 / exploring
  budget            text,              -- b30plus / b10to30 / b5to10 / b_lt5 / unknown
  need_summary      text,

  lead_score        int check (lead_score between 0 and 100),
  score_breakdown   jsonb,
  status            lead_status,
  contact_status    contact_status default 'NEW',
  assigned_to       text,
  sla_due_at        timestamptz,
  first_contacted_at timestamptz,
  closed_at         timestamptz,
  close_reason      text,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index idx_leads_status on leads(status, created_at desc);
create index idx_leads_sla    on leads(sla_due_at) where contact_status = 'NEW';

-- ------------------------------------------------------------
-- user_tags：CRM 標籤，只加不刪
-- ------------------------------------------------------------
create table user_tags (
  id          bigserial primary key,
  user_id     uuid not null references users(id) on delete cascade,
  tag         text not null,
  source      text default 'system',    -- system / manual
  created_at  timestamptz default now(),
  revoked_at  timestamptz
);
create unique index idx_user_tags_active on user_tags(user_id, tag) where revoked_at is null;
create index idx_user_tags_tag on user_tags(tag) where revoked_at is null;

-- ------------------------------------------------------------
-- followups：追蹤訊息排程與結果
-- ------------------------------------------------------------
create table followups (
  id            bigserial primary key,
  user_id       uuid not null references users(id) on delete cascade,
  session_id    uuid references diagnostic_sessions(id) on delete cascade,
  step          text not null,          -- D1 / D3 / D7 / ABANDON_24H
  scheduled_at  timestamptz not null,
  sent_at       timestamptz,
  cancelled_at  timestamptz,
  cancel_reason text,
  responded_at  timestamptz,
  created_at    timestamptz default now(),
  unique (session_id, step)
);
create index idx_followups_due on followups(scheduled_at) where sent_at is null and cancelled_at is null;

-- ------------------------------------------------------------
-- events：所有 webhook 事件與系統動作，用於除錯與稽核
-- ------------------------------------------------------------
create table events (
  id             bigserial primary key,
  user_id        uuid references users(id) on delete set null,
  line_user_id   text,
  event_type     text not null,       -- follow / unfollow / message / postback / push / error
  webhook_event_id text,              -- LINE 的 event id，用於冪等
  payload        jsonb,
  state_before   text,
  state_after    text,
  error_message  text,
  created_at     timestamptz default now()
);
create index idx_events_user on events(user_id, created_at desc);
create unique index idx_events_dedupe on events(webhook_event_id) where webhook_event_id is not null;
create index idx_events_error on events(created_at desc) where event_type = 'error';

-- ------------------------------------------------------------
-- Trigger：updated_at 自動更新
-- ------------------------------------------------------------
create or replace function touch_updated_at() returns trigger as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$ language plpgsql;

create trigger trg_users_touch before update on users
  for each row execute function touch_updated_at();
create trigger trg_leads_touch before update on leads
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------
-- View：顧問看的名單總表
-- ------------------------------------------------------------
create view v_lead_board as
select
  l.id                as lead_id,
  l.created_at,
  l.status,
  l.lead_score,
  l.contact_status,
  l.assigned_to,
  l.sla_due_at,
  l.contact_name,
  c.company_name,
  c.industry,
  c.employees,
  c.role_tier,
  l.timeline,
  l.budget,
  d.ai_ready_score,
  d.maturity_name,
  d.primary_service,
  d.next_step_title,
  d.insight,
  u.line_user_id,
  u.source
from leads l
join users u               on u.id = l.user_id
left join companies c      on c.id = l.company_id
left join diagnostics d    on d.session_id = l.session_id
order by
  case l.status when 'HOT' then 1 when 'WARM' then 2 else 3 end,
  l.created_at desc;

-- ------------------------------------------------------------
-- View：每日營運指標
-- ------------------------------------------------------------
create view v_daily_funnel as
select
  date_trunc('day', s.started_at)::date as d,
  count(*)                                                          as started,
  count(*) filter (where s.status = 'COMPLETED')                    as completed,
  count(*) filter (where s.status = 'ABANDONED')                    as abandoned,
  count(distinct l.id)                                              as leads,
  count(distinct l.id) filter (where l.status = 'HOT')              as hot_leads,
  round(avg(d2.ai_ready_score), 1)                                  as avg_ai_ready,
  round(avg(s.duration_seconds), 0)                                 as avg_seconds
from diagnostic_sessions s
left join diagnostics d2 on d2.session_id = s.id
left join leads l        on l.session_id  = s.id
group by 1
order by 1 desc;

-- ------------------------------------------------------------
-- 資料保留：24 個月後匿名化（每月排程呼叫）
-- ------------------------------------------------------------
create or replace function anonymize_stale_users() returns int as $fn$
declare n int;
begin
  with target as (
    select id from users
    where last_active_at < now() - interval '24 months'
      and anonymized_at is null
  )
  update users u
     set display_name = null,
         picture_url  = null,
         line_user_id = 'ANON_' || left(md5(u.line_user_id), 16),
         anonymized_at = now()
    from target t where u.id = t.id;
  get diagnostics n = row_count;

  update leads set contact_email = null, contact_phone = null, contact_name = null
   where user_id in (select id from users where anonymized_at is not null);

  return n;
end;
$fn$ language plpgsql;
