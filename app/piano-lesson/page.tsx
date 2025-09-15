"use client"

import { useState } from "react"
import { PianoKeyboard } from "@/components/piano-keyboard"
import { MusicalStaff, twinkleTwinkleNotes } from "@/components/musical-staff"
import { NoteDetector } from "@/components/note-detector"
import { SongFeedback } from "@/components/song-feedback"
import { useSongProgress } from "@/hooks/use-song-progress"
import { X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PianoLessonPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastDetectedNote, setLastDetectedNote] = useState<string>("")
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | "">("")

  const {
    currentNoteIndex,
    correctNotes,
    isComplete,
    score,
    mistakes,
    checkNote,
    resetSong,
    getExpectedNote,
    getProgress,
  } = useSongProgress()

  const handleNoteDetected = (note: string, confidence: number, timestamp: number) => {
    if (!isPlaying) return

    setLastDetectedNote(note)
    const isCorrect = checkNote(note)

    if (isCorrect) {
      setFeedbackMessage("Perfect!")
      setFeedbackType("correct")
    } else {
      setFeedbackMessage("Try again!")
      setFeedbackType("incorrect")
    }

    setTimeout(() => {
      setFeedbackMessage("")
      setFeedbackType("")
    }, 1000)
  }

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      setFeedbackMessage("")
      setFeedbackType("")
    }
  }

  const handleReset = () => {
    resetSong()
    setIsPlaying(false)
    setLastDetectedNote("")
    setFeedbackMessage("")
    setFeedbackType("")
  }

  const expectedNote = getExpectedNote()
  const progress = getProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 p-4">
      <NoteDetector onNoteDetected={handleNoteDetected} isActive={isPlaying}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
            <div className="text-white text-center">
              <h1 className="text-2xl font-bold">Piano Lesson</h1>
              <p className="text-purple-100">Learn to play Twinkle Twinkle Little Star</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-white hover:bg-white/20">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {feedbackMessage && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div
                className={`px-8 py-4 rounded-full text-white text-2xl font-bold shadow-lg animate-bounce ${
                  feedbackType === "correct"
                    ? "bg-green-500"
                    : feedbackType === "incorrect"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
              >
                {feedbackMessage}
                {feedbackType === "correct" && <div className="flex justify-center mt-2">{"✨".repeat(5)}</div>}
              </div>
            </div>
          )}

          <div className="mb-6">
            <SongFeedback
              score={score}
              mistakes={mistakes}
              progress={progress}
              isComplete={isComplete}
              isPlaying={isPlaying}
              onReset={handleReset}
              onTogglePlay={handleTogglePlay}
              expectedNote={expectedNote}
            />
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <MusicalStaff
              notes={twinkleTwinkleNotes}
              currentNoteIndex={currentNoteIndex}
              correctNotes={correctNotes}
              className="w-full"
            />
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <PianoKeyboard
              onKeyPress={(note, frequency) => {
                if (isPlaying) {
                  handleNoteDetected(note, 1.0, Date.now())
                }
              }}
              highlightedKey={expectedNote}
              className="w-full flex justify-center"
            />

            <div className="mt-4 text-center text-gray-600">
              <p className="text-sm">
                {isPlaying
                  ? `Play the highlighted note: ${expectedNote?.replace(/\d/, "") || "Complete!"}`
                  : "Click 'Start' to begin the lesson"}
              </p>
              <p className="text-xs mt-1 text-gray-500">
                You can click the piano keys or use a real piano with microphone detection
              </p>
            </div>
          </div>
        </div>
      </NoteDetector>
    </div>
  )
}
