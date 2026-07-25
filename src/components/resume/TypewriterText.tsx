import { useState, useEffect, useRef } from 'react'

export function useTypewriter(speed: number = 30) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const fullTextRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = (text: string) => {
    fullTextRef.current = text
    setDisplayText('')
    setIsComplete(false)

    if (timerRef.current) clearInterval(timerRef.current)

    let i = 0
    timerRef.current = setInterval(() => {
      if (i < text.length) {
        const chunkSize = Math.floor(Math.random() * 2) + 1
        setDisplayText(text.slice(0, i + chunkSize))
        i += chunkSize
      } else {
        if (timerRef.current) clearInterval(timerRef.current)
        setIsComplete(true)
      }
    }, speed)
  }

  const complete = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDisplayText(fullTextRef.current)
    setIsComplete(true)
  }

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDisplayText('')
    setIsComplete(false)
    fullTextRef.current = ''
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { displayText, isComplete, start, complete, reset }
}
