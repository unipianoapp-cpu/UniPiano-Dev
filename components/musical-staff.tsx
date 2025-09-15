"use client"

import { useEffect, useRef } from "react"

interface Note {
  name: string
  duration: number // in beats
  position: number // position on staff
}

interface MusicalStaffProps {
  notes: Note[]
  currentNoteIndex: number
  correctNotes: boolean[]
  className?: string
}

// Twinkle Twinkle Little Star notes
export const twinkleTwinkleNotes: Note[] = [
  { name: "C4", duration: 1, position: 0 },
  { name: "C4", duration: 1, position: 0 },
  { name: "G4", duration: 1, position: 4 },
  { name: "G4", duration: 1, position: 4 },
  { name: "A4", duration: 1, position: 5 },
  { name: "A4", duration: 1, position: 5 },
  { name: "G4", duration: 2, position: 4 },
  { name: "F4", duration: 1, position: 3 },
  { name: "F4", duration: 1, position: 3 },
  { name: "E4", duration: 1, position: 2 },
  { name: "E4", duration: 1, position: 2 },
  { name: "D4", duration: 1, position: 1 },
  { name: "D4", duration: 1, position: 1 },
  { name: "C4", duration: 2, position: 0 },
]

export function MusicalStaff({ notes, currentNoteIndex, correctNotes, className }: MusicalStaffProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = 800
    canvas.height = 200

    // Draw staff lines
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = 50 + i * 20
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(750, y)
      ctx.stroke()
    }

    // Draw treble clef (simplified)
    ctx.font = "40px serif"
    ctx.fillStyle = "#000"
    ctx.fillText("𝄞", 60, 100)

    // Draw notes
    notes.forEach((note, index) => {
      const x = 120 + index * 60
      const y = 130 - note.position * 10 // Position on staff

      // Note color based on correctness
      let noteColor = "#000"
      if (index < currentNoteIndex) {
        noteColor = correctNotes[index] ? "#22c55e" : "#ef4444"
      } else if (index === currentNoteIndex) {
        noteColor = "#3b82f6"
      }

      ctx.fillStyle = noteColor

      // Draw note head
      ctx.beginPath()
      ctx.ellipse(x, y, 8, 6, 0, 0, 2 * Math.PI)
      ctx.fill()

      // Draw stem
      if (note.duration < 2) {
        ctx.beginPath()
        ctx.moveTo(x + 8, y)
        ctx.lineTo(x + 8, y - 30)
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.lineWidth = 1
      }

      // Draw note name below staff
      ctx.fillStyle = "#666"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(note.name.replace(/\d/, ""), x, 180)
    })

    // Draw current note indicator
    if (currentNoteIndex < notes.length) {
      const x = 120 + currentNoteIndex * 60
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, 130 - notes[currentNoteIndex].position * 10, 15, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }, [notes, currentNoteIndex, correctNotes])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto border rounded-lg bg-white"
        style={{ maxWidth: "800px", height: "200px" }}
      />
    </div>
  )
}
