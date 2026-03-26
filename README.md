# AI Secure Data Intelligence Platform

An advanced full-stack application designed to act as an **AI Gateway**, **Data Scanner**, **Log Analyzer**, and **Risk Engine**. This platform provides real-time security intelligence by scanning various data sources for sensitive information, security risks, and anomalies.

## 🚀 Tech Stack

### Frontend
- **React 19**: Modern UI library for building the interactive dashboard.
- **Tailwind CSS 4**: Utility-first CSS framework for rapid and responsive styling.
- **Lucide React**: Beautifully simple, pixel-perfect icons.
- **Motion (framer-motion)**: Production-ready animations for a smooth user experience.
- **Vite**: Next-generation frontend tooling for fast development.

### Backend
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **Multer**: Middleware for handling `multipart/form-data`, used for file uploads.
- **PDF-parse**: Library for extracting text from PDF files.
- **Mammoth**: Specialized tool for converting `.docx` documents to plain text.
- **TSX**: TypeScript execution engine for running the server directly.

### AI & Intelligence
- **Google Gemini API (@google/genai)**: Powering the intelligent log analysis and security insights.
- **Regex Engine**: High-performance pattern matching for immediate detection of emails, API keys, passwords, and stack traces.

## 📂 Project Structure

```text
├── server.ts              # Main Express server (API routes & Vite middleware)
├── src/
│   ├── App.tsx            # Main React Dashboard component
│   ├── main.tsx           # React entry point
│   ├── index.css          # Global styles (Tailwind CSS)
│   └── lib/
│       └── utils.ts       # Tailwind class merging utility
├── metadata.json          # Application metadata (name, description)
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build and dev server configuration
```

## ✨ Key Features

- **Multi-Source Ingestion**: Analyze raw text, SQL queries, live chat, and uploaded files.
- **File Support**: Deep scanning of `.log`, `.txt`, `.pdf`, and `.docx` files.
- **Security Scanner**: 
    - Detects **Critical** risks like hardcoded passwords.
    - Identifies **High** risks like exposed API keys and tokens.
    - Flags **Medium** risks like stack traces and debug leaks.
    - Extracts **Low** risk PII like emails and phone numbers.
- **AI Insights**: Generates human-readable summaries and security warnings using Google Gemini.
- **Risk Scoring**: Provides a 0-10 risk score and classifies data into risk levels.
- **Data Masking**: Optional masking of sensitive data during analysis.

## 🛠️ Setup & Configuration

### Environment Variables
The application requires the following environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key (configure in the Secrets panel).
- `APP_URL`: Automatically injected by the platform for self-referential links.

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### POST `/api/analyze`
Analyzes content for security risks.

**Request Body:**
- `input_type`: `text | file | sql | chat | log`
- `content`: (String) Raw text content (if not uploading a file)
- `file`: (File) Uploaded file (optional)
- `options`: (JSON) `{ "mask": boolean, "block_high_risk": boolean }`

**Response:**
```json
{
  "summary": "Log contains sensitive credentials",
  "content_type": "log",
  "findings": [...],
  "risk_score": 8,
  "risk_level": "high",
  "insights": [...]
}
```

## 🛡️ Security Note
This platform is designed for intelligence and scanning purposes. Always ensure you have the necessary permissions before scanning sensitive log files or datasets.
