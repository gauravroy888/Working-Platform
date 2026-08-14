/**
 * Curriculum Schema Setup Script - Using Anon Key + RPC
 * Creates: classes, subjects tables + extends course_chapters
 */

const SUPABASE_URL = 'https://qmyrxvtbzlbnvzxypnus.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXJ4dnRiemxibnZ6eHlwbnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjA4OTcsImV4cCI6MjA5NTM5Njg5N30.ABvW_oBzXC2Ffxm5ToLh6t4WmdKPdtg9SyfeAE76iJo';

const headers = {
  'apikey': ANON_KEY,
  'Authorization': 'Bearer ' + ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const sb = (path, opts = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
  headers: { ...headers, ...opts.headers },
  ...opts
});

async function run() {
  console.log('=== Curriculum Schema Setup ===\n');

  // 1. Check what tables already exist
  console.log('1. Checking existing tables...');

  const tableChecks = ['classes', 'subjects', 'course_chapters'];
  for (const table of tableChecks) {
    const r = await sb(`${table}?select=id&limit=1`);
    const d = await r.json();
    if (r.ok) {
      console.log(`  ✅ Table '${table}' exists`);
    } else {
      console.log(`  ❌ Table '${table}' not found:`, d.message || d.code);
    }
  }

  // 2. Try inserting into classes (will confirm if table exists or needs creation)
  console.log('\n2. Attempting to seed classes...');

  const classesToSeed = [
    { name: 'Class 6th', display_order: 6, status: 'Active' },
    { name: 'Class 7th', display_order: 7, status: 'Active' },
    { name: 'Class 8th', display_order: 8, status: 'Active' },
    { name: 'Class 9th', display_order: 9, status: 'Active' },
    { name: 'Class 10th', display_order: 10, status: 'Active' },
    { name: 'Class 11th', display_order: 11, status: 'Active' },
    { name: 'Class 12th', display_order: 12, status: 'Active' },
    { name: 'Language & Communication', display_order: 20, status: 'Active' },
    { name: 'Critical Thinking & Logic', display_order: 21, status: 'Active' },
    { name: 'Mathematical Thinking', display_order: 22, status: 'Active' },
  ];

  for (const cls of classesToSeed) {
    const r = await sb('classes', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(cls)
    });
    const d = await r.json();
    if (r.ok) {
      const created = Array.isArray(d) ? d[0] : d;
      if (created && created.id) {
        console.log(`  ✅ Created: ${cls.name}`);
      } else {
        console.log(`  ⏭️ Already exists: ${cls.name}`);
      }
    } else {
      console.log(`  ❌ ${cls.name} failed:`, (d.message || d.code || JSON.stringify(d)).substring(0, 100));
    }
  }

  // 3. Verify final state
  console.log('\n3. Final verification...');
  const finalClasses = await sb('classes?select=id,name,display_order&order=display_order');
  const fc = await finalClasses.json();
  if (Array.isArray(fc)) {
    console.log(`✅ classes table has ${fc.length} records:`);
    fc.forEach(c => console.log(`   ${c.display_order}. ${c.name} (${c.id.substring(0,8)}...)`));
  } else {
    console.log('❌ classes table check failed:', JSON.stringify(fc).substring(0, 200));
    console.log('\n⚠️  MANUAL ACTION NEEDED:');
    console.log('The classes and subjects tables do not exist yet.');
    console.log('Please run the following SQL in your Supabase Dashboard → SQL Editor:\n');
    console.log(`
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) UNIQUE NOT NULL,
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    icon VARCHAR(20) DEFAULT '📚',
    description TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS subject_name VARCHAR(120) DEFAULT '';
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS custom_modalities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS modality_urls JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS experience_url TEXT DEFAULT '';
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS experiments_url TEXT DEFAULT '';
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS quiz_url TEXT DEFAULT '';
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS mixed_reality_url TEXT DEFAULT '';
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS stories_url TEXT DEFAULT '';
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS experience_ready BOOLEAN DEFAULT false;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS experiments_ready BOOLEAN DEFAULT false;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS quiz_ready BOOLEAN DEFAULT false;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS mixed_reality_ready BOOLEAN DEFAULT false;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS stories_ready BOOLEAN DEFAULT false;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.course_chapters ADD COLUMN IF NOT EXISTS chapter_slug VARCHAR(200) DEFAULT '';

-- Enable RLS and grant public read
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anon insert classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Anon update subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Anon delete classes" ON public.classes FOR DELETE USING (true);
CREATE POLICY "Anon delete subjects" ON public.subjects FOR DELETE USING (true);

-- Seed initial classes
INSERT INTO public.classes (name, display_order) VALUES
  ('Class 6th', 6), ('Class 7th', 7), ('Class 8th', 8),
  ('Class 9th', 9), ('Class 10th', 10), ('Class 11th', 11), ('Class 12th', 12),
  ('Language & Communication', 20), ('Critical Thinking & Logic', 21), ('Mathematical Thinking', 22)
ON CONFLICT (name) DO NOTHING;
    `);
  }

  console.log('\n=== Done ===');
}

run().catch(console.error);
