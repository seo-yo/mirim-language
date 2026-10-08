-- 미림어 사전 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여 넣고 Run (postgres 권한으로 실행됨)
-- 구조: 테이블은 anon 접근 불가 → 읽기는 words_public 뷰, 쓰기는 RPC 3개로만

create extension if not exists pgcrypto with schema extensions;

-- 1. 테이블
create table if not exists public.words (
  id               uuid primary key default gen_random_uuid(),
  mirim            text not null check (char_length(mirim) between 1 and 40),
  korean           text not null check (char_length(korean) between 1 and 60),
  example          text check (char_length(example) <= 200),
  note             text check (char_length(note) <= 300),
  author           text check (char_length(author) <= 20),
  pin_hash         text not null,
  pin_fails        int  not null default 0,
  pin_locked_until timestamptz,
  hidden           boolean not null default false,   -- 관리자 숨김 (대시보드에서 체크)
  created_at       timestamptz not null default now()
);

alter table public.words enable row level security;
revoke all on table public.words from anon, authenticated;

-- 2. 읽기 전용 뷰 (pin 컬럼·숨김 행 제외). owner 가 postgres 라 RLS 를 안 탐 = 의도된 것
create or replace view public.words_public
  with (security_invoker = false) as
  select id, mirim, korean, example, note, author, created_at
  from public.words
  where not hidden;

grant select on public.words_public to anon, authenticated;

-- 3. 등록
create or replace function public.add_word(
  p_mirim text, p_korean text, p_pin text,
  p_example text default null, p_note text default null, p_author text default null
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  if coalesce(p_pin, '') !~ '^\d{4}$' then
    raise exception '비밀번호는 숫자 4자리예요';
  end if;
  insert into words (mirim, korean, example, note, author, pin_hash)
  values (
    btrim(p_mirim), btrim(p_korean),
    nullif(btrim(p_example), ''), nullif(btrim(p_note), ''), nullif(btrim(p_author), ''),
    crypt(p_pin, gen_salt('bf'))
  ) returning id into v_id;
  return v_id;
end $$;

-- 4. pin 대조 → ok / wrong_pin / locked / not_found
-- ⚠ raise exception 을 쓰면 실패 카운트 update 까지 롤백되므로 코드를 반환함
create or replace function public.check_pin(p_id uuid, p_pin text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare r words%rowtype;
begin
  select * into r from words where id = p_id and not hidden;
  if not found then return 'not_found'; end if;
  if r.pin_locked_until is not null and r.pin_locked_until > now() then return 'locked'; end if;
  if r.pin_hash <> crypt(coalesce(p_pin, ''), r.pin_hash) then
    if r.pin_fails + 1 >= 5 then
      update words set pin_fails = 0, pin_locked_until = now() + interval '10 minutes' where id = p_id;
      return 'locked';
    end if;
    update words set pin_fails = pin_fails + 1 where id = p_id;
    return 'wrong_pin';
  end if;
  update words set pin_fails = 0, pin_locked_until = null where id = p_id;
  return 'ok';
end $$;

-- 5. 수정 / 삭제
create or replace function public.update_word(
  p_id uuid, p_pin text, p_mirim text, p_korean text,
  p_example text default null, p_note text default null, p_author text default null
) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v text;
begin
  v := check_pin(p_id, p_pin);
  if v <> 'ok' then return v; end if;
  update words set
    mirim   = btrim(p_mirim),
    korean  = btrim(p_korean),
    example = nullif(btrim(p_example), ''),
    note    = nullif(btrim(p_note), ''),
    author  = nullif(btrim(p_author), '')
  where id = p_id;
  return 'ok';
end $$;

create or replace function public.delete_word(p_id uuid, p_pin text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v text;
begin
  v := check_pin(p_id, p_pin);
  if v <> 'ok' then return v; end if;
  delete from words where id = p_id;
  return 'ok';
end $$;

-- 6. 권한: check_pin 은 내부용, 나머지 3개만 공개
revoke execute on function public.check_pin(uuid, text) from public, anon, authenticated;
grant execute on function public.add_word(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.update_word(uuid, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.delete_word(uuid, text) to anon, authenticated;

-- 실제 데이터는 sql/seed.sql 에 따로 있음
