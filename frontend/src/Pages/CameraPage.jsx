import React, { useEffect, useRef, useState } from 'react';

const CameraPage = () => {
  const localVideoRef = useRef(null);
  const processedVideoRef = useRef(null);
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    const initWebSocket = () => {
      // Create WebSocket connection
      socketRef.current = new WebSocket('ws://localhost:8000/ws');

      // Handle incoming messages
      socketRef.current.onmessage = (event) => {
        const imageData = event.data;

        // Create a blob from the received image data
        const blob = new Blob([imageData], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);

        // Create an image and draw it on the canvas for debugging
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;  // Set canvas width to image width
          canvas.height = img.height; // Set canvas height to image height
          ctx.drawImage(img, 0, 0);   // Draw the image on the canvas
          URL.revokeObjectURL(url);    // Cleanup the object URL
        };

        // Update processed video source as well
        if (processedVideoRef.current) {
          // Reset the video source to allow it to update
          processedVideoRef.current.srcObject = null; // Clear the previous source
          processedVideoRef.current.src = url;

          // Wait until the new video source is loaded
          processedVideoRef.current.onloadeddata = () => {
            processedVideoRef.current.play(); // Ensure the video starts playing
            console.log("Processed video updated and playing");
          };
        }
      };

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setStreaming(true);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setStreaming(false);
      };
    };

    const captureVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      localVideoRef.current.srcObject = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);

      const sendFrame = async () => {
        const bitmap = await imageCapture.grabFrame();
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        // Convert canvas to blob and send it to the backend
        canvas.toBlob((blob) => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(blob);
          }
        }, 'image/jpeg');

        requestAnimationFrame(sendFrame);
      };

      sendFrame();
    };

    initWebSocket();
    captureVideo();

    return () => {
      // Cleanup WebSocket connection on unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>Local Stream</h2>
      <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px', marginRight: '20px' }} />
      <h2>Processed Stream</h2>
      <video ref={processedVideoRef} autoPlay muted playsInline style={{ width: '300px' }} />
      <h2>Debug Canvas</h2>
      <canvas ref={canvasRef} style={{ border: '1px solid black', marginTop: '20px' }} />
      {!streaming && <p>Connecting to WebSocket...</p>}
    </div>
  );
};

export default CameraPage;
