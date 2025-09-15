"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface EnhancedAudioProcessorProps {
  onNoteDetected: (note: string, frequency: number, confidence: number) => void
  isListening: boolean
}

// Extended note frequencies covering 5 octaves (C1-C6)
const generateNoteFrequencies = (): { [key: string]: number } => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const frequencies: { [key: string]: number } = {}

  for (let octave = 1; octave <= 5; octave++) {
    notes.forEach((note, index) => {
      const semitonesFromA4 = (octave - 4) * 12 + (index - 9)
      const frequency = 440 * Math.pow(2, semitonesFromA4 / 12)
      frequencies[`${note}${octave}`] = Math.round(frequency * 100) / 100
    })
  }

  return frequencies
}

const noteFrequencies = generateNoteFrequencies()

function frequencyToNote(frequency: number): { note: string; confidence: number } {
  let closestNote = "C4"
  let minDifference = Number.POSITIVE_INFINITY

  for (const [note, freq] of Object.entries(noteFrequencies)) {
    const difference = Math.abs(frequency - freq)
    if (difference < minDifference) {
      minDifference = difference
      closestNote = note
    }
  }

  const expectedFreq = noteFrequencies[closestNote]
  const percentDifference = Math.abs(frequency - expectedFreq) / expectedFreq
  const confidence = Math.max(0, 1 - percentDifference * 10)

  return { note: closestNote, confidence }
}

export function EnhancedAudioProcessor({ onNoteDetected, isListening }: EnhancedAudioProcessorProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<string>("")

  const detectPitch = useCallback(() => {
    if (!analyserRef.current || !isListening) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)

    analyser.getFloatFrequencyData(dataArray)

    let maxAmplitude = Number.NEGATIVE_INFINITY
    let maxIndex = 0

    // Find peak frequency with better resolution
    for (let i = 1; i < bufferLength - 1; i++) {
      if (dataArray[i] > maxAmplitude && dataArray[i] > dataArray[i - 1] && dataArray[i] > dataArray[i + 1]) {
        maxAmplitude = dataArray[i]
        maxIndex = i
      }
    }

    // Convert index to frequency with higher precision
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const frequency = (maxIndex * sampleRate) / (bufferLength * 2)

    if (maxAmplitude > -50 && frequency > 25 && frequency < 4200) {
      const { note, confidence } = frequencyToNote(frequency)
      if (confidence > 0.6) {
        onNoteDetected(note, frequency, confidence)
      }
    }

    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(detectPitch)
    }
  }, [onNoteDetected, isListening])

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1,
        },
      })

      streamRef.current = stream
      setHasPermission(true)
      setError("")

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 8192 // Higher resolution for better pitch detection
      analyser.smoothingTimeConstant = 0.3 // Less smoothing for faster response

      source.connect(analyser)
      analyserRef.current = analyser

      detectPitch()
    } catch (err) {
      setError("Microphone access denied or not available")
      console.error("Error accessing microphone:", err)
    }
  }, [detectPitch])

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
  }, [])

  useEffect(() => {
    if (isListening && hasPermission) {
      detectPitch()
    } else if (!isListening) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isListening, hasPermission, detectPitch])

  useEffect(() => {
    if (isListening && !hasPermission) {
      startListening()
    } else if (!isListening) {
      stopListening()
    }

    return () => {
      stopListening()
    }
  }, [isListening, hasPermission, startListening, stopListening])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return null
}
