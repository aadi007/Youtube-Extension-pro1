import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Setup
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // API: GENERATE CONTENT (YouTube SEO)
  app.post("/api/generate", async (req, res) => {
    try {
      const { videoId, tone = "Professional", transcript } = req.body;

      if (!videoId || !transcript) {
        return res.status(400).json({ error: "Missing videoId or transcript" });
      }

      // 1. Check Supabase Cache first
      if (supabase) {
        const { data: cached } = await supabase
          .from("generations")
          .select("result")
          .eq("video_id", videoId)
          .eq("tone", tone)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (cached) {
          return res.json(cached.result);
        }
      }

      // 2. No cache? Ask OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert YouTube SEO specialist. Generate high-quality SEO content. Tone: ${tone}. 
            Return JSON with: timestamps (array of {time, title}), titles (array of strings), description (string), tags (array of strings).`
          },
          {
            role: "user",
            content: `Transcript: ${transcript}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");

      // 3. Save to Supabase for next time
      if (supabase) {
        await supabase.from("generations").insert({
          video_id: videoId,
          tone,
          result
        });
      }

      res.json(result);
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "AI Generation failed. Check your OpenAI Key." });
    }
  });

  // Serve Frontend
  const distPath = path.join(process.cwd(), "dist");
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.json({ message: "SEO Backend API is running successfully. Connect your Frontend to this URL." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
