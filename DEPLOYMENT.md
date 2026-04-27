# Deployment Guide: YouTube SEO Pro

## 1. Build the Extension (CRITICAL)
Chrome cannot run the files you see in the folder directly. You must "build" them into a package Chrome understands:
1. In the terminal, run: `npm run build`
2. This creates a new folder called **`dist`**.
3. **WHEN LOADING INTO CHROME**: Select the **`dist`** folder, NOT the main project folder.

## 2. Supabase Setup
1. Create a project on [Supabase](https://supabase.com).
2. Run the following SQL in the **SQL Editor**:
   ```sql
   create table generations (
     id uuid primary key default uuid_generate_v4(),
     video_id text not null,
     tone text not null,
     result jsonb not null,
     created_at timestamp with time zone default now()
   );
   create index idx_generations_video_id on generations(video_id);
   ```
3. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Settings > API.

## 3. Backend Deployment (Railway)
1. Link your GitHub repo to [Railway](https://railway.app).
2. Set these variables in Railway:
   - `OPENAI_API_KEY`: Your key.
   - `SUPABASE_URL`: From step 2.
   - `SUPABASE_ANON_KEY`: From step 2.
3. Once deployed, get your Railway App URL (e.g., `https://project-production.up.railway.app`).

## 4. Final Extension Build
1. In your local `.env` file, set `VITE_API_URL` to your Railway URL from Step 3.
2. Run `npm run build` again.
3. Reload the `dist` folder in `chrome://extensions`.

## Architecture Notes
- **Frontend**: React + Vite + Tailwind (matching provided screenshots).
- **Backend**: Express server acts as a proxy for AI calls and Supabase caching to keep keys secure.
- **AI**: Uses `gemini-3-flash-preview` for high-speed, high-context SEO generation.
