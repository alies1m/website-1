-- Enable extensions
create extension if not exists pg_trgm;
create extension if not exists vector;

-- Core tables
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  code text,
  created_at timestamptz default now()
);

create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  name text not null,
  index int not null,
  created_at timestamptz default now()
);

create table if not exists papers (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  year int not null,
  session text not null,
  paper_number text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete set null,
  paper_id uuid references papers(id) on delete set null,
  display_number text,
  title text,
  text text not null,
  parts jsonb default '[]'::jsonb, -- [{label, text, total_marks}]
  mark_scheme text,
  total_marks int not null default 0,
  order_index int,
  created_at timestamptz default now()
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  subject_id uuid references subjects(id) on delete set null,
  question_id uuid references questions(id) on delete set null,
  awarded_marks numeric not null default 0,
  total_marks numeric not null default 0,
  ratio numeric generated always as (case when total_marks > 0 then awarded_marks/total_marks else 0 end) stored,
  answer_text text,
  feedback jsonb,
  created_at timestamptz default now()
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  name text not null,
  bio text,
  booking_url text,
  image_url text,
  created_at timestamptz default now()
);

-- Useful view for ads
create or replace view teachers_view as
select t.*, s.name as subject_name from teachers t join subjects s on s.id = t.subject_id;

-- RLS policies (basic open read for catalog, private attempts)
alter table subjects enable row level security;
alter table chapters enable row level security;
alter table papers enable row level security;
alter table questions enable row level security;
alter table attempts enable row level security;
alter table teachers enable row level security;

-- Public read policies
create policy if not exists "public_read_subjects" on subjects for select using (true);
create policy if not exists "public_read_chapters" on chapters for select using (true);
create policy if not exists "public_read_papers" on papers for select using (true);
create policy if not exists "public_read_questions" on questions for select using (true);
create policy if not exists "public_read_teachers" on teachers for select using (true);

-- Attempts policies
create policy if not exists "insert_own_attempts" on attempts for insert with check (auth.uid() is null or user_id = auth.uid());
create policy if not exists "select_own_attempts" on attempts for select using (user_id = auth.uid());

-- RPC: random question by subject/chapters
create or replace function get_random_question(p_subject_id uuid, p_chapter_ids uuid[] default null)
returns jsonb language plpgsql security definer as $$
declare q record; subj subjects; pap papers; begin
  if p_chapter_ids is null or array_length(p_chapter_ids,1) is null then
    select * into q from questions where subject_id = p_subject_id order by random() limit 1;
  else
    select * into q from questions where subject_id = p_subject_id and chapter_id = any(p_chapter_ids) order by random() limit 1;
  end if;
  if q.paper_id is not null then
    select * into pap from papers where id = q.paper_id;
  end if;
  return jsonb_build_object(
    'id', q.id,
    'subject_id', q.subject_id,
    'chapter_id', q.chapter_id,
    'paper_id', q.paper_id,
    'display_number', q.display_number,
    'title', q.title,
    'text', q.text,
    'parts', q.parts,
    'mark_scheme', q.mark_scheme,
    'total_marks', q.total_marks,
    'paper_label', case when pap.id is not null then (pap.session || ' ' || pap.year || ' • Paper ' || pap.paper_number) else null end
  );
end; $$;

-- RPC: get nth question within a paper
create or replace function get_nth_paper_question(p_paper_id uuid, p_index_one_based int)
returns jsonb language plpgsql security definer as $$
declare q record; begin
  select * into q from questions where paper_id = p_paper_id order by order_index nulls last, created_at asc offset greatest(p_index_one_based-1,0) limit 1;
  return jsonb_build_object(
    'id', q.id,
    'subject_id', q.subject_id,
    'chapter_id', q.chapter_id,
    'paper_id', q.paper_id,
    'display_number', q.display_number,
    'title', q.title,
    'text', q.text,
    'parts', q.parts,
    'mark_scheme', q.mark_scheme,
    'total_marks', q.total_marks
  );
end; $$;

-- RPC: subject performance for charts
create or replace function get_subject_performance(p_user_id uuid)
returns table(subject_id uuid, subject_name text, attempts_count int, avg_ratio numeric) language sql security definer as $$
  select s.id, s.name, count(a.*) as attempts_count, coalesce(avg(a.ratio),0) as avg_ratio
  from subjects s
  left join attempts a on a.subject_id = s.id and a.user_id = p_user_id
  group by s.id, s.name
  order by s.name;
$$;

-- Seed minimal data
insert into subjects (id, name, description, code) values
  (gen_random_uuid(), 'Mathematics', 'IGCSE Mathematics 0580', '0580'),
  (gen_random_uuid(), 'Physics', 'IGCSE Physics 0625', '0625'),
  (gen_random_uuid(), 'Chemistry', 'IGCSE Chemistry 0620', '0620')
on conflict do nothing;

-- Create chapters for each subject
insert into chapters (subject_id, name, index)
select s.id, x.name, x.idx
from subjects s
join (
  values ('Numbers',1),('Algebra',2),('Geometry',3),('Measures',4),('Statistics',5)
) as x(name, idx) on true
on conflict do nothing;

-- Create a few papers per subject
insert into papers (subject_id, year, session, paper_number, description)
select s.id, y.year, y.session, y.paper_number, s.name || ' Paper'
from subjects s
join (values (2021,'May/June','2'),(2022,'Oct/Nov','2'),(2023,'May/June','2')) as y(year,session,paper_number) on true
on conflict do nothing;

-- Seed dummy questions
insert into questions (subject_id, chapter_id, paper_id, display_number, title, text, parts, mark_scheme, total_marks, order_index)
select s.id, c.id, p.id, '1', 'Linear Equations', 'Solve 2x + 3 = 11', '[]'::jsonb,
  'x = 4: award 2 marks for correct solution. 1 mark for correct rearrangement.', 2, 1
from subjects s
join chapters c on c.subject_id = s.id and c.index = 2
join papers p on p.subject_id = s.id
on conflict do nothing;

insert into questions (subject_id, chapter_id, paper_id, display_number, title, text, parts, mark_scheme, total_marks, order_index)
select s.id, c.id, p.id, '2', 'Vectors', 'Given A = (2,1) and B = (−1,4), find A + B and |A|.', '[{"label":"(a)","text":"Find A + B","total_marks":2},{"label":"(b)","text":"Find |A|","total_marks":2}]'::jsonb,
  'A+B = (1,5) (2 marks). |A| = sqrt(5) (2 marks).', 4, 2
from subjects s
join chapters c on c.subject_id = s.id and c.index = 3
join papers p on p.subject_id = s.id
on conflict do nothing;

-- Simple teachers
insert into teachers (subject_id, name, bio, booking_url, image_url)
select id, 'Mr. Ahmed', 'Experienced IGCSE teacher with 10+ years', 'https://cal.com/teacher/ahmed', 'https://i.pravatar.cc/100?img=12' from subjects where name='Mathematics'
on conflict do nothing;
insert into teachers (subject_id, name, bio, booking_url, image_url)
select id, 'Ms. Lee', 'Physics specialist and examiner', 'https://cal.com/teacher/lee', 'https://i.pravatar.cc/100?img=32' from subjects where name='Physics'
on conflict do nothing;