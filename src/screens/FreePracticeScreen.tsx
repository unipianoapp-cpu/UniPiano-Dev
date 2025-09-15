"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function FreePracticeScreen({ navigation }: any) {
  const [isListening, setIsListening] = useState(false)
  const [detectedNote, setDetectedNote] = useState<string | null>(null)
  const [playedNotes, setPlayedNotes] = useState<string[]>([])

  // Generate 2 octaves for practice
  const generatePracticeKeys = () => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const keys = []

    for (let octave = 4; octave <= 5; octave++) {
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

  const practiceKeys = generatePracticeKeys()

  const startListening = () => {
    setIsListening(true)
    Alert.alert("Free Practice", "Microphone access would be implemented here")
  }

  const stopListening = () => {
    setIsListening(false)
    setDetectedNote(null)
  }

  const playKey = (note: string) => {
    setDetectedNote(note)
    setPlayedNotes((prev) => [...prev.slice(-9), note]) // Keep last 10 notes

    // Simulate note playing
    setTimeout(() => {
      setDetectedNote(null)
    }, 500)
  }

  const clearNotes = () => {
    setPlayedNotes([])
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Free Practice</Text>
        <TouchableOpacity onPress={clearNotes}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Current Note Display */}
      <View style={styles.currentNoteContainer}>
        <Text style={styles.currentNoteTitle}>Current Note</Text>
        <Text style={styles.currentNote}>{detectedNote || (isListening ? "Listening..." : "Play a note")}</Text>
      </View>

      {/* Piano Keyboard */}
      <View style={styles.pianoContainer}>
        <Text style={styles.pianoTitle}>Practice Piano (2 Octaves)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.keysContainer}>
            {practiceKeys
              .filter((key) => !key.isBlack)
              .map((key) => (
                <View key={key.note} style={styles.keyGroup}>
                  <TouchableOpacity
                    style={[styles.whiteKey, detectedNote === key.note && styles.activeKey]}
                    onPress={() => playKey(key.note)}
                  >
                    <Text style={styles.keyLabel}>{key.note}</Text>
                  </TouchableOpacity>

                  {/* Black keys */}
                  {practiceKeys.find(
                    (k) =>
                      k.isBlack && k.note.startsWith(key.note[0]) && k.note.endsWith(key.note[key.note.length - 1]),
                  ) && (
                    <TouchableOpacity
                      style={[
                        styles.blackKey,
                        detectedNote ===
                          practiceKeys.find(
                            (k) =>
                              k.isBlack &&
                              k.note.startsWith(key.note[0]) &&
                              k.note.endsWith(key.note[key.note.length - 1]),
                          )?.note && styles.activeBlackKey,
                      ]}
                      onPress={() => {
                        const blackKey = practiceKeys.find(
                          (k) =>
                            k.isBlack &&
                            k.note.startsWith(key.note[0]) &&
                            k.note.endsWith(key.note[key.note.length - 1]),
                        )
                        if (blackKey) playKey(blackKey.note)
                      }}
                    >
                      <Text style={styles.blackKeyLabel}>
                        {
                          practiceKeys.find(
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
          <Text style={styles.buttonText}>{isListening ? "Stop Listening" : "Start Listening"}</Text>
        </TouchableOpacity>
      </View>

      {/* Played Notes History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recently Played Notes</Text>
        <View style={styles.notesGrid}>
          {playedNotes.map((note, index) => (
            <View key={index} style={styles.noteChip}>
              <Text style={styles.noteChipText}>{note}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: "#f59e0b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  currentNoteContainer: {
    backgroundColor: "#16213e",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  currentNoteTitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 10,
  },
  currentNote: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fbbf24",
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
    width: 40,
    height: 140,
    marginHorizontal: 1,
    borderRadius: 6,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  blackKey: {
    backgroundColor: "#000",
    width: 28,
    height: 90,
    position: "absolute",
    top: 0,
    right: -14,
    borderRadius: 4,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
  },
  activeKey: {
    backgroundColor: "#fbbf24",
  },
  activeBlackKey: {
    backgroundColor: "#f59e0b",
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  blackKeyLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#f59e0b",
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
    marginBottom: 15,
  },
  notesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  noteChip: {
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noteChipText: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "bold",
  },
})
