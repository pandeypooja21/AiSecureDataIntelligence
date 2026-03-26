import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import 'dotenv/config';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // AI Analysis Logic
  const analyzeContent = async (type: string, content: string, options: any) => {
    const findings: any[] = [];
    const lines = content.split('\n');

    // Regex Patterns
    const patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      api_key: /(?:api_key|apikey|secret|token|auth|password|passwd)[\s:=]+['"]?([a-zA-Z0-9-_]{16,})['"]?/gi,
      password: /password[\s:=]+['"]?([^'"\s]{6,})['"]?/gi,
      stack_trace: /at\s+([a-zA-Z0-9._$<>]+)\s*\(([^)]+)\)/g
    };

    lines.forEach((line, index) => {
      // Check for patterns
      Object.entries(patterns).forEach(([pType, regex]) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          findings.push({
            type: pType,
            risk: pType === 'password' ? 'critical' : (pType === 'api_key' ? 'high' : (pType === 'stack_trace' ? 'medium' : 'low')),
            line: index + 1,
            value: match[0]
          });
        }
      });
    });

    // AI Insights using Gemini
    let insights: string[] = [];
    let summary = "Analysis complete.";
    let riskScore = findings.length > 0 ? Math.min(10, findings.reduce((acc, f) => acc + (f.risk === 'critical' ? 5 : f.risk === 'high' ? 3 : 1), 0)) : 0;

    const apiKey = process.env.GEMINI_API_KEY;
    const isPlaceholder = apiKey === "MY_GEMINI_API_KEY" || !apiKey;

    if (!isPlaceholder) {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey! });
        
        const prompt = `Analyze the following ${type} content for security risks, anomalies, and sensitive data leaks. 
        Content:
        ${content.substring(0, 5000)}
        
        Provide a JSON response with:
        - summary: A brief overview
        - insights: An array of strings describing specific security concerns or anomalies
        - risk_score: A number from 0-10
        - risk_level: "low", "medium", "high", or "critical"`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const aiResponse = JSON.parse(response.text || '{}');
        
        summary = aiResponse.summary || summary;
        insights = aiResponse.insights || [];
        riskScore = Math.max(riskScore, aiResponse.risk_score || 0);
      } catch (e) {
        console.error("AI Analysis failed:", e);
        insights.push("AI Analysis failed due to API configuration. Falling back to pattern detection.");
      }
    } else {
      insights.push("AI Analysis is disabled because no valid GEMINI_API_KEY was found. Please configure it in the Secrets panel.");
    }

    const riskLevel = riskScore >= 8 ? 'critical' : (riskScore >= 6 ? 'high' : (riskScore >= 3 ? 'medium' : 'low'));

    return {
      summary,
      content_type: type,
      findings,
      risk_score: riskScore,
      risk_level: riskLevel,
      action: options.mask ? "masked" : "monitored",
      insights
    };
  };

  // API Routes
  app.post('/api/analyze', upload.single('file'), async (req: any, res) => {
    try {
      let { input_type, content, options } = req.body;
      if (typeof options === 'string') options = JSON.parse(options);

      if (req.file) {
        const buffer = req.file.buffer;
        const ext = path.extname(req.file.originalname).toLowerCase();
        
        if (ext === '.pdf') {
          const data = await pdf(buffer);
          content = data.text;
          input_type = 'file';
        } else if (ext === '.docx') {
          const data = await mammoth.extractRawText({ buffer });
          content = data.value;
          input_type = 'file';
        } else {
          content = buffer.toString('utf-8');
          input_type = ext === '.log' ? 'log' : 'file';
        }
      }

      if (!content) {
        return res.status(400).json({ error: "No content provided" });
      }

      const result = await analyzeContent(input_type, content, options || {});
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
