class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.port.onmessage = (event) => {
        this.port.postMessage(event.data);
      };
    }
  
    process(inputs) {
      const input = inputs[0];
      if (input && input[0]) {
        // Flatten the input audio samples
        const audioData = input[0];
        this.port.postMessage(audioData); // Send to the main thread
      }
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  