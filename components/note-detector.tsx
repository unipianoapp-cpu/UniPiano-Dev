"use client"

import type React from "react"

import { AudioProcessor } from "./audio-processor"
import { useNoteDetection } from "@/hooks/use-note-detection"

interface NoteDetectorProps {
  onNoteDetected: (note: string, confidence: number, timestamp: number) => void
  isActive: boolean
  children?: React.ReactNode
}

export function NoteDetector({ onNoteDetected, isActive, children }: NoteDetectorProps) {
  const { currentNote, handleNoteDetected } = useNoteDetection()

  const handleNote = (note: string, confidence: number) => {
    handleNoteDetected(note, confidence)
    onNoteDetected(note, confidence, Date.now())
  }

  return (
    <div className="relative">
      <AudioProcessor onNoteDetected={handleNote} isListening={isActive} />

      {isActive && (
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Listening...</span>
          </div>
          {currentNote && <div className="mt-1 text-lg font-bold text-blue-600">{currentNote}</div>}
        </div>
      )}

      {children}
    </div>
  )
}
