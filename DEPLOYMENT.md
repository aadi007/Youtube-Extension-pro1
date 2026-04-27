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
1. **GitHub Sync**: Push your code to GitHub and link the repo to [Railway](https://railway.app).
2. **Environment Variables**: In Railway, go to the **Variables** tab and add:
   - `OPENAI_API_KEY`: Your OpenAI Secret Key.
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `NODE_ENV`: Set this to `production`.
3. **Automatic Build**: Railway will automatically see the `build` script in `package.json`, compile your code, and start the server using the compiled file.
4. **URL**: Once deployed, Railway provides a public URL (e.g., `https://your-app.up.railway.app`). Use this URL in your frontend `.env` as `VITE_API_URL`.

### Important Notes
- **Why was I getting a ".ts" error?**: Production servers (Node.js) don't speak TypeScript natively. I added a build step that converts your TypeScript into standard JavaScript. 
- **Do I upload node_modules?**: NO. Railway installs them for you.
- **Port**: The backend is configured to run on Port 3000, which is standard.

## 4. Final Extension Build
1. In your local `.env` file, set `VITE_API_URL` to your Railway URL from Step 3.
2. Run `npm run build` again.
3. Reload the `dist` folder in `chrome://extensions`.

## Architecture Notes
- **Frontend**: React + Vite + Tailwind (matching provided screenshots).
- **Backend**: Express server acts as a proxy for AI calls and Supabase caching to keep keys secure.
- **AI**: Uses `gemini-3-flash-preview` for high-speed, high-context SEO generation.
