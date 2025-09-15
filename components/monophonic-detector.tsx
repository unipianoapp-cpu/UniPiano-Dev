"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AudioProcessor } from "./audio-processor"

interface DetectedNote {
  note: string
  startTime: number
  endTime?: number
  duration?: number
  confidence: number
}

interface MonophonicDetectorProps {
  onNoteComplete: (note: DetectedNote) => void
  isActive: boolean
}

export function MonophonicDetector({ onNoteComplete, isActive }: MonophonicDetectorProps) {
  const [currentNote, setCurrentNote] = useState<DetectedNote | null>(null)
  const [detectedNotes, setDetectedNotes] = useState<DetectedNote[]>([])
  const silenceTimeoutRef = useRef<NodeJS.Timeout>()
  const lastNoteRef = useRef<string>("")
  const noteStartTimeRef = useRef<number>(0)

  const handleNoteDetected = useCallback(
    (note: string, confidence: number) => {
      const now = Date.now()

      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }

      // If this is a new note or first note
      if (lastNoteRef.current !== note) {
        // Complete the previous note if it exists
        if (currentNote && lastNoteRef.current) {
          const completedNote: DetectedNote = {
            ...currentNote,
            endTime: now,
            duration: now - currentNote.startTime,
          }

          setDetectedNotes((prev) => [...prev, completedNote])
          onNoteComplete(completedNote)
        }

        // Start new note
        const newNote: DetectedNote = {
          note,
          startTime: now,
          confidence,
        }

        setCurrentNote(newNote)
        lastNoteRef.current = note
        noteStartTimeRef.current = now
      }

      // Set timeout to detect note end (silence)
      silenceTimeoutRef.current = setTimeout(() => {
        if (currentNote) {
          const completedNote: DetectedNote = {
            ...currentNote,
            endTime: Date.now(),
            duration: Date.now() - currentNote.startTime,
          }

          setDetectedNotes((prev) => [...prev, completedNote])
          onNoteComplete(completedNote)
          setCurrentNote(null)
          lastNoteRef.current = ""
        }
      }, 300) // 300ms silence threshold
    },
    [currentNote, onNoteComplete],
  )

  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [])

  const classifyNoteDuration = (duration: number): string => {
    if (duration < 250) return "Sixteenth Note (♬)"
    if (duration < 500) return "Eighth Note (♪)"
    if (duration < 1000) return "Quarter Note (♩)"
    if (duration < 2000) return "Half Note (♫)"
    return "Whole Note (○)"
  }

  return (
    <div className="space-y-4">
      <AudioProcessor onNoteDetected={handleNoteDetected} isListening={isActive} />

      {/* Current Note Display */}
      {currentNote && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-800">Playing: {currentNote.note}</h3>
              <p className="text-sm text-blue-600">Duration: {Date.now() - currentNote.startTime}ms</p>
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Recent Notes History */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">Recent Notes:</h4>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {detectedNotes
            .slice(-10)
            .reverse()
            .map((note, index) => (
              <div key={index} className="bg-gray-50 border rounded p-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{note.note}</span>
                  <span className="text-gray-500">{note.duration}ms</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{classifyNoteDuration(note.duration || 0)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
