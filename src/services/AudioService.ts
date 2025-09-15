import { PermissionsAndroid, Platform } from "react-native"
import AudioRecord from "react-native-audio-record"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"

export interface PitchDetectionResult {
  frequency: number
  note: string
  octave: number
  confidence: number
}

class AudioService {
  private isRecording = false
  private pitchDetectionCallback?: (result: PitchDetectionResult) => void
  private audioBuffer: number[] = []

  constructor() {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6, // VOICE_RECOGNITION
      wavFile: "audio.wav",
    }
    AudioRecord.init(options)
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
          title: "Microphone Permission",
          message: "Piano Learning App needs access to your microphone to detect piano notes.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        const result = await check(PERMISSIONS.IOS.MICROPHONE)
        if (result === RESULTS.GRANTED) {
          return true
        }
        const requestResult = await request(PERMISSIONS.IOS.MICROPHONE)
        return requestResult === RESULTS.GRANTED
      }
    } catch (error) {
      console.error("Error requesting microphone permission:", error)
      return false
    }
  }

  async startPitchDetection(callback: (result: PitchDetectionResult) => void): Promise<void> {
    const hasPermission = await this.requestMicrophonePermission()
    if (!hasPermission) {
      throw new Error("Microphone permission denied")
    }

    this.pitchDetectionCallback = callback
    this.isRecording = true

    try {
      AudioRecord.start()

      AudioRecord.on("data", (data: string) => {
        if (this.isRecording && this.pitchDetectionCallback) {
          const audioData = this.base64ToArrayBuffer(data)
          const frequency = this.detectPitch(audioData)

          if (frequency > 80 && frequency < 2000) {
            const { note, octave } = this.frequencyToNote(frequency)
            const result: PitchDetectionResult = {
              frequency,
              note,
              octave,
              confidence: 0.8,
            }
            this.pitchDetectionCallback(result)
          }
        }
      })
    } catch (error) {
      console.error("Error starting pitch detection:", error)
      throw error
    }
  }

  async stopPitchDetection(): Promise<void> {
    this.isRecording = false
    this.pitchDetectionCallback = undefined

    try {
      AudioRecord.stop()
    } catch (error) {
      console.error("Error stopping pitch detection:", error)
    }
  }

  private base64ToArrayBuffer(base64: string): Float32Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const floatArray = new Float32Array(bytes.length / 2)
    for (let i = 0; i < floatArray.length; i++) {
      const int16 = (bytes[i * 2 + 1] << 8) | bytes[i * 2]
      floatArray[i] = int16 / 32768.0
    }
    return floatArray
  }

  private detectPitch(audioData: Float32Array): number {
    const sampleRate = 16000
    const minPeriod = Math.floor(sampleRate / 800)
    const maxPeriod = Math.floor(sampleRate / 80)

    let bestCorrelation = 0
    let bestPeriod = 0

    for (let period = minPeriod; period < maxPeriod && period < audioData.length / 2; period++) {
      let correlation = 0
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period]
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestPeriod = period
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0
  }

  frequencyToNote(frequency: number): { note: string; octave: number } {
    const A4 = 440
    const C0 = A4 * Math.pow(2, -4.75)

    if (frequency > 0) {
      const h = Math.round(12 * Math.log2(frequency / C0))
      const octave = Math.floor(h / 12)
      const n = h % 12
      const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
      return { note: notes[n], octave }
    }

    return { note: "", octave: 0 }
  }
}

export default new AudioService()
