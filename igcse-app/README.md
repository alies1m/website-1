# IGCSE Practice App

Practice IGCSE past paper questions by subject or chapter with AI grading.

## Setup
1. Copy `.env.example` to `.env.local` and fill values:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GITHUB_TOKEN` (GitHub personal access token with models scope)
2. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
3. Install dependencies and run dev:

```bash
npm install
npm run dev
```

## Notes
- Google OAuth: Configure in Supabase Auth Providers. Set redirect to your site URL.
- AI Grading: Uses GitHub Models via OpenAI SDK (`gpt-4o-mini` by default). Override with envs if needed.