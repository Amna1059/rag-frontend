import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [file, setFile] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState('')
  const [chunkCount, setChunkCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const threadEndRef = useRef(null)

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, asking])

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  const handleUpload = async () => {
    if (!file) { setError('Choose a document first'); return }
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Upload failed')
      }
      const data = await res.json()
      setSessionId(data.session_id)
      setFilename(data.filename)
      setChunkCount(data.chunks_created)
      setMessages([])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleAsk = async () => {
    if (!question.trim() || !sessionId || asking) return
    const userQuestion = question
    setMessages(prev => [...prev, { role: 'user', text: userQuestion }])
    setQuestion('')
    setAsking(true)
    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question: userQuestion })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Could not get an answer')
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer, sources: data.source_count }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', text: err.message }])
    } finally {
      setAsking(false)
    }
  }

  const reset = () => {
    setSessionId(null); setFile(null); setFilename(''); setMessages([])
  }

  return (
    <div className="page">
      {!sessionId ? (
        <div className="intro">
          <div className="intro-mark">
            <span className="intro-mark-glyph">⟡</span>
          </div>
          <span className="eyebrow">Document Intelligence</span>
          <h1>Excavate<br/>your document.</h1>
          <p className="tagline">Drop in a PDF, DOCX, or TXT file. Ask it anything — it answers from what's actually written inside.</p>

          <div
            className={`dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'scanning' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files[0])} />
            {uploading && <div className="scan-bar" />}
            {file ? (
              <p className="dropzone-text">{file.name}</p>
            ) : (
              <>
                <p className="dropzone-text">Drop your document here</p>
                <p className="dropzone-sub">or click to browse</p>
              </>
            )}
          </div>

          {file && !uploading && (
            <button className="btn-primary" onClick={handleUpload}>Begin reading</button>
          )}
          {uploading && <p className="status-text">scanning every page…</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
      ) : (
        <div className="reading-room">
          <div className="doc-strip">
            <div>
              <span className="doc-label">Now reading</span>
              <span className="doc-name">{filename}</span>
            </div>
            <div className="doc-meta">
              <span className="mono">{chunkCount} passages indexed</span>
              <button className="btn-text" onClick={reset}>New document</button>
            </div>
          </div>

          <div className="thread">
            {messages.length === 0 && (
              <div className="empty-state">
                <span className="empty-glyph">⟡</span>
                <p>Try: "summarize this document" or ask something specific.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`note note-${msg.role}`}>
                {msg.role === 'user' && <p className="note-body">{msg.text}</p>}
                {msg.role === 'assistant' && (
                  <div className="excerpt-card">
                    <p className="note-body">{msg.text}</p>
                    <span className="note-source mono">
                      {msg.sources > 0 ? `excavated from ${msg.sources} passages` : 'drawn from the full document'}
                    </span>
                  </div>
                )}
                {msg.role === 'error' && <p className="note-body error-inline">⚠ {msg.text}</p>}
              </div>
            ))}
            {asking && (
              <div className="note note-assistant">
                <div className="excerpt-card">
                  <p className="note-body pulse">digging through the text…</p>
                </div>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          <div className="composer">
            <input
              type="text"
              placeholder="Ask the document a question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              disabled={asking}
            />
            <button className="btn-primary btn-compact" onClick={handleAsk} disabled={asking || !question.trim()}>
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App