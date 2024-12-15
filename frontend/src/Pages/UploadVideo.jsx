import React, { useState, useRef } from 'react';
import axios from 'axios';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';

const UploadVideo = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [fileProgress, setFileProgress] = useState(0);
    const [fileUploadError, setFileUploadError] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [uploading, setUploading] = useState(false);  // Track upload state
    const [analyzing, setAnalyzing] = useState(false);  // Track analyzing state
    const [response, setResponse] = useState(null)
    const [location, setLocation] = useState('')

    const handleFileChange = () => {
        const file = fileInputRef.current.files[0];
        if (file) {
            setError(null);
            setVideoFile(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click(); // Trigger file input click programmatically
    };

    const handleUpload = async () => {
        setUploading(true); // Start upload state
        handleFileUpload(videoFile);
    };

    const handleFileUpload = async (file) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const fileRef = ref(storage, fileName);

        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setFileProgress(Math.round(progress));
            },
            (error) => {
                setFileUploadError(true);
                setUploading(false); // Stop uploading state
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    const currentTime = new Date().toISOString();
                    setVideoUrl(downloadUrl);
                    setUploading(false); // Stop uploading state
                    setAnalyzing(true);  // Start analyzing state

                    // Call API after upload
                    axios
                        .get(`http://localhost:8000/check`, {
                            params: {
                                query: downloadUrl,
                            },
                        })
                        .then((apiResponse) => {
                            console.log('Server Response:', apiResponse.data);
                            setResponse(apiResponse.data)


                            if (apiResponse.data.illegal_vendors) {
                                axios.post('', {
                                    title: "Illegal Vendor Detected",
                                    location: location,
                                    time: currentTime,
                                    status: 'Unconfirmed'
                                });
                            }

                            if (apiResponse.data.illegal_vehicles) {
                                axios.post('', {
                                    title: "Illegal Vehicle Detected",
                                    location: location,
                                    time: currentTime,
                                    status: 'Unconfirmed'
                                });
                            }
                            setAnalyzing(false); // Stop analyzing state
                        })
                        .catch((error) => {
                            console.error('Error calling the server:', error);
                            setAnalyzing(false); // Stop analyzing state in case of error
                        });
                });
            }
        );
    };


    return (
        <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-md bg-white mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-center">Upload Your Video</h2>

            <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Add Location</label>
                <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Enter location"
                />
            </div>
            {/* File input and button */}
            <input
                ref={fileInputRef} // Attach the ref to the input
                accept="video/*"
                id="video-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                onClick={handleButtonClick}
            >
                {videoFile ? videoFile.name : 'Choose Video File'}
            </button>

            {/* Upload button */}
            {videoFile && (
                <button
                    className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
                    onClick={handleUpload}
                >
                    Upload Video
                </button>
            )}

            {/* Display error */}
            {error && (
                <div className="mt-4 text-red-500 text-center">
                    <p>{error}</p>
                </div>
            )}

            {/* Loader for uploading */}
            {uploading && (
                <div className="mt-4 text-center">
                    <p>Uploading...</p>
                    <div className="border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
                </div>
            )}

            {/* Loader for analyzing */}
            {analyzing && (
                <div className="mt-4 text-center">
                    <p>Analyzing...</p>
                    <div className="border-t-4 border-green-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
                </div>
            )}

            {!analyzing && response && (
                <div className="mt-4 text-center">
                    <div className="mt-4 text-center">
                        <p className="text-green-500">Analysis Completed! Your output video has been downloaded to your Downloads folder.</p>
                    </div>

                    {response.illegal_vendors && (
                        <p className="text-red-500">Illegal vendors detected. Immediate action is recommended.</p>
                    )}
                    {response.illegal_vehicles && (
                        <p className="text-red-500">Illegal vehicles detected. Authorities should be notified.</p>
                    )}
                    {!(response.illegal_vendors || response.illegal_vehicles) && (
                        <p className="text-green-500">No illegal activities detected. Video is clean.</p>
                    )}
                </div>
            )}

        </div>
    );
};

export default UploadVideo;
