'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, FileText, Check, AlertCircle } from 'lucide-react'
import { uploadResume } from '@/lib/resume-store'
import { readFileAsText } from '@/lib/file-utils'
import type { Resume } from '@/lib/types'

interface FileUploadProps {
  onUploadSuccess: (data: Resume) => void
}

async function parseTextToResume(text: string): Promise<Resume> {
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!response.ok) throw new Error('解析失败')
  return response.json() as Promise<Resume>
}

async function extractPdfText(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)))
  const response = await fetch("/api/parse-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: base64 })
  })
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || `PDF 解析失败 (${response.status})`)
  }
  const data = await response.json()
  return data.text
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fileName, setFileName] = useState('')

  const handleFile = useCallback(async (file: File) => {
    try {
      setStatus('loading')
      setFileName(file.name)

      let resume: Resume

      if (file.name.endsWith('.json')) {
        const text = await readFileAsText(file)
        resume = JSON.parse(text)
        if (!resume.personal || !resume.skills) throw new Error('无效的简历 JSON 格式')
      } else if (file.name.match(/\.md$/i)) {
        const text = await readFileAsText(file)
        resume = await parseTextToResume(text)
      } else if (file.name.match(/\.pdf$/i)) {
        const text = await extractPdfText(file)
        resume = await parseTextToResume(text)
      } else {
        throw new Error('仅支持 JSON、MD、PDF 格式')
      }

      await uploadResume(resume)
      setStatus('success')
      onUploadSuccess(resume)
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err: any) {
        setStatus('error')
        const errorMessage = err?.message || err?.toString() || '上传失败'
        setErrorMsg(errorMessage)
        console.error('Upload error:', err)
        console.error('Error details:', { 
          message: err?.message, 
          stack: err?.stack, 
          name: err?.name,
          response: err?.response
        })
        setTimeout(() => setStatus('idle'), 4000)
      }
  }, [onUploadSuccess])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const icon = status === 'idle' ? <Upload className="h-4 w-4" />
    : status === 'loading' ? <FileText className="h-4 w-4 animate-pulse text-brand" />
    : status === 'success' ? <Check className="h-4 w-4 text-green-500" />
    : <AlertCircle className="h-4 w-4 text-red-400" />

  const label = status === 'idle' ? '上传简历'
    : status === 'loading' ? `解析 ${fileName}...`
    : status === 'success' ? '上传成功'
    : errorMsg

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,.md,.markdown,.pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          if (e.currentTarget) e.currentTarget.value = ''
        }}
      />
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        title="支持 JSON / Markdown / PDF 格式"
        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm backdrop-blur-sm transition-all ${
          dragOver ? 'border-brand bg-brand/10' : 'bg-white/60 hover:bg-white/80'
        }`}
      >
        {icon}
        <span className="max-sm:hidden">{label}</span>
      </div>
    </>
  )
}
