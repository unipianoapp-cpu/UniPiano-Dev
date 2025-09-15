"use client"

import { useState, useCallback } from "react"
import { ExtendedPianoKeyboard } from "@/components/extended-piano-keyboard"
import { EnhancedAudioProcessor } from "@/components/enhanced-audio-processor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Trash2, Volume2 } from "lucide-react"

interface DetectedNote {
  note: string
  frequency: number
  confidence: number
  duration: number
  timestamp: number
}

export default function PianoTestPage() {
  const [isListening, setIsListening] = useState(false)
  const [currentNote, setCurrentNote] = useState<string>("")
  const [currentFrequency, setCurrentFrequency] = useState<number>(0)
  const [currentConfidence, setCurrentConfidence] = useState<number>(0)
  const [detectedNotes, setDetectedNotes] = useState<DetectedNote[]>([])
  const [noteStartTime, setNoteStartTime] = useState<number>(0)
  const [lastNote, setLastNote] = useState<string>("")

  const classifyNoteDuration = (duration: number): string => {
    if (duration < 200) return "Very Short"
    if (duration < 500) return "Short (♬)"
    if (duration < 1000) return "Medium (♪)"
    if (duration < 2000) return "Long (♩)"
    return "Very Long (♫)"
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.9) return "bg-green-500"
    if (confidence > 0.8) return "bg-blue-500"
    if (confidence > 0.7) return "bg-yellow-500"
    return "bg-red-500"
  }

  const handleNoteDetected = useCallback(
    (note: string, frequency: number, confidence: number) => {
      const now = Date.now()

      if (note !== lastNote) {
        // Complete previous note if exists
        if (lastNote && noteStartTime > 0) {
          const duration = now - noteStartTime
          const completedNote: DetectedNote = {
            note: lastNote,
            frequency: currentFrequency,
            confidence: currentConfidence,
            duration,
            timestamp: noteStartTime,
          }

          setDetectedNotes((prev) => [completedNote, ...prev].slice(0, 20)) // Keep last 20 notes
        }

        // Start new note
        setNoteStartTime(now)
        setLastNote(note)
      }

      setCurrentNote(note)
      setCurrentFrequency(frequency)
      setCurrentConfidence(confidence)
    },
    [lastNote, noteStartTime, currentFrequency, currentConfidence],
  )

  const handleKeyboardPress = (note: string, frequency: number) => {
    // Simulate detection from keyboard press
    handleNoteDetected(note, frequency, 1.0)

    // Auto-complete after short delay to simulate key release
    setTimeout(() => {
      if (noteStartTime > 0) {
        const duration = Date.now() - noteStartTime
        const completedNote: DetectedNote = {
          note,
          frequency,
          confidence: 1.0,
          duration,
          timestamp: noteStartTime,
        }

        setDetectedNotes((prev) => [completedNote, ...prev].slice(0, 20))
        setCurrentNote("")
        setLastNote("")
        setNoteStartTime(0)
      }
    }, 300)
  }

  const clearHistory = () => {
    setDetectedNotes([])
    setCurrentNote("")
    setLastNote("")
    setNoteStartTime(0)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    if (isListening) {
      setCurrentNote("")
      setLastNote("")
      setNoteStartTime(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <EnhancedAudioProcessor onNoteDetected={handleNoteDetected} isListening={isListening} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Piano Note Recognition Test</h1>
          <p className="text-gray-600">
            Complete monophonic system - Play any note and see real-time detection with duration analysis
          </p>
          <p className="text-sm text-gray-500">Coverage: 5 full octaves (C1-C6) • Frequency range: 32Hz - 1047Hz</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
          <Button onClick={clearHistory} variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        </div>

        {/* Current Detection Display */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Live Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentNote ? (
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-blue-600">{currentNote}</div>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-semibold">{currentFrequency.toFixed(2)} Hz</div>
                    <div className="text-sm text-gray-500">Frequency</div>
                  </div>
                  <div className="text-center">
                    <Badge className={`text-white ${getConfidenceColor(currentConfidence)}`}>
                      {Math.round(currentConfidence * 100)}%
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold">{noteStartTime > 0 ? Date.now() - noteStartTime : 0}ms</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {isListening ? "Play a note to see detection..." : "Click 'Start Listening' to begin"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Piano Keyboard */}
        <Card>
          <CardHeader>
            <CardTitle>Extended Piano Keyboard (5 Octaves)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExtendedPianoKeyboard onKeyPress={handleKeyboardPress} highlightedKey={currentNote} className="w-full" />
            <p className="text-sm text-gray-500 mt-4 text-center">
              Click piano keys or use real piano with microphone detection
            </p>
          </CardContent>
        </Card>

        {/* Detection History */}
        <Card>
          <CardHeader>
            <CardTitle>Detection History</CardTitle>
          </CardHeader>
          <CardContent>
            {detectedNotes.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detectedNotes.map((note, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-semibold">{note.note}</div>
                      <div className="text-sm text-gray-600">{note.frequency.toFixed(2)} Hz</div>
                      <Badge className={`text-white ${getConfidenceColor(note.confidence)}`}>
                        {Math.round(note.confidence * 100)}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{note.duration}ms</div>
                      <div className="text-xs text-gray-500">{classifyNoteDuration(note.duration)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No notes detected yet. Start playing to see history.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
