// DashboardWithNotifications.jsx
import React, { useState, useEffect, useRef } from 'react';
import LandingPage from '../../Pages/LandingPage';
import Camera from '../../Pages/Camera';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'
import { Link } from 'react-router-dom';

const Notification = ({ title, location, time, status, onConfirm, onDelete }) => (
  <div className="bg-white shadow overflow sm:rounded-lg mb-4 p-4">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500">Location: {location}</p>
    <p className="text-sm text-gray-500">Time: {time}</p>
    <p className={`text-sm font-medium ${status === 'Confirm' ? 'text-yellow-500' : status === 'Resolved' ? 'text-green-500' : 'text-red-500'}`}>
      Status: {status === 'Confirm' ? 'Pending' : status === 'Resolved' ? 'Resolved' : 'Unconfirmed'}
    </p>

    <div className="mt-2 flex space-x-2">
      <button
        onClick={onConfirm}
        className="bg-custom-green text-white py-1 px-3 rounded hover:bg-hover-green"
      >
        Confirm
      </button>
      <button
        onClick={onDelete}
        className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  </div>
);

const ResolvedNotification = ({ title, location, time, status, resolvedBy }) => (
  <div className="bg-white shadow overflow sm:rounded-lg mb-4 p-4">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500">Location: {location}</p>
    <p className="text-sm text-gray-500">Time: {time}</p>
    <p className={`text-sm font-medium ${status === 'Resolved' ? 'text-green-500' : 'text-red-500'}`}>Status: {status}</p>
    <p className="text-sm text-gray-500">Resolved by: {resolvedBy}</p>
  </div>
);


const PendingNotification = ({ title, location, time, status }) => (
  <div className="bg-white shadow overflow sm:rounded-lg mb-4 p-4">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500">Location: {location}</p>
    <p className="text-sm text-gray-500">Time: {time}</p>
    <p className={`text-sm font-medium ${status === 'Confirm' ? 'text-yellow-500' : status === 'Resolved' ? 'text-green-500' : 'text-red-500'}`}>
      Status: {status === 'Confirm' ? 'Pending' : status === 'Resolved' ? 'Resolved' : 'Unconfirmed'}
    </p>
  </div>
);

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle video file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };

  // Simulate file upload (for demo)
  const handleUpload = () => {
    setUploading(true);
    let uploadProgress = 0;

    const uploadInterval = setInterval(() => {
      if (uploadProgress < 100) {
        uploadProgress += 10;
        setProgress(uploadProgress);
      } else {
        clearInterval(uploadInterval);
        setUploading(false);
        alert('Video uploaded successfully!');
      }
    }, 500); // Simulate upload progress
  };

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://aibackend-us18nadk.b4a.run/api/getAll');
      setNotifications(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching detections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();  // Call the function when the component mounts
  }, []);


  const handleConfirm = async (index) => {

    try {
      // Extract the ID from the notification (assuming each notification has an `id` property)
      setLoading(true)
      const notificationId = index;

      // Send PUT request to the backend
      const response = await axios.put(`https://aibackend-us18nadk.b4a.run/api/confirm/${notificationId}`);

      // Handle response if needed
      if (response.status === 200) {
        console.log(`Notification ${index} confirmed`);
        // Optionally, you can update the notification status in the UI if needed

        fetchDetections()
        setLoading(false)

      }
    } catch (error) {
      setLoading(false)
      console.error('Error confirming notification:', error);
    }

  };


  const handleDelete = async (index) => {
    const confirmed = window.confirm('Are you sure you want to delete this notification?');
    if (confirmed) {
      try {
        setLoading(true)
        // Extract the ID from the notification (assuming each notification has an `id` property)
        const notificationId = index;

        // Send PUT request to the backend
        const response = await axios.delete(`https://aibackend-us18nadk.b4a.run/api/delete/${notificationId}`);

        // Handle response if needed
        if (response.status === 200) {
          console.log(`Notification ${index} confirmed`);
          // Optionally, you can update the notification status in the UI if needed

          fetchDetections()
        }
      } catch (error) {
        setLoading(false)
        console.error('Error confirming notification:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard & Notifications</h1>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Flex Container for Video Feed and Notifications */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Real-Time Video Feed Section */}
            <div className="h-full flex-1 bg-white overflow-hidden sm:rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Real-Time Video Feed</h2>
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <Camera />
              </div>

              {/* Move the Video Upload Section outside the Camera component */}
              <div className="max-w-xl mx-auto p-6 border rounded-lg shadow-md bg-white mt-8">

                <Link to='/upload'>
                  <h2 className="text-2xl font-semibold mb-4 text-center"> OR <br />Upload Your Video</h2>
                </Link>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 w-full sm:w-1/3">
              <h2 className="text-xl font-semibold mb-4">Incidents Detected</h2>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <CircularProgress size={40} color="primary" />
                  </div>
                ) : (
                  notifications.filter(notification => notification.status == 'Unconfirmed').map((notification, index) => (
                    <Notification
                      key={index}
                      {...notification}
                      onConfirm={() => handleConfirm(notification._id)}
                      onDelete={() => handleDelete(notification._id)}
                    />
                  ))
                )}
              </div>

              <h2 className="text-xl font-semibold mt-8 mb-4">Pending Incidents</h2>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <CircularProgress size={40} color="success" />
                  </div>
                ) : (
                  notifications.filter(notification => notification.status === 'Confirm').map((notification, index) => (
                    <PendingNotification
                      key={index}
                      title={notification.title}
                      location={notification.location}
                      time={notification.time}
                      status={notification.status}

                    />
                  ))
                )}
              </div>

              <h2 className="text-xl font-semibold mt-8 mb-4">Resolved Incidents</h2>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <CircularProgress size={40} color="success" />
                  </div>
                ) : (
                  notifications.filter(notification => notification.status === 'Resolved').map((notification, index) => (
                    <ResolvedNotification
                      key={index}
                      title={notification.title}
                      location={notification.location}
                      time={notification.time}
                      status={notification.status}
                      resolvedBy={notification.resolvedBy?.username || 'Unknown'}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
