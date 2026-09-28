# 🎓 ResearchPortal — AI Research Assistant for Students & Scholars

> **Demystifying complex academic papers in seconds.** Designed for university students, graduate researchers, and curious minds to accelerate literature reviews, exam preparation, and thesis writing.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/Gemini_3.6_Flash-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)

---

## 🌟 Why ResearchPortal?

Reading 30+ page academic papers with dense mathematical formulas, complex methodology, and academic jargon is exhausting. **ResearchPortal** transforms that experience:

- ⚡ **5x Faster Literature Reviews**: Extract structure, key findings, and methodologies automatically.
- 💡 **"Explain in Simple Terms"**: Translate heavy mathematical proofs and algorithmic concepts into intuitive real-world analogies.
- 🎯 **Grounded Q&A (Zero Hallucinations)**: Vector-indexed retrieval guarantees that all answers come directly from your uploaded manuscript.
- 📚 **Thesis, Seminar & Viva Ready**: Ask targeted questions on baseline comparisons, dataset nuances, and study limitations.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **📄 Smart PDF Ingestion** | Drag-and-drop support for ArXiv, IEEE, ACM, Springer, Nature, and university thesis papers (up to 50MB). |
| **📑 Section Detection & Mapping** | Automatically detects and organizes paper sections (Abstract, Methodology, Experiments, Ablation, Discussion). |
| **🧠 Multi-Tier Synthesis** | Generates executive summaries, key takeaways, and a dedicated **Student & Layman Explanation**. |
| **💬 Interactive Academic Tutor** | RAG-powered chat grounded in the paper context with one-click prompts for methodologies, datasets, and limitations. |
| **📊 Visual Study Analytics** | Real-time visual metrics for keyword distribution, section flow, and document reading times. |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Student / Browser UI                     │
│      (HTML5 / Modern Editorial Scholar UI / Canvas Charts)  │
└──────────────────────────────┬──────────────────────────────┘
                               │  Multipart PDF & JSON API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Express.js & TypeScript Server               │
├─────────────────────────────────────────────────────────────┤
│  1. Ingestion:     pdf-parse buffer stream extraction       │
│  2. Partitioning:  Regex & LLM-assisted section detector    │
│  3. Vector Store:  In-Memory RAG Chunking (500ch / 100ov)   │
│  4. Reasoning:     Gemini 3.6 Flash via @google/genai SDK   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A Gemini API key

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/DivyangSingh0000/AI-Research-Paper-Analysis-Bot.git
cd AI-Research-Paper-Analysis-Bot
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

The portal will be live at `http://localhost:3000`.

---

## 📖 How to Use for Coursework & Thesis

1. **Upload your Manuscript**: Drag and drop any research PDF into the **Paper Lab**.
2. **Review Key Metrics**: Check estimated reading time, section breakdown, and key topic distribution.
3. **Generate Section Summaries**: Select any identified topic (e.g. *Methodology* or *Experiments*) to view structured breakdowns and layman analogies.
4. **Chat with the Research Tutor**: Use quick chips or ask custom questions:
   - *"What is the core problem and contribution of this paper?"*
   - *"Explain the methodology and approach in simple beginner-friendly terms."*
   - *"What datasets, baseline models, and evaluation metrics were used?"*
   - *"What are the main limitations, weaknesses, and future work mentioned?"*

---

## 📂 Project Structure

```
├── src/
│   ├── pdfExtractor.ts      # Stream & buffer PDF text extraction
│   ├── sectionDetector.ts   # Section detection & structural splitting
│   ├── summarizer.ts        # Gemini-powered multi-tier student summarizer
│   ├── ragChat.ts           # In-memory vector store & grounded Q&A tutor
│   ├── ragEngine.ts         # High-level RAG orchestration
│   └── types.ts             # TypeScript interfaces & types
├── templates/
│   └── index.html           # Single-page scholar application UI
├── static/                  # Static design assets
├── server.ts                # Express application entry point
├── package.json             # Node dependencies & build scripts
├── metadata.json            # Application metadata
└── README.md                # Project documentation
```

---

## 🤝 Contributing

Contributions from students, educators, and researchers are welcome! Feel free to submit pull requests, open issues for feature requests, or propose new study tools.

---

## 📄 License

Distributed under the MIT License. Built to empower students and researchers everywhere.
