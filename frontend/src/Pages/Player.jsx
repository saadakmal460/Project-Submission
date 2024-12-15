import React, { useRef, useEffect } from 'react';

const Player = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videoUrl; // Set the video source from the prop
      videoRef.current.play().then(() => {
        const stream = videoRef.current.captureStream();
        if (stream.getTracks().length > 0) {
          mediaRecorderRef.current = new MediaRecorder(stream);

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunks.current.push(event.data);
            }
          };
        } else {
          console.error("No media tracks available");
        }
      }).catch((error) => {
        console.error("Error playing video:", error);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [videoUrl]);

  const startRecording = () => {
    recordedChunks.current = []; // Clear previous recordings
    mediaRecorderRef.current.start();
  };

  const stopRecording = async () => {
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Optionally download the recorded video
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recorded_video.webm';
      a.click();

      URL.revokeObjectURL(url); // Clean up the URL
    };
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div>
      <h1>Video Player</h1>
      <video ref={videoRef} controls style={{ width: '100%', height: 'auto' }} />
      <div>
        <button onClick={handlePlayVideo}>Play Video</button>
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
      </div>
    </div>
  );
};

export default Player;
