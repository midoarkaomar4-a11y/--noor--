-- شغّل الملف ده كله مرة واحدة في Supabase: SQL Editor ثم New query ثم Run

-- ===== الجداول =====
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  guardian_name text,
  phone text,
  guardian_phone text,
  grade text,
  xp int not null default 0,
  is_admin boolean not null default false,
  login_email text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_phone_key on public.profiles(phone) where phone is not null;
create index if not exists profiles_name_idx on public.profiles(lower(name));

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  grade text not null,
  lessons_count int not null default 0,
  color text,
  published boolean not null default true,
  sort bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('video','pdf','link')),
  url text,
  file_path text,
  sort bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists lessons_course_idx on public.lessons(course_id);

-- ===== دوال مساعدة =====
create or replace function public.is_admin_user() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- بترجع الإيميل الداخلي للحساب من الاسم (بدون أي بيانات تانية) عشان الدخول بالاسم وكلمة المرور
create or replace function public.login_emails(p_name text) returns setof text
language sql security definer stable set search_path = public as $$
  select login_email from public.profiles where lower(name) = lower(trim(p_name))
$$;
grant execute on function public.login_emails(text) to anon, authenticated;

create or replace function public.admin_delete_student(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin_user() then raise exception 'not allowed'; end if;
  delete from auth.users where id = p_id and id in (select id from public.profiles where is_admin = false);
end $$;
grant execute on function public.admin_delete_student(uuid) to authenticated;

-- بينشئ ملف الطالب تلقائيًا لما يسجل حساب جديد
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_user_meta_data ? 'name' then
    insert into public.profiles(id, name, guardian_name, phone, guardian_phone, grade, login_email)
    values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'guardian_name',
            new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'guardian_phone',
            new.raw_user_meta_data->>'grade', new.email);
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== الصلاحيات (RLS) =====
alter table public.profiles enable row level security;
alter table public.courses  enable row level security;
alter table public.lessons  enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin_user());
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "courses read" on public.courses;
create policy "courses read" on public.courses for select to authenticated
  using (published or public.is_admin_user());
drop policy if exists "courses admin write" on public.courses;
create policy "courses admin write" on public.courses for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "lessons read" on public.lessons;
create policy "lessons read" on public.lessons for select to authenticated
  using (public.is_admin_user() or exists (select 1 from public.courses c where c.id = course_id and c.published));
drop policy if exists "lessons admin write" on public.lessons;
create policy "lessons admin write" on public.lessons for all to authenticated
  using (public.is_admin_user()) with check (public.is_admin_user());

-- ===== تخزين الفيديوهات والـ PDF (خاص: الطالب المسجل فقط يشوفها) =====
insert into storage.buckets (id, name, public) values ('course-files', 'course-files', false)
  on conflict (id) do nothing;
drop policy if exists "files read" on storage.objects;
create policy "files read" on storage.objects for select to authenticated
  using (bucket_id = 'course-files');
drop policy if exists "files admin insert" on storage.objects;
create policy "files admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-files' and public.is_admin_user());
drop policy if exists "files admin delete" on storage.objects;
create policy "files admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'course-files' and public.is_admin_user());
