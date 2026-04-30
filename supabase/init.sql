-- Pace 数据库初始化 SQL（在 Supabase SQL Editor 中执行）

-- 用户扩展信息
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 情侣关系表
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid references public.profiles(id) not null,
  user_b_id uuid references public.profiles(id),
  pet_id uuid,
  invite_code text unique,
  status text not null default 'pending' check (status in ('pending', 'active', 'dissolved')),
  created_at timestamptz default now(),
  bound_at timestamptz
);

-- 宠物表
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples(id) on delete cascade not null,
  name text not null default '小团子',
  species text not null default 'cat',
  personality text default '慵懒可爱，喜欢被摸下巴，偶尔会撒娇',
  hunger int not null default 80 check (hunger between 0 and 100),
  mood int not null default 80 check (mood between 0 and 100),
  intimacy int not null default 0,
  last_fed_at timestamptz,
  last_petted_at timestamptz,
  created_at timestamptz default now()
);

-- 添加 couples.pet_id 的外键（宠物建好之后才能引用）
alter table public.couples
  add constraint fk_couple_pet foreign key (pet_id) references public.pets(id);

-- 绑定历史
create table if not exists public.couple_histories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  couple_id uuid references public.couples(id) not null,
  role text not null check (role in ('inviter', 'invitee')),
  joined_at timestamptz not null default now(),
  left_at timestamptz
);

-- 互动记录
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  type text not null check (type in ('feed', 'pet', 'chat')),
  payload jsonb,
  delta jsonb,
  created_at timestamptz default now()
);

-- 开启 Realtime（宠物表）
alter publication supabase_realtime add table public.pets;

-- RLS 策略（Row Level Security）
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.pets enable row level security;
alter table public.couple_histories enable row level security;
alter table public.interactions enable row level security;

-- profiles：本人可读写
create policy "profiles: self access" on public.profiles
  for all using (auth.uid() = id);

-- couples：参与者可读
create policy "couples: participant read" on public.couples
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- pets：通过 couple 验证
create policy "pets: couple member read" on public.pets
  for select using (
    exists (
      select 1 from public.couples c
      where c.id = pets.couple_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- couple_histories：本人可读
create policy "histories: self read" on public.couple_histories
  for select using (auth.uid() = user_id);
