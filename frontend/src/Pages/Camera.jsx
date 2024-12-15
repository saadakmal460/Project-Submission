import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';

const Camera = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const [location, setLocation] = useState("");
  


  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          await fetchLocation(latitude, longitude); // Call OpenCage
        },
        (error) => {
          console.error("Error getting location: ", error);
          setLocation("Location unavailable");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }
  const fetchLocation = async (latitude, longitude) => {
    try {
      const apiKey = "pk.7d819b7fc3045f8094db3aa6ae1fcd11"; // Replace with your API key
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();

      if (data && data.address) {
        const { house_number, road, neighbourhood, city, state, country } = data.address;
        setLocation(
          `${house_number || ""} ${road || ""}, ${neighbourhood || ""}, ${city || ""}, ${state || ""}, ${country || ""}`
        );
        console.log(data.display_name)
        axios.get(`http://localhost:8000/location?data=${data.display_name}`)
          .then((res) => {
            console.log(res.data)
          })
          .catch((error) => {
            console.error('There was an error fetching the location:', error);
          });


      } else {
        setLocation("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location: ", error);
      setLocation("Error fetching location");
    }
  };

  // Initialize WebSocket connection
  const initWebSocket = () => {
    socketRef.current = new WebSocket('ws://localhost:8000/ws'); // Replace with your backend WebSocket URL

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      setIsStreaming(true);

      // Send location first once the connection is established
      if (location) {
        socketRef.current.send(JSON.stringify({ type: 'location', data: location }));
      }
    };

    socketRef.current.onmessage = (event) => {
      const imageData = event.data;

      const blob = new Blob([imageData], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
      };
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsStreaming(false);
    };
  };

  // Start camera and send frames
  const startCamera = async () => {
    try {

      getLocation()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });



      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        const video = videoRef.current;

        const captureFrame = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob and send via WebSocket
          canvas.toBlob((blob) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(blob);
            }
          }, 'image/jpeg');
        };

        frameIntervalRef.current = setInterval(captureFrame, 100);
        initWebSocket();
      };
    } catch (err) {
      console.error('Error accessing camera: ', err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks();
    tracks?.forEach((track) => track.stop());

    setIsStreaming(false);

    clearInterval(frameIntervalRef.current);
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            border: '1px solid black',
            borderRadius: '8px',
            margin: '20px auto',
          }}
        />
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ visibility: "hidden", height: '10px', width: '10px' }}
        />
        <div className="flex justify-center items-center space-x-4 mt-4">
          {!isStreaming ? (
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-blue-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Start Stream
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-6 py-2 bg-red-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
            >
              Stop Stream
            </button>
          )}
        </div>
        {location && (<div className="location">
          <h4>Location</h4>
          <p>{location}</p>
        </div>)}
      </div>

      
    </div>
  );
};

export default Camera;
