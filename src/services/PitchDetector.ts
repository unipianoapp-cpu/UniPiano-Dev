export class PitchDetector {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Float32Array | null = null
  private isDetecting = false

  async initialize(): Promise<void> {
    try {
      // @ts-ignore - AudioContext might not be available in React Native
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 4096
      this.dataArray = new Float32Array(this.analyser.frequencyBinCount)
    } catch (error) {
      console.error("Error initializing pitch detector:", error)
    }
  }

  async startDetection(callback: (frequency: number, confidence: number) => void): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      await this.initialize()
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.microphone = this.audioContext!.createMediaStreamSource(stream)
      this.microphone.connect(this.analyser!)

      this.isDetecting = true
      this.detectPitch(callback)
    } catch (error) {
      console.error("Error starting pitch detection:", error)
    }
  }

  private detectPitch(callback: (frequency: number, confidence: number) => void): void {
    if (!this.isDetecting || !this.analyser || !this.dataArray) return

    this.analyser.getFloatTimeDomainData(this.dataArray)

    const pitch = this.autoCorrelate(this.dataArray, this.audioContext!.sampleRate)
    const confidence = pitch > 0 ? 0.8 : 0

    callback(pitch, confidence)

    if (this.isDetecting) {
      requestAnimationFrame(() => this.detectPitch(callback))
    }
  }

  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    let bestOffset = -1
    let bestCorrelation = 0
    let rms = 0
    let foundGoodCorrelation = false
    const correlations = new Array(MAX_SAMPLES)

    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i]
      rms += val * val
    }
    rms = Math.sqrt(rms / SIZE)

    if (rms < 0.01) return -1

    let lastCorrelation = 1
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
      let correlation = 0
      for (let i = 0; i < MAX_SAMPLES; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset])
      }
      correlation = 1 - correlation / MAX_SAMPLES
      correlations[offset] = correlation

      if (correlation > 0.9 && correlation > lastCorrelation) {
        foundGoodCorrelation = true
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation
          bestOffset = offset
        }
      } else if (foundGoodCorrelation) {
        const shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset]
        return sampleRate / (bestOffset + 8 * shift)
      }
      lastCorrelation = correlation
    }

    if (bestCorrelation > 0.01) {
      return sampleRate / bestOffset
    }
    return -1
  }

  stopDetection(): void {
    this.isDetecting = false
    if (this.microphone) {
      this.microphone.disconnect()
      this.microphone = null
    }
  }
}
