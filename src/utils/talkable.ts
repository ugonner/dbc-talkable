export const getLocalBaseIp = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("");
    pc.onicecandidate = (evt: RTCPeerConnectionIceEvent) => {
      console.log("OnCANDIDTATE EVENT", evt.candidate?.candidate);
        const ipMatch = evt.candidate?.candidate?.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (!ipMatch) reject;
      if (Array.isArray(ipMatch)) resolve(ipMatch[0]);
    };
    pc.createOffer().then((offer) => pc.setLocalDescription(offer));
  });
};
