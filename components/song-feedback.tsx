"use client"

import { CheckCircle, RotateCcw, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SongFeedbackProps {
  score: number
  mistakes: number
  progress: number
  isComplete: boolean
  isPlaying: boolean
  onReset: () => void
  onTogglePlay: () => void
  expectedNote: string | null
  className?: string
}

export function SongFeedback({
  score,
  mistakes,
  progress,
  isComplete,
  isPlaying,
  onReset,
  onTogglePlay,
  expectedNote,
  className,
}: SongFeedbackProps) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Twinkle Twinkle Little Star</h2>
        <div className="flex gap-2">
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            onClick={onTogglePlay}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{mistakes}</div>
          <div className="text-sm text-gray-600">Mistakes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((score / Math.max(1, score + mistakes * 2)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>

      {!isComplete && expectedNote && isPlaying && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-800">Play this note:</span>
            <span className="text-lg font-bold text-blue-900">{expectedNote.replace(/\d/, "")}</span>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Perfect! Song completed!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Final Score: {score} points with {mistakes} mistakes
          </p>
        </div>
      )}
    </div>
  )
}
