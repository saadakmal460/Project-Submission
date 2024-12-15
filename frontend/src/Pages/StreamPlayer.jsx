import React, { useState, useEffect, useRef } from 'react';

const StreamPlayer = () => {
  const [isConnected, setIsConnected] = useState(false);  // Track WebSocket connection status
  const [frame, setFrame] = useState(null);  // Store received frame
  const [message, setMessage] = useState(null);  // Store received messages
  const canvasRef = useRef(null);  // Ref for the canvas element
  const videoRef = useRef(null);  // Ref for the video element
  const receiveSocketRef = useRef(null);  // WebSocket for receiving frames

  // Initialize WebSocket for receiving processed frames
  const initReceiveSocket = () => {
    receiveSocketRef.current = new WebSocket('ws://localhost:8000/ws/receive');

    // Handle WebSocket open event
    receiveSocketRef.current.onopen = () => {
      console.log('Connected to receive WebSocket');
      setIsConnected(true);  // Update the state when connected
    };

    console.log(receiveSocketRef.current.onmessage)

    // Handle incoming messages (frames or text)
    receiveSocketRef.current.onmessage = (event) => {
      // Check if the message is the frame or a text message from the server
      if (event.data.startsWith("Message received")) {
        console.log(event.data);  // Log the acknowledgment message
        setMessage(event.data);  // Set the acknowledgment message
      } else {
        // Handle frame data
        const blob = new Blob([event.data], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setFrame(url);  // Set the received frame
      }
    };

    // Handle WebSocket close event
    receiveSocketRef.current.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);  // Update the state when disconnected
    };
  };

  // Clean up WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      if (receiveSocketRef.current) {
        receiveSocketRef.current.close();  // Close WebSocket connection
      }
    };
  }, []);

  // Handle the button click to start receiving frames and establish the connection
  const handleStartReceiving = () => {
    if (!isConnected) {
      initReceiveSocket();  // Initialize WebSocket connection if not already connected
    } else {
      // If already connected, do nothing or handle other logic if needed
    }
  };

  // Draw the received frame on the canvas or display it in the video element
  useEffect(() => {
    if (frame && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.src = frame;  // Set the video source to the received frame URL
      videoElement.play();  // Play the video as soon as it's set
    }
  }, [frame]);

  return (
    <div>
      <h1>Processed Frames</h1>
      {isConnected ? (
        <p>WebSocket Connected. Receiving frames...</p>
      ) : (
        <div>
          <p>Not connected. Click the button to start receiving frames.</p>
          <button onClick={handleStartReceiving}>Start Receiving</button>
        </div>
      )}

      {message && <p>{message}</p>}  {/* Display the acknowledgment message */}
      
      {isConnected && (
        <>
          {/* Video element to display the frames */}
          <video ref={videoRef} width="640" height="480" style={{ border: '1px solid black' }} controls />
          {/* Or use the canvas if you prefer */}
          <canvas ref={canvasRef} width="640" height="480" style={{ border: '1px solid black' }} />
        </>
      )}
    </div>
  );
};

export default StreamPlayer;
