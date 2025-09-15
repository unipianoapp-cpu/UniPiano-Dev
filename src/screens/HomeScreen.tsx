"use client"

import { useContext } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../contexts/AuthContext"

export default function HomeScreen({ navigation }: any) {
  const { user } = useContext(AuthContext)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.user_metadata?.name || "Student"}! 👋</Text>
        <Text style={styles.subtitle}>Ready to practice piano today?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="musical-notes" size={24} color="#6366f1" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Lessons Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#10b981" />
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>Minutes Today</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="play-circle" size={32} color="#6366f1" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Continue Learning</Text>
            <Text style={styles.actionSubtitle}>Pick up where you left off</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="mic" size={32} color="#10b981" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Practice Session</Text>
            <Text style={styles.actionSubtitle}>Record and get feedback</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Piano Practice</Text>

        <TouchableOpacity style={styles.pianoCard} onPress={() => navigation.navigate("PianoLesson")}>
          <Ionicons name="musical-note" size={32} color="#8b5cf6" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Song Learning</Text>
            <Text style={styles.actionSubtitle}>Twinkle Twinkle Little Star with note recognition</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pianoCard} onPress={() => navigation.navigate("NoteRecognition")}>
          <Ionicons name="analytics" size={32} color="#06b6d4" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Note Recognition Test</Text>
            <Text style={styles.actionSubtitle}>Test sound recognition with 5-octave piano</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.pianoCard} onPress={() => navigation.navigate("FreePractice")}>
          <Ionicons name="piano" size={32} color="#f97316" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Free Practice</Text>
            <Text style={styles.actionSubtitle}>Practice with real-time note detection</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <View style={styles.achievementCard}>
          <Ionicons name="star" size={24} color="#f59e0b" />
          <Text style={styles.achievementText}>First Scale Mastered! 🎉</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
  },
  achievementText: {
    fontSize: 16,
    color: "#92400e",
    marginLeft: 12,
    fontWeight: "500",
  },
  pianoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
})
