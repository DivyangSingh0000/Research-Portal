import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { extractTextFromPdfBuffer, extractPdfSections } from './src/pdfExtractor.js';
import { refineSections, splitSectionsWithContent } from './src/sectionDetector.js';
import { generateDetailedSummary } from './src/summarizer.js';
import { RAGVectorStore, askQuestion } from './src/ragChat.js';
import { PaperTopicMap } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Multer in-memory storage for handling PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/static', express.static(path.join(process.cwd(), 'static')));
app.use(express.static(path.join(process.cwd(), 'public')));

// Global state in memory (matching app.py state)
let fullText = '';
let paperTopics: PaperTopicMap = {};
let vectorDb: RAGVectorStore | null = null;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasDocument: fullText.length > 0 });
});

// Main UI page
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'templates', 'index.html'));
});

// 1. Upload PDF with robust error handling and accepting any field name
app.post('/upload', (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    let file = req.file;
    if (!file && req.files) {
      if (Array.isArray(req.files) && req.files.length > 0) {
        file = req.files[0];
      } else if (typeof req.files === 'object') {
        const fileList = Object.values(req.files).flat();
        if (fileList.length > 0) file = fileList[0];
      }
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF buffer
    const extractedText = await extractTextFromPdfBuffer(file.buffer);
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the uploaded PDF.' });
    }

    fullText = extractedText;

    // Detect and refine sections
    const extractedSections = extractPdfSections(fullText);
    const refinedSections = await refineSections(extractedSections);
    paperTopics = splitSectionsWithContent(fullText, refinedSections);

    // Initialize in-memory RAG vector store
    vectorDb = new RAGVectorStore(fullText);

    const topicsList = Object.keys(paperTopics);
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const estReadingTimeMin = Math.ceil(wordCount / 200);

    return res.json({ 
      topics: topicsList,
      stats: {
        wordCount,
        sectionCount: topicsList.length,
        estReadingTimeMin,
        charCount: fullText.length
      }
    });
  } catch (error: any) {
    console.error('Error during upload and extraction:', error);
    return res.status(500).json({ error: error.message || 'Internal server error while processing PDF' });
  }
});

// 2. Section Summary
app.post('/summary', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic parameter is required' });
    }

    const topicContent = paperTopics[topic] || fullText || 'No summary available.';
    const summary = await generateDetailedSummary(topicContent);

    return res.json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

// 3. RAG Chat
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    if (!vectorDb && fullText) {
      vectorDb = new RAGVectorStore(fullText);
    }

    const aiResponse = await askQuestion(fullText, vectorDb, message);
    return res.json({ response: aiResponse });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

// Global JSON Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Server Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'An unexpected server error occurred' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Research Paper Analyzer Server running on http://0.0.0.0:${PORT}`);
});
