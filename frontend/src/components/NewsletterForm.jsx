import React, { useState } from 'react'
import axios from 'axios'
import FileUploader from './FileUploader'
import Preview from './Preview'

export default function NewsletterForm() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Professional')
  const [audience, setAudience] = useState('Customers')
  const [length, setLength] = useState('Medium')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [newsletter, setNewsletter] = useState(null)
  const [keyPoints, setKeyPoints] = useState([
    { id: 1, text: '', checked: false },
  ])

  const handleGenerate = async () => {
    setLoading(true)
    const selectedPoints = keyPoints
      .filter((p) => p.text.trim())
      .map((p) => `${p.checked ? '☑' : '•'} ${p.text.trim()}`)

    const enhancedTopic =
      selectedPoints.length > 0
        ? `${topic}\n\nImportant points:\n${selectedPoints.join('\n')}`
        : topic

    const form = new FormData()
    form.append('topic', enhancedTopic)
    form.append('tone', tone)
    form.append('audience', audience)
    form.append('length', length)
    files.forEach((f) => form.append('files', f))

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/generate-newsletter',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setNewsletter(res.data)
    } catch (e) {
      console.error('Error generating newsletter', e)
      alert('Error generating newsletter. Check backend logs.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    const form = new FormData()
    form.append('topic', topic)
    form.append('tone', tone)
    form.append('audience', audience)
    form.append('length', length)
    files.forEach((f) => form.append('files', f))

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/export/pdf', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      })

      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'newsletter.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error downloading PDF', e)
      alert('Error downloading PDF. Check backend logs.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handlePointTextChange = (id, value) => {
    setKeyPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, text: value } : p)),
    )
  }

  const handlePointCheckedToggle = (id) => {
    setKeyPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)),
    )
  }

  const handleAddPoint = () => {
    setKeyPoints((prev) => [
      ...prev,
      { id: prev.length ? prev[prev.length - 1].id + 1 : 1, text: '', checked: false },
    ])
  }

  const handleRemovePoint = (id) => {
    setKeyPoints((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>AI-powered generation</span>
        </div>
        <span>Hybrid mode · Topic + documents</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Input</p>
            <div>
              <label
                htmlFor="topic-input"
                className="block text-sm md:text-base font-semibold text-gray-800 mb-1"
              >
                Topic or theme
              </label>
              <textarea
                id="topic-input"
                className="w-full border rounded-lg px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                rows={3}
                placeholder="e.g. Q4 product launch update, monthly customer success highlights"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Describe what the newsletter should cover. You can also upload existing content below.
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-500">
                  Highlight important talking points
                </p>
                <div className="space-y-1 rounded-lg border border-dashed border-gray-200 bg-slate-50/80 p-2">
                  {keyPoints.map((point) => (
                    <div
                      key={point.id}
                      className="flex items-center gap-2 text-xs text-gray-700"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={point.checked}
                        onChange={() => handlePointCheckedToggle(point.id)}
                      />
                      <input
                        type="text"
                        className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Key product update, promo, or metric you want highlighted"
                        value={point.text}
                        onChange={(e) => handlePointTextChange(point.id, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(point.id)}
                        className="text-[10px] text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="mt-1 inline-flex items-center text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    + Add another point
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">AI settings</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div>
                <label
                  htmlFor="tone-select"
                  className="block text-xs md:text-sm font-medium text-gray-800 mb-1"
                >
                  Tone
                </label>
                <select
                  id="tone-select"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Playful</option>
                  <option>Formal</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="audience-select"
                  className="block text-xs md:text-sm font-medium text-gray-800 mb-1"
                >
                  Audience
                </label>
                <select
                  id="audience-select"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <option>Customers</option>
                  <option>Internal Team</option>
                  <option>Executives</option>
                  <option>Stakeholders</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="length-select"
                  className="block text-xs md:text-sm font-medium text-gray-800 mb-1"
                >
                  Length
                </label>
                <select
                  id="length-select"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  <option>Short</option>
                  <option>Medium</option>
                  <option>Long</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Documents</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload supporting documents
              </label>
              <FileUploader files={files} setFiles={setFiles} />
              <p className="mt-1 text-xs text-gray-500">
                Attach PDFs, DOCX, PPT, or TXT files. The AI will extract insights and blend them with your topic.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              {loading && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
              )}
              {loading ? 'AI is generating your newsletter…' : 'Generate Newsletter'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center px-4 py-2 ml-3 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloadingPdf ? 'Downloading PDF…' : 'Download PDF'}
            </button>
            <p className="mt-1 text-xs text-gray-500">
              The AI will assemble a structured newsletter with headline, sections, CTA, and summary.
            </p>
          </div>
        </div>

        <div className="border rounded-xl bg-slate-50/80 p-4 overflow-auto max-h-[520px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">AI output preview</h2>
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              {loading ? 'Thinking…' : 'Ready'}
            </span>
          </div>
          <Preview newsletter={newsletter} loading={loading} />
        </div>
      </div>
    </div>
  )
}
