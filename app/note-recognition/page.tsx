"use client"

import { useState } from "react"
import { MonophonicDetector } from "@/components/monophonic-detector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DetectedNote {
  note: string
  startTime: number
  endTime?: number
  duration?: number
  confidence: number
}

export default function NoteRecognitionPage() {
  const [isListening, setIsListening] = useState(false)
  const [allNotes, setAllNotes] = useState<DetectedNote[]>([])
  const [stats, setStats] = useState({
    totalNotes: 0,
    averageDuration: 0,
    mostPlayedNote: "",
    sessionDuration: 0,
  })

  const handleNoteComplete = (note: DetectedNote) => {
    setAllNotes((prev) => {
      const newNotes = [...prev, note]

      // Update statistics
      const totalNotes = newNotes.length
      const avgDuration = newNotes.reduce((sum, n) => sum + (n.duration || 0), 0) / totalNotes

      // Find most played note
      const noteCounts = newNotes.reduce(
        (acc, n) => {
          acc[n.note] = (acc[n.note] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const mostPlayed =
        Object.entries(noteCounts).reduce((a, b) => (noteCounts[a[0]] > noteCounts[b[0]] ? a : b))[0] || ""

      setStats({
        totalNotes,
        averageDuration: Math.round(avgDuration),
        mostPlayedNote: mostPlayed,
        sessionDuration: newNotes.length > 0 ? (newNotes[newNotes.length - 1].endTime || 0) - newNotes[0].startTime : 0,
      })

      return newNotes
    })
  }

  const clearSession = () => {
    setAllNotes([])
    setStats({
      totalNotes: 0,
      averageDuration: 0,
      mostPlayedNote: "",
      sessionDuration: 0,
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Monophonic Note Recognition</h1>
        <p className="text-gray-600">
          Play any note on your piano and see real-time recognition with duration analysis
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setIsListening(!isListening)}
          variant={isListening ? "destructive" : "default"}
          size="lg"
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </Button>
        <Button onClick={clearSession} variant="outline" size="lg">
          Clear Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Note Detection */}
        <Card>
          <CardHeader>
            <CardTitle>Live Note Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <MonophonicDetector onNoteComplete={handleNoteComplete} isActive={isListening} />
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Session Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{stats.totalNotes}</div>
                <div className="text-sm text-blue-800">Total Notes</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.averageDuration}ms</div>
                <div className="text-sm text-green-800">Avg Duration</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">{stats.mostPlayedNote || "—"}</div>
                <div className="text-sm text-purple-800">Most Played</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.sessionDuration / 1000)}s</div>
                <div className="text-sm text-orange-800">Session Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
