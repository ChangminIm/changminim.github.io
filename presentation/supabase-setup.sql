-- 발표자료 아카이브 비밀번호 백엔드 (Supabase)
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run
-- 여러 번 실행해도 안전합니다 (기존 데이터는 덮어쓰지 않음).

-- 1. 잠금 설정 테이블 (행 1개에 locks 전체를 jsonb로 저장)
create table if not exists public.presentation_locks (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. RLS: 누구나 읽기만 가능, 직접 쓰기는 전면 차단
alter table public.presentation_locks enable row level security;

drop policy if exists "public read" on public.presentation_locks;
create policy "public read" on public.presentation_locks
  for select using (true);
-- insert/update/delete 정책 없음 → anon 키로는 아래 RPC로만 쓸 수 있음

-- 3. 초기 데이터 (2026-08-04 기준 사이트 locks.json과 동일)
--    마스터키: rladmsgP159! / 개별 자료: knu2026 (해시만 저장)
insert into public.presentation_locks (id, data) values ('main', '{
  "master": "848b35ccad0a714c819fd00da9a9c9ee44763bd3dd2f6458dda7ab8e969cae25",
  "items": {
    "ws-2026-08": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "mgtwr-2026-07": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "region30-2026-07": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "story-pub-2026-07": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "story-aca-2026-07": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "jik-korea-2026-08": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "jys-kongju-2026-07": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87",
    "vibe-env-2026-06": "c8c9c8145447b97cd086c008f5c9d9410a140b32ea632f601eec14e371693a87"
  }
}'::jsonb)
on conflict (id) do nothing;

-- 4. 저장 RPC: 현재 마스터키 해시가 일치할 때만 갱신 허용
create or replace function public.update_locks(new_data jsonb, auth_master text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cur jsonb;
begin
  select data into cur from presentation_locks where id = 'main';
  if cur is null then
    return false;
  end if;
  -- 인증: 호출자가 보낸 해시가 저장된 마스터 해시와 일치해야 함
  if (cur->>'master') is null or (cur->>'master') <> auth_master then
    return false;
  end if;
  -- 새 데이터에 마스터가 비어 있으면 거부 (스스로 잠그는 사고 방지)
  if coalesce(new_data->>'master', '') = '' then
    return false;
  end if;
  update presentation_locks set data = new_data, updated_at = now() where id = 'main';
  return true;
end;
$$;

revoke all on function public.update_locks(jsonb, text) from public;
grant execute on function public.update_locks(jsonb, text) to anon, authenticated;
