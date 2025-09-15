"use client"

import { useState, useCallback, useRef } from "react"

interface NoteDetectionResult {
  note: string
  confidence: number
  timestamp: number
}

interface UseNoteDetectionReturn {
  detectedNotes: NoteDetectionResult[]
  currentNote: string | null
  isDetecting: boolean
  startDetection: () => void
  stopDetection: () => void
  clearHistory: () => void
}

export function useNoteDetection(): UseNoteDetectionReturn {
  const [detectedNotes, setDetectedNotes] = useState<NoteDetectionResult[]>([])
  const [currentNote, setCurrentNote] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const lastNoteTimeRef = useRef<number>(0)
  const noteHoldTimeRef = useRef<number>(0)

  const handleNoteDetected = useCallback(
    (note: string, confidence: number) => {
      const now = Date.now()

      if (confidence < 0.8) return

      if (currentNote === note) {
        noteHoldTimeRef.current = now - lastNoteTimeRef.current
        if (noteHoldTimeRef.current < 200) return
      } else {
        lastNoteTimeRef.current = now
        noteHoldTimeRef.current = 0
        setCurrentNote(note)
      }

      const detection: NoteDetectionResult = {
        note,
        confidence,
        timestamp: now,
      }

      setDetectedNotes((prev) => {
        const newNotes = [...prev, detection].slice(-10)
        return newNotes
      })
    },
    [currentNote],
  )

  const startDetection = useCallback(() => {
    setIsDetecting(true)
    setCurrentNote(null)
    lastNoteTimeRef.current = 0
    noteHoldTimeRef.current = 0
  }, [])

  const stopDetection = useCallback(() => {
    setIsDetecting(false)
    setCurrentNote(null)
  }, [])

  const clearHistory = useCallback(() => {
    setDetectedNotes([])
    setCurrentNote(null)
  }, [])

  return {
    detectedNotes,
    currentNote,
    isDetecting,
    startDetection,
    stopDetection,
    clearHistory,
    handleNoteDetected,
  } as UseNoteDetectionReturn & { handleNoteDetected: (note: string, confidence: number) => void }
}
