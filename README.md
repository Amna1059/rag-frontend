# Document Q&A — Frontend

A React interface for asking questions about any document. Upload a PDF, DOCX, or TXT file, and ask it anything — answers come back grounded in the document's actual content, not general AI knowledge.

This is the frontend for a Retrieval-Augmented Generation (RAG) system. The backend lives in a separate repo: [ai-eng-portfolio](https://github.com/Amna1059/ai-eng-portfolio).

## Features

- Drag-and-drop document upload (PDF, DOCX, TXT)
- Real-time Q&A with source-grounded answers
- Session-based chat — ask multiple questions about the same document without re-uploading
- Distinctive, custom-designed interface (not a default component-library look)

## Tech Stack

React · Vite · Fetch API · CSS (no UI framework — hand-built design system)

## Design

The interface leans into the idea of "reading and excavating" a document rather than a generic chatbot look — a dark parchment palette, a serif display typeface (Fraunces), and an animated scan effect during document upload to reflect what's actually happening: the document being read and indexed.

## Run locally

Requires the [backend](https://github.com/Amna1059/ai-eng-portfolio) running at `http://127.0.0.1:8000`.

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## How it works

1. User uploads a document → sent to the backend `/upload` endpoint
2. Backend chunks, embeds, and indexes the document, returns a `session_id`
3. User asks a question → sent to `/ask` along with the `session_id`
4. Backend retrieves the most relevant passages and generates a grounded answer
5. Answer is displayed along with how many source passages it was drawn from

## Author

**Amna Iftikhar** — BSc Computer Science, LUMS
[LinkedIn](https://www.linkedin.com/in/amna1059/) · [GitHub](https://github.com/Amna1059)
