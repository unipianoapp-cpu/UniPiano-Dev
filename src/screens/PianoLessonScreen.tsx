"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg"
import { AudioService } from "../services/AudioService"
import { PitchDetector } from "../services/PitchDetector"
import { frequencyToNote } from "../utils/frequencyToNote"

const { width } = Dimensions.get("window")

export default function PianoLessonScreen({ navigation }: any) {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [score, setScore] = useState(0)
  const [detectedNote, setDetectedNote] = useState<string | null>(null)
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [showPerfect, setShowPerfect] = useState(false)

  const audioServiceRef = useRef<AudioService | null>(null)
  const pitchDetectorRef = useRef<PitchDetector | null>(null)

  const melody = [
    { note: "C4", duration: "quarter", staffY: 80, display: "C" },
    { note: "C4", duration: "quarter", staffY: 80, display: "C" },
    { note: "G4", duration: "quarter", staffY: 50, display: "G" },
    { note: "G4", duration: "quarter", staffY: 50, display: "G" },
    { note: "A4", duration: "quarter", staffY: 45, display: "A" },
    { note: "A4", duration: "quarter", staffY: 45, display: "A" },
    { note: "G4", duration: "half", staffY: 50, display: "G" },
    { note: "F4", duration: "quarter", staffY: 55, display: "F" },
    { note: "F4", duration: "quarter", staffY: 55, display: "F" },
    { note: "E4", duration: "quarter", staffY: 60, display: "E" },
    { note: "E4", duration: "quarter", staffY: 60, display: "E" },
    { note: "D4", duration: "quarter", staffY: 65, display: "D" },
    { note: "D4", duration: "quarter", staffY: 65, display: "D" },
    { note: "C4", duration: "half", staffY: 80, display: "C" },
  ]

  useEffect(() => {
    console.log("[v0] Component mounted, initializing native audio services...")
    audioServiceRef.current = new AudioService()
    pitchDetectorRef.current = new PitchDetector()
    requestMicrophonePermission()

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.stopRecording()
      }
    }
  }, [])

  const requestMicrophonePermission = async () => {
    try {
      console.log("[v0] 🎤 Requesting native microphone access...")

      if (!audioServiceRef.current) {
        throw new Error("Audio service not initialized")
      }

      const hasPermission = await audioServiceRef.current.requestPermissions()

      if (hasPermission) {
        console.log("[v0] ✅ Native microphone access granted!")
        Alert.alert(
          "🎤 Microphone Ready",
          "Great! Now play any note on your piano and watch the detection in real-time.",
          [{ text: "Start Listening", onPress: startListening }],
        )
      } else {
        Alert.alert("🎤 Microphone Access Required", "Please allow microphone access to detect your piano notes.", [
          { text: "Cancel", style: "cancel" },
          { text: "Try Again", onPress: requestMicrophonePermission },
        ])
      }
    } catch (error) {
      console.log("[v0] ❌ Native microphone error:", error)
      Alert.alert("Microphone Error", "Failed to access microphone. Please try again.")
    }
  }

  const startListening = async () => {
    try {
      console.log("[v0] 🎵 Starting native piano detection...")
      setIsListening(true)

      if (!audioServiceRef.current || !pitchDetectorRef.current) {
        throw new Error("Audio services not initialized")
      }

      const success = await audioServiceRef.current.startRecording({
        onAudioData: (audioData: Float32Array) => {
          if (pitchDetectorRef.current) {
            const result = pitchDetectorRef.current.detectPitch(audioData, 44100)

            if (result.frequency && result.frequency > 80 && result.frequency < 2000 && result.confidence > 0.3) {
              const noteWithOctave = frequencyToNote(result.frequency)

              console.log("[v0] 🎹 Native detected:", noteWithOctave, result.frequency.toFixed(1) + "Hz")

              setDetectedFrequency(result.frequency)
              setDetectedNote(noteWithOctave)
              setConfidence(result.confidence)

              const currentNote = melody[currentNoteIndex]?.note
              if (noteWithOctave === currentNote && result.confidence > 0.3) {
                console.log("[v0] ✅ CORRECT NOTE MATCHED!")
                setScore((prev) => prev + 10)
                setShowPerfect(true)
                setTimeout(() => setShowPerfect(false), 1500)
                setCurrentNoteIndex((prev) => Math.min(prev + 1, melody.length - 1))
              }
            } else {
              setDetectedNote(null)
              setDetectedFrequency(null)
              setConfidence(0)
            }
          }
        },
      })

      if (!success) {
        throw new Error("Failed to start native recording")
      }
    } catch (error) {
      console.log("[v0] ❌ Native audio setup error:", error)
      Alert.alert("Audio Error", "Failed to setup native audio processing. Please try again.")
      setIsListening(false)
    }
  }

  const stopListening = async () => {
    console.log("[v0] ⏹️ Stopping native piano detection")
    setIsListening(false)
    setDetectedNote(null)
    setDetectedFrequency(null)
    setConfidence(0)

    if (audioServiceRef.current) {
      await audioServiceRef.current.stopRecording()
    }
  }

  const generatePianoKeys = () => {
    const keys = []
    const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"]
    const blackNotes = ["C#", "D#", "", "F#", "G#", "A#", ""] // Empty strings where no black key exists

    for (let octave = 1; octave <= 6; octave++) {
      whiteNotes.forEach((note, index) => {
        keys.push({
          note: `${note}${octave}`,
          display: `${note}${octave}`,
          isBlack: false,
          frequency: getFrequency(`${note}${octave}`),
        })

        if (blackNotes[index] && octave < 6) {
          keys.push({
            note: `${blackNotes[index]}${octave}`,
            display: `${blackNotes[index]}${octave}`,
            isBlack: true,
            frequency: getFrequency(`${blackNotes[index]}${octave}`),
          })
        }
      })
    }
    return keys
  }

  const getFrequency = (note: string) => {
    const noteFreqs: { [key: string]: number } = {
      C1: 32.7,
      "C#1": 34.65,
      D1: 36.71,
      "D#1": 38.89,
      E1: 41.2,
      F1: 43.65,
      "F#1": 46.25,
      G1: 49.0,
      "G#1": 51.91,
      A1: 55.0,
      "A#1": 58.27,
      B1: 61.74,
      C2: 65.41,
      "C#2": 69.3,
      D2: 73.42,
      "D#2": 77.78,
      E2: 82.41,
      F2: 87.31,
      "F#2": 92.5,
      G2: 98.0,
      "G#2": 103.83,
      A2: 110.0,
      "A#2": 116.54,
      B2: 123.47,
      C3: 130.81,
      "C#3": 138.59,
      D3: 146.83,
      "D#3": 155.56,
      E3: 164.81,
      F3: 174.61,
      "F#3": 185.0,
      G3: 196.0,
      "G#3": 207.65,
      A3: 220.0,
      "A#3": 233.08,
      B3: 246.94,
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
      C6: 1046.5,
      "C#6": 1108.73,
      D6: 1174.66,
      "D#6": 1244.51,
      E6: 1318.51,
      F6: 1396.91,
    }
    return noteFreqs[note] || 440
  }

  const pianoKeys = generatePianoKeys()

  const renderMusicalStaff = () => (
    <Svg height="120" width={width - 40} style={{ backgroundColor: "#fff" }}>
      {[30, 40, 50, 60, 70].map((y, i) => (
        <Path key={i} d={`M 20 ${y} L ${width - 60} ${y}`} stroke="#000" strokeWidth="1.5" />
      ))}

      <SvgText x="25" y="65" fontSize="28" fill="#000" fontFamily="serif">
        𝄞
      </SvgText>

      {melody.slice(0, 8).map((note, i) => {
        const xPos = 60 + i * 35
        const isCurrentNote = i === currentNoteIndex

        return (
          <g key={i}>
            {note.staffY === 80 && <Path d={`M ${xPos - 8} 80 L ${xPos + 8} 80`} stroke="#000" strokeWidth="1.5" />}

            <Circle
              cx={xPos}
              cy={note.staffY}
              r="4"
              fill={isCurrentNote ? "#60a5fa" : "#000"}
              stroke={isCurrentNote ? "#60a5fa" : "#000"}
              strokeWidth="1.5"
            />

            {isCurrentNote && (
              <Circle
                cx={xPos}
                cy={note.staffY}
                r="8"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            )}

            <Path
              d={`M ${xPos + 4} ${note.staffY} L ${xPos + 4} ${note.staffY - 20}`}
              stroke={isCurrentNote ? "#60a5fa" : "#000"}
              strokeWidth="1.5"
            />

            <SvgText
              x={xPos}
              y="95"
              fontSize="12"
              fill={isCurrentNote ? "#60a5fa" : "#666"}
              textAnchor="middle"
              fontWeight={isCurrentNote ? "bold" : "normal"}
            >
              {note.display}
            </SvgText>
          </g>
        )
      })}
    </Svg>
  )

  const renderPianoKeyboard = () => {
    const whiteKeys = pianoKeys.filter((key) => !key.isBlack)
    const blackKeys = pianoKeys.filter((key) => key.isBlack)
    const keyWidth = (width - 40) / 35 // 35 white keys across 5 octaves

    return (
      <View style={styles.pianoContainer}>
        <Text style={styles.pianoTitle}>5-Octave Piano (C1-C6)</Text>
        <View style={styles.pianoKeyboard}>
          <View style={styles.whiteKeysRow}>
            {whiteKeys.map((key, index) => {
              const isCurrentKey = melody[currentNoteIndex]?.note === key.note
              const isDetectedKey = detectedNote === key.note

              return (
                <TouchableOpacity
                  key={key.note}
                  style={[
                    styles.whiteKey,
                    { width: keyWidth },
                    isCurrentKey && styles.currentKey,
                    isDetectedKey && styles.detectedKey,
                  ]}
                >
                  <Text style={[styles.keyLabel, (isCurrentKey || isDetectedKey) && styles.activeKeyLabel]}>
                    {key.display}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <View style={styles.blackKeysRow}>
            {blackKeys.map((key, index) => {
              const isDetectedKey = detectedNote === key.note
              const whiteKeyIndex = Math.floor(index / 5) * 7 + (index % 5 < 2 ? (index % 5) + 1 : (index % 5) + 2)
              const leftOffset = whiteKeyIndex * keyWidth + keyWidth * 0.7

              return (
                <TouchableOpacity
                  key={key.note}
                  style={[
                    styles.blackKey,
                    { left: leftOffset, width: keyWidth * 0.6 },
                    isDetectedKey && styles.detectedBlackKey,
                  ]}
                >
                  <Text style={[styles.blackKeyLabel, isDetectedKey && styles.activeKeyLabel]}>{key.display}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground} />

      {showPerfect && (
        <View style={styles.perfectOverlay}>
          <Text style={styles.perfectText}>✨ ✨ ✨ ✨ ✨</Text>
          <Text style={styles.perfectTitle}>Perfect!</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Twinkle Twinkle Little Star</Text>
        <TouchableOpacity onPress={() => setCurrentNoteIndex(0)} style={styles.headerButton}>
          <Icon name="refresh" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Score: {score}</Text>
        <Text style={styles.statusText}>
          Note {currentNoteIndex + 1} of {melody.length}
        </Text>
      </View>

      <View style={styles.staffContainer}>{renderMusicalStaff()}</View>

      <View style={styles.detectionStatus}>
        <Text style={styles.detectionText}>
          🎯 Target: {melody[currentNoteIndex]?.note || "Complete"} | 🎵 Detected:{" "}
          {detectedNote || "Play your piano..."} | 📊 {detectedFrequency ? `${detectedFrequency.toFixed(1)}Hz` : "0Hz"}{" "}
          | 🎤 {isListening ? `Listening (${(confidence * 100).toFixed(0)}%)` : "Stopped"}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.listeningButton]}
          onPress={isListening ? stopListening : startListening}
        >
          <Icon name={isListening ? "stop" : "mic"} size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.controlText}>
          {isListening ? "🎵 Listening for piano notes..." : "🎤 Tap to start detecting your piano"}
        </Text>
      </View>

      {renderPianoKeyboard()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#6366f1",
    opacity: 0.1,
  },
  perfectOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  perfectText: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 10,
  },
  perfectTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#60a5fa",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2d3748",
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  staffContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  detectionStatus: {
    backgroundColor: "#4a5568",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  detectionText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  pianoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pianoTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  pianoKeyboard: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 5,
    height: 120,
  },
  whiteKeysRow: {
    flexDirection: "row",
    height: "100%",
  },
  whiteKey: {
    height: "100%",
    backgroundColor: "#f8f9fa",
    marginHorizontal: 0.5,
    borderRadius: 4,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  blackKeysRow: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    height: "60%",
  },
  blackKey: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#343a40",
    borderRadius: 3,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 3,
  },
  keyLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#495057",
  },
  blackKeyLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#fff",
  },
  currentKey: {
    backgroundColor: "#60a5fa",
    borderColor: "#3b82f6",
  },
  detectedKey: {
    backgroundColor: "#10b981",
    borderColor: "#059669",
  },
  detectedBlackKey: {
    backgroundColor: "#10b981",
  },
  activeKeyLabel: {
    color: "#fff",
  },
  controls: {
    alignItems: "center",
    paddingBottom: 40,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#60a5fa",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listeningButton: {
    backgroundColor: "#ef4444",
  },
  controlText: {
    color: "#a0aec0",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
})
