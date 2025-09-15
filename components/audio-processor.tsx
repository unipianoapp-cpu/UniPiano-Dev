"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface AudioProcessorProps {
  onNoteDetected: (note: string, confidence: number) => void
  isListening: boolean
}

// Note frequencies for detection
const noteFrequencies: { [key: string]: number } = {
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  "G#5": 830.61,
  A5: 880.0,
  "A#5": 932.33,
  B5: 987.77,
}

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

  // Calculate confidence based on how close the frequency is
  const confidence = Math.max(0, 1 - minDifference / 50)

  return { note: closestNote, confidence }
}

export function AudioProcessor({ onNoteDetected, isListening }: AudioProcessorProps) {
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

    // Find the frequency with the highest amplitude
    let maxAmplitude = Number.NEGATIVE_INFINITY
    let maxIndex = 0

    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i]
        maxIndex = i
      }
    }

    // Convert index to frequency
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    const frequency = (maxIndex * sampleRate) / (bufferLength * 2)

    // Only process if amplitude is above threshold
    if (maxAmplitude > -60 && frequency > 200 && frequency < 1000) {
      const { note, confidence } = frequencyToNote(frequency)
      if (confidence > 0.7) {
        onNoteDetected(note, confidence)
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
        },
      })

      streamRef.current = stream
      setHasPermission(true)
      setError("")

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0.8

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
