"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface PianoKeyboardProps {
  onKeyPress?: (note: string, frequency: number) => void
  highlightedKey?: string
  className?: string
}

interface KeyInfo {
  note: string
  frequency: number
  isBlack: boolean
  position: number
}

// Generate 2 octaves starting from C4
const generateKeys = (): KeyInfo[] => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const baseFrequency = 261.63 // C4 frequency
  const keys: KeyInfo[] = []

  for (let octave = 0; octave < 2; octave++) {
    notes.forEach((note, index) => {
      const frequency = baseFrequency * Math.pow(2, (octave * 12 + index) / 12)
      const isBlack = note.includes("#")
      keys.push({
        note: `${note}${4 + octave}`,
        frequency,
        isBlack,
        position: octave * 12 + index,
      })
    })
  }

  return keys
}

export function PianoKeyboard({ onKeyPress, highlightedKey, className }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const keys = generateKeys()
  const whiteKeys = keys.filter((key) => !key.isBlack)
  const blackKeys = keys.filter((key) => key.isBlack)

  const handleKeyDown = useCallback(
    (key: KeyInfo) => {
      setPressedKeys((prev) => new Set(prev).add(key.note))
      onKeyPress?.(key.note, key.frequency)
    },
    [onKeyPress],
  )

  const handleKeyUp = useCallback((key: KeyInfo) => {
    setPressedKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key.note)
      return newSet
    })
  }, [])

  return (
    <div className={cn("relative select-none", className)}>
      {/* White Keys */}
      <div className="flex">
        {whiteKeys.map((key) => (
          <button
            key={key.note}
            className={cn(
              "relative w-12 h-32 bg-white border border-gray-300 rounded-b-lg shadow-sm",
              "hover:bg-gray-50 active:bg-gray-100 transition-colors",
              "flex items-end justify-center pb-4 text-sm font-medium text-gray-600",
              pressedKeys.has(key.note) && "bg-gray-100",
              highlightedKey === key.note && "bg-blue-100 border-blue-400",
            )}
            onMouseDown={() => handleKeyDown(key)}
            onMouseUp={() => handleKeyUp(key)}
            onMouseLeave={() => handleKeyUp(key)}
            onTouchStart={() => handleKeyDown(key)}
            onTouchEnd={() => handleKeyUp(key)}
          >
            {key.note.replace(/\d/, "")}
          </button>
        ))}
      </div>

      {/* Black Keys */}
      <div className="absolute top-0 flex">
        {blackKeys.map((key) => {
          // Calculate position based on white key pattern
          const whiteKeyIndex = whiteKeys.findIndex(
            (wk) =>
              wk.position < key.position &&
              whiteKeys.find((nextWk) => nextWk.position > key.position && nextWk.position > wk.position),
          )
          const leftOffset = (whiteKeyIndex + 0.7) * 48 // 48px = w-12

          return (
            <button
              key={key.note}
              className={cn(
                "absolute w-8 h-20 bg-gray-900 rounded-b-lg shadow-lg z-10",
                "hover:bg-gray-800 active:bg-gray-700 transition-colors",
                "flex items-end justify-center pb-2 text-xs font-medium text-white",
                pressedKeys.has(key.note) && "bg-gray-700",
                highlightedKey === key.note && "bg-blue-600",
              )}
              style={{ left: `${leftOffset}px` }}
              onMouseDown={() => handleKeyDown(key)}
              onMouseUp={() => handleKeyUp(key)}
              onMouseLeave={() => handleKeyUp(key)}
              onTouchStart={() => handleKeyDown(key)}
              onTouchEnd={() => handleKeyUp(key)}
            >
              {key.note.replace(/\d/, "")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
