class PCMBatchProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.targetSampleRate = 16000; // Target sample rate for Vosk
      this.sourceSampleRate = sampleRate; // Sample rate of the input audio
      this.buffer = [];
      this.batchSize = 16000;

      this.targetSampleRate = 16000;
      this.currentSampleRate = null;
  
      this.port.onmessage = (event) => {
        if (event.data.sampleRate) {
          this.currentSampleRate = event.data.sampleRate;
        }
      };
    }
  

    process(inputs, outputs) {
      try{
        const input = inputs[0];
        if (input && input[0]) {
          let channelData = input[0];
         
          this.port.postMessage(channelData);
          return true; // Send the resampled PCM buffer
          
        }
        return true; // Keep the processor alive
      }catch(error){
        console.log("Error at worklet process", error.message)
        return true; // Keep the processor alive
      }
    }
  
    float32ToInt16(buffer) {
      const int16Buffer = new Int16Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        int16Buffer[i] = Math.max(-1, Math.min(1, buffer[i])) * 32767;
      }
      return int16Buffer;
    }
    // Linear interpolation resampling
    resample(input, inputSampleRate, targetSampleRate) {
      
      const inputLength = input?.length;
      const outputLength = Math.round((inputLength * targetSampleRate) / inputSampleRate);
      const output = new Float32Array(outputLength);
  
      for (let i = 0; i < outputLength; i++) {
        const sourceIndex = (i * inputSampleRate) / targetSampleRate;
        const indexFloor = Math.floor(sourceIndex);
        const indexCeil = Math.min(indexFloor + 1, inputLength - 1);
        const weight = sourceIndex - indexFloor;
  
        output[i] = input[indexFloor] * (1 - weight) + input[indexCeil] * weight;
      }
  
      return output;
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
        resampled[i] = buffer[floorIndex] * (1 - weight) + buffer[ceilIndex] * weight;
      }
  
      // Remove processed samples from the buffer
      const newBufferStartIndex = Math.floor(targetLength * ratio);
      this.buffer = this.buffer.slice(newBufferStartIndex);
  
      return resampled;
    }
  }
  
  registerProcessor('pcm-batch-processor', PCMBatchProcessor);