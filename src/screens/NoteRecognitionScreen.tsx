"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AudioService } from "../services/AudioService"
import { PitchDetector } from "../services/PitchDetector"
import { frequencyToNote } from "../utils/frequencyToNote"

export default function NoteRecognitionScreen({ navigation }: any) {
  const [isListening, setIsListening] = useState(false)
  const [detectedNote, setDetectedNote] = useState<string | null>(null)
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [noteHistory, setNoteHistory] = useState<Array<{ note: string; duration: number; timestamp: Date }>>([])

  const audioServiceRef = useRef<AudioService | null>(null)
  const pitchDetectorRef = useRef<PitchDetector | null>(null)
  const lastNoteRef = useRef<{ note: string; startTime: number } | null>(null)

  useEffect(() => {
    audioServiceRef.current = new AudioService()
    pitchDetectorRef.current = new PitchDetector()

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.stopRecording()
      }
    }
  }, [])

  // Generate 5 octaves of notes (C1 to C6)
  const generatePianoKeys = () => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const keys = []

    for (let octave = 1; octave <= 5; octave++) {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i]
        const isBlack = note.includes("#")
        keys.push({
          note: `${note}${octave}`,
          isBlack,
          frequency: 440 * Math.pow(2, octave - 4 + (i - 9) / 12),
        })
      }
    }
    return keys
  }

  const pianoKeys = generatePianoKeys()

  const startListening = async () => {
    try {
      console.log("[v0] 🎤 Starting native audio recording for note recognition...")

      if (!audioServiceRef.current || !pitchDetectorRef.current) {
        throw new Error("Audio services not initialized")
      }

      await audioServiceRef.current.requestPermissions()

      const success = await audioServiceRef.current.startRecording({
        onAudioData: (audioData: Float32Array) => {
          if (pitchDetectorRef.current) {
            const result = pitchDetectorRef.current.detectPitch(audioData, 44100)

            if (result.frequency && result.frequency > 80 && result.frequency < 2000 && result.confidence > 0.3) {
              const note = frequencyToNote(result.frequency)

              setDetectedFrequency(result.frequency)
              setDetectedNote(note)
              setConfidence(result.confidence)

              // Track note duration
              const currentTime = Date.now()
              if (lastNoteRef.current?.note !== note) {
                if (lastNoteRef.current) {
                  const duration = (currentTime - lastNoteRef.current.startTime) / 1000
                  setNoteHistory((prev) => [
                    ...prev.slice(-19),
                    {
                      note: lastNoteRef.current!.note,
                      duration,
                      timestamp: new Date(lastNoteRef.current!.startTime),
                    },
                  ])
                }
                lastNoteRef.current = { note, startTime: currentTime }
              }

              console.log("[v0] 🎹 Native detected:", note, result.frequency.toFixed(1) + "Hz")
            } else {
              setDetectedNote(null)
              setDetectedFrequency(null)
              setConfidence(0)
            }
          }
        },
      })

      if (success) {
        setIsListening(true)
        Alert.alert("🎤 Test Started", "Play any note on your piano to test native detection!")
      } else {
        throw new Error("Failed to start recording")
      }
    } catch (error) {
      console.log("[v0] ❌ Native audio error:", error)
      Alert.alert("🎤 Microphone Required", "Please allow microphone access for note detection.", [
        { text: "Cancel", style: "cancel" },
        { text: "Try Again", onPress: startListening },
      ])
    }
  }

  const stopListening = async () => {
    console.log("[v0] ⏹️ Stopping native note recognition")
    setIsListening(false)
    setDetectedNote(null)
    setDetectedFrequency(null)
    setConfidence(0)

    if (audioServiceRef.current) {
      await audioServiceRef.current.stopRecording()
    }

    if (lastNoteRef.current) {
      const duration = (Date.now() - lastNoteRef.current.startTime) / 1000
      setNoteHistory((prev) => [
        ...prev.slice(-19),
        {
          note: lastNoteRef.current!.note,
          duration,
          timestamp: new Date(lastNoteRef.current!.startTime),
        },
      ])
      lastNoteRef.current = null
    }
  }

  const clearHistory = () => {
    setNoteHistory([])
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Note Recognition Test</Text>
        <TouchableOpacity onPress={clearHistory}>
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Detection Display */}
      <View style={styles.detectionContainer}>
        <Text style={styles.detectionTitle}>Real-time Detection</Text>

        {detectedNote ? (
          <View style={styles.detectedInfo}>
            <Text style={styles.detectedNote}>{detectedNote}</Text>
            <Text style={styles.detectedFreq}>{detectedFrequency?.toFixed(1)} Hz</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${confidence * 100}%` }]} />
            </View>
            <Text style={styles.confidenceText}>Confidence: {(confidence * 100).toFixed(0)}%</Text>
          </View>
        ) : (
          <Text style={styles.noDetection}>
            {isListening ? "Listening for piano notes..." : "Press Start to begin detection"}
          </Text>
        )}
      </View>

      {/* Piano Keyboard */}
      <View style={styles.pianoContainer}>
        <Text style={styles.pianoTitle}>5-Octave Piano (C1-C6)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.keysContainer}>
            {pianoKeys
              .filter((key) => !key.isBlack)
              .map((key) => (
                <View key={key.note} style={styles.keyGroup}>
                  <TouchableOpacity style={[styles.whiteKey, detectedNote === key.note && styles.activeKey]}>
                    <Text style={styles.keyLabel}>{key.note}</Text>
                  </TouchableOpacity>

                  {/* Black keys */}
                  {pianoKeys.find(
                    (k) =>
                      k.isBlack && k.note.startsWith(key.note[0]) && k.note.endsWith(key.note[key.note.length - 1]),
                  ) && (
                    <TouchableOpacity
                      style={[
                        styles.blackKey,
                        detectedNote ===
                          pianoKeys.find(
                            (k) =>
                              k.isBlack &&
                              k.note.startsWith(key.note[0]) &&
                              k.note.endsWith(key.note[key.note.length - 1]),
                          )?.note && styles.activeBlackKey,
                      ]}
                    >
                      <Text style={styles.blackKeyLabel}>
                        {
                          pianoKeys.find(
                            (k) =>
                              k.isBlack &&
                              k.note.startsWith(key.note[0]) &&
                              k.note.endsWith(key.note[key.note.length - 1]),
                          )?.note
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </View>
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isListening && styles.listeningButton]}
          onPress={isListening ? stopListening : startListening}
        >
          <Ionicons name={isListening ? "stop" : "mic"} size={24} color="#fff" />
          <Text style={styles.buttonText}>{isListening ? "Stop Detection" : "Start Detection"}</Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Detection History</Text>
        <ScrollView style={styles.historyScroll}>
          {noteHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyNote}>{item.note}</Text>
              <Text style={styles.historyDuration}>{item.duration.toFixed(1)}s</Text>
              <Text style={styles.historyTime}>{item.timestamp.toLocaleTimeString()}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#0ea5e9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  detectionContainer: {
    backgroundColor: "#16213e",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  detectionTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  detectedInfo: {
    alignItems: "center",
  },
  detectedNote: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 5,
  },
  detectedFreq: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 10,
  },
  confidenceBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 4,
    marginBottom: 5,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  noDetection: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
  pianoContainer: {
    margin: 20,
  },
  pianoTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  keysContainer: {
    flexDirection: "row",
  },
  keyGroup: {
    position: "relative",
  },
  whiteKey: {
    backgroundColor: "#fff",
    width: 30,
    height: 120,
    marginHorizontal: 1,
    borderRadius: 4,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  blackKey: {
    backgroundColor: "#000",
    width: 20,
    height: 80,
    position: "absolute",
    top: 0,
    right: -10,
    borderRadius: 4,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
  },
  activeKey: {
    backgroundColor: "#60a5fa",
  },
  activeBlackKey: {
    backgroundColor: "#3b82f6",
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  blackKeyLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0ea5e9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  listeningButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyContainer: {
    flex: 1,
    backgroundColor: "#16213e",
    margin: 20,
    borderRadius: 12,
    padding: 15,
  },
  historyTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyScroll: {
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  historyNote: {
    fontSize: 14,
    color: "#60a5fa",
    fontWeight: "bold",
    flex: 1,
  },
  historyDuration: {
    fontSize: 14,
    color: "#10b981",
    flex: 1,
    textAlign: "center",
  },
  historyTime: {
    fontSize: 12,
    color: "#9ca3af",
    flex: 1,
    textAlign: "right",
  },
})
