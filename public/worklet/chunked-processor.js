class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000; // Target sample rate for Vosk
    this.sourceSampleRate = sampleRate; // Sample rate of the input audio
    this.buffer = [];
    this.chunkSize = 4096; // Process audio in 4096-sample chunks
  }

  process(inputs) {
    const input = inputs[0]; // Get the input channel
    if (input && input[0]) {
      this.buffer.push(...input[0]);

      if (this.buffer.length >= this.chunkSize) {
        const chunk = this.buffer.slice(0, this.chunkSize);
        this.buffer = this.buffer.slice(this.chunkSize);

        const resampledBuffer = this.resampleBuffer(
          chunk,
          this.sourceSampleRate,
          this.targetSampleRate
        );
        if (resampledBuffer) {
          const int16Buffer = this.float32ToInt16(resampledBuffer);
          this.port.postMessage(int16Buffer.buffer); // Send the resampled PCM buffer
        }
      }
    }

    return true; // Keep the processor alive
  }

  float32ToInt16(buffer) {
    const int16Buffer = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      int16Buffer[i] = Math.max(-1, Math.min(1, buffer[i])) * 32767;
    }
    return int16Buffer;
  }

  resampleBuffer(buffer, sourceRate, targetRate) {
    if (!buffer || buffer.length === 0) return null;

    const ratio = sourceRate / targetRate;
    const targetLength = Math.floor(buffer.length / ratio);
    const resampled = new Float32Array(targetLength);

    for (let i = 0; i < targetLength; i++) {
      const sourceIndex = i * ratio;
      const floorIndex = Math.floor(sourceIndex);
      const ceilIndex = Math.min(Math.ceil(sourceIndex), buffer.length - 1);

      // Linear interpolation for smooth resampling
      const weight = sourceIndex - floorIndex;
      resampled[i] =
        buffer[floorIndex] * (1 - weight) + buffer[ceilIndex] * weight;
    }

    // Remove processed samples from the buffer
    const newBufferStartIndex = Math.floor(targetLength * ratio);
    this.buffer = this.buffer.slice(newBufferStartIndex);

    return resampled;
  }
}

registerProcessor("chunked-audio-processor", AudioProcessor);
