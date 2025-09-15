"use client"

import { useState, useCallback, useRef } from "react"
import { twinkleTwinkleNotes } from "@/components/musical-staff"

interface SongProgressState {
  currentNoteIndex: number
  correctNotes: boolean[]
  isComplete: boolean
  score: number
  mistakes: number
}

interface UseSongProgressReturn extends SongProgressState {
  checkNote: (detectedNote: string) => boolean
  resetSong: () => void
  getExpectedNote: () => string | null
  getProgress: () => number
}

export function useSongProgress(): UseSongProgressReturn {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [correctNotes, setCorrectNotes] = useState<boolean[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const lastCorrectTimeRef = useRef<number>(0)

  const checkNote = useCallback(
    (detectedNote: string): boolean => {
      if (isComplete || currentNoteIndex >= twinkleTwinkleNotes.length) {
        return false
      }

      const expectedNote = twinkleTwinkleNotes[currentNoteIndex]
      const now = Date.now()

      const detectedNoteName = detectedNote.replace(/\d/, "")
      const expectedNoteName = expectedNote.name.replace(/\d/, "")
      const isCorrect = detectedNoteName === expectedNoteName

      if (isCorrect && now - lastCorrectTimeRef.current < 500) {
        return true
      }

      if (isCorrect) {
        lastCorrectTimeRef.current = now

        setCorrectNotes((prev) => {
          const newCorrect = [...prev]
          newCorrect[currentNoteIndex] = true
          return newCorrect
        })

        setScore((prev) => prev + 10)

        const nextIndex = currentNoteIndex + 1
        setCurrentNoteIndex(nextIndex)

        if (nextIndex >= twinkleTwinkleNotes.length) {
          setIsComplete(true)
        }

        return true
      } else {
        setCorrectNotes((prev) => {
          const newCorrect = [...prev]
          newCorrect[currentNoteIndex] = false
          return newCorrect
        })

        setMistakes((prev) => prev + 1)
        setScore((prev) => Math.max(0, prev - 2)) // Small penalty

        return false
      }
    },
    [currentNoteIndex, isComplete],
  )

  const resetSong = useCallback(() => {
    setCurrentNoteIndex(0)
    setCorrectNotes([])
    setIsComplete(false)
    setScore(0)
    setMistakes(0)
    lastCorrectTimeRef.current = 0
  }, [])

  const getExpectedNote = useCallback((): string | null => {
    if (currentNoteIndex >= twinkleTwinkleNotes.length) {
      return null
    }
    return twinkleTwinkleNotes[currentNoteIndex].name
  }, [currentNoteIndex])

  const getProgress = useCallback((): number => {
    return (currentNoteIndex / twinkleTwinkleNotes.length) * 100
  }, [currentNoteIndex])

  return {
    currentNoteIndex,
    correctNotes,
    isComplete,
    score,
    mistakes,
    checkNote,
    resetSong,
    getExpectedNote,
    getProgress,
  }
}
