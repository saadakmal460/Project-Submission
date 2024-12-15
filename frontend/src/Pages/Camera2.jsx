import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CameraStream = () => {
  const videoRef = useRef(null);
  const sendSocketRef = useRef(null);  // WebSocket for sending frames
  const [isStreaming, setIsStreaming] = useState(false);
  const navigate = useNavigate();

  // Initialize WebSocket for sending frames
  const initSendSocket = () => {
    sendSocketRef.current = new WebSocket('ws://localhost:8000/ws/send');
    sendSocketRef.current.onopen = () => {
      console.log('Connected to send WebSocket');
    };
  };

  // Start the camera and initialize WebSockets
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        const video = videoRef.current;
        initSendSocket();   // Initialize send socket

        const captureFrame = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (sendSocketRef.current) {
              sendSocketRef.current.send(blob);  // Send frame to the server
            }
          }, 'image/jpeg');
        };

        setIsStreaming(true);
        setInterval(captureFrame, 100);  // Capture and send frames every 100ms
      };
    } catch (err) {
      console.error('Error accessing camera: ', err);
    }
  };

  // Stop the camera and WebSocket connections
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => track.stop());
    setIsStreaming(false);
    if (sendSocketRef.current) sendSocketRef.current.close();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline style={{ visibility: 'hidden', height: '10px', width: '10px' }} />
      {!isStreaming ? (
        <button onClick={startCamera}>Start Streaming</button>
      ) : (
        <button onClick={stopCamera}>Stop Streaming</button>
      )}
      <button onClick={() => navigate('/receive')}>Go to Processed Frames</button>
    </div>
  );
};

export default CameraStream;
