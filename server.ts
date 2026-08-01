import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashing if API key is not present initially
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it via the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API Route: SEO Keyword Research & Analysis Assistant
app.post("/api/seo-assistant", async (req, res) => {
  try {
    const { topic, businessType, location, targetAudience } = req.body;

    if (!topic || !businessType) {
      return res.status(400).json({ error: "Topic/Keyword and Business Type are required fields." });
    }

    const ai = getAiClient();

    const systemInstruction = `You are the core backend engine of the "AI-Powered SEO & Keyword Research Assistant", a high-performance tool architected and built by Gaurav More.
Your purpose is to act as an elite SEO Technologist & Digital Marketing strategist.
Analyze the user's topic, business type, target audience, and target location.
Provide realistic, professional keyword metrics and competitor strategies. Do NOT hallucinate metric numbers. Provide professional search volume estimates, keyword difficulties, and actionable marketing content plans.
All answers must strictly conform to the provided JSON schema. Ensure the recommendations are tailored to the business type and target audience.`;

    const prompt = `Perform comprehensive keyword research and competitor analysis for:
- Topic/Seed Keyword: ${topic}
- Business Type: ${businessType}
- Target Audience: ${targetAudience || "General"}
- Target Location: ${location || "National/Global"}

Develop a strategic plan with 4 high-opportunity keywords, competitor insights, and a concrete action plan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            niche: { type: Type.STRING, description: "Identified SEO niche or industry sector" },
            overview: { type: Type.STRING, description: "Executive summary of the keyword landscape and opportunities" },
            metrics: {
              type: Type.OBJECT,
              properties: {
                totalKeywordsAnalyzed: { type: Type.INTEGER, description: "Number of keywords analysed (suggest 4)" },
                averageDifficulty: { type: Type.STRING, description: "Average keyword difficulty description (e.g. Easy, Medium, High)" },
                marketCompetitiveness: { type: Type.STRING, description: "Market competitiveness summary" }
              },
              required: ["totalKeywordsAnalyzed", "averageDifficulty", "marketCompetitiveness"]
            },
            keywords: {
              type: Type.ARRAY,
              description: "List of 4 high-value keywords with SEO metrics",
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  volume: { type: Type.INTEGER, description: "Estimated monthly search volume" },
                  difficulty: { type: Type.INTEGER, description: "Keyword difficulty percentage (0-100)" },
                  cpc: { type: Type.STRING, description: "Estimated CPC (e.g., $1.50)" },
                  intent: { type: Type.STRING, description: "Intent (Informational, Transactional, Commercial, Navigational)" },
                  strategy: { type: Type.STRING, description: "Content outline / optimization strategy" }
                },
                required: ["keyword", "volume", "difficulty", "cpc", "intent", "strategy"]
              }
            },
            competitorAnalysis: {
              type: Type.ARRAY,
              description: "Targeted competitor analysis and gaps",
              items: {
                type: Type.OBJECT,
                properties: {
                  competitorName: { type: Type.STRING, description: "Name of simulated competitor or organic lead" },
                  weakness: { type: Type.STRING, description: "SEO weakness or opportunity to capitalize on" },
                  targetKeyword: { type: Type.STRING, description: "Specific keyword they rank for that we can target" }
                },
                required: ["competitorName", "weakness", "targetKeyword"]
              }
            },
            actionPlan: {
              type: Type.ARRAY,
              description: "Step-by-step roadmap for execution",
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING, description: "Step name or milestone" },
                  details: { type: Type.STRING, description: "Specific execution details" }
                },
                required: ["step", "details"]
              }
            }
          },
          required: ["niche", "overview", "metrics", "keywords", "competitorAnalysis", "actionPlan"]
        }
      }
    });

    const report = JSON.parse(response.text || "{}");
    res.json(report);
  } catch (error: any) {
    console.error("Error in SEO Assistant API:", error);
    res.status(500).json({ error: error?.message || "An error occurred while generating your report." });
  }
});

// 2. Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 3. Setup Vite Middleware or Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on host 0.0.0.0, port ${PORT}`);
  });
}

startServer();
