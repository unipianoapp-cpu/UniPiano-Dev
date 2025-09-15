"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ExtendedPianoKeyboardProps {
  onKeyPress?: (note: string, frequency: number) => void
  highlightedKey?: string
  className?: string
}

interface KeyInfo {
  note: string
  frequency: number
  isBlack: boolean
  position: number
  octave: number
}

// Generate 5 octaves starting from C1 to C6 (full piano range)
const generateExtendedKeys = (): KeyInfo[] => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const keys: KeyInfo[] = []

  // Start from C1 (32.70 Hz) to C6 (1046.50 Hz) - 5 full octaves
  for (let octave = 1; octave <= 5; octave++) {
    notes.forEach((note, index) => {
      // Calculate frequency using A4 = 440Hz as reference
      const semitonesFromA4 = (octave - 4) * 12 + (index - 9) // A is at index 9
      const frequency = 440 * Math.pow(2, semitonesFromA4 / 12)

      const isBlack = note.includes("#")
      keys.push({
        note: `${note}${octave}`,
        frequency: Math.round(frequency * 100) / 100,
        isBlack,
        position: (octave - 1) * 12 + index,
        octave,
      })
    })
  }

  return keys
}

export function ExtendedPianoKeyboard({ onKeyPress, highlightedKey, className }: ExtendedPianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const keys = generateExtendedKeys()
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
    <div className={cn("relative select-none overflow-x-auto", className)}>
      <div className="min-w-max">
        {/* White Keys */}
        <div className="flex">
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              className={cn(
                "relative w-10 h-28 bg-white border border-gray-300 rounded-b-lg shadow-sm",
                "hover:bg-gray-50 active:bg-gray-100 transition-colors",
                "flex flex-col items-center justify-end pb-2 text-xs font-medium text-gray-600",
                pressedKeys.has(key.note) && "bg-gray-100",
                highlightedKey === key.note && "bg-blue-100 border-blue-400",
              )}
              onMouseDown={() => handleKeyDown(key)}
              onMouseUp={() => handleKeyUp(key)}
              onMouseLeave={() => handleKeyUp(key)}
              onTouchStart={() => handleKeyDown(key)}
              onTouchEnd={() => handleKeyUp(key)}
            >
              <span className="text-[10px]">{key.note.replace(/\d/, "")}</span>
              <span className="text-[8px] text-gray-400">{key.octave}</span>
            </button>
          ))}
        </div>

        {/* Black Keys */}
        <div className="absolute top-0 flex">
          {blackKeys.map((key) => {
            // Calculate position based on white key pattern
            const whiteKeysBeforeThis = whiteKeys.filter((wk) => wk.position < key.position).length
            const leftOffset = (whiteKeysBeforeThis - 0.3) * 40 // 40px = w-10

            return (
              <button
                key={key.note}
                className={cn(
                  "absolute w-6 h-18 bg-gray-900 rounded-b-lg shadow-lg z-10",
                  "hover:bg-gray-800 active:bg-gray-700 transition-colors",
                  "flex flex-col items-center justify-end pb-1 text-[8px] font-medium text-white",
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
                <span className="text-[8px]">{key.note.replace(/\d/, "")}</span>
                <span className="text-[6px] text-gray-300">{key.octave}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
