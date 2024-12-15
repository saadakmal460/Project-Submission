import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Notification = ({ message, location, time, status, onConfirm }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4 p-4">
    <h2 className="text-lg font-semibold text-gray-900">{message}</h2>
    <p className="text-sm text-gray-500">Location: {location}</p>
    <p className="text-sm text-gray-500">Time: {time}</p>
    <p
      className={`text-sm font-medium ${
        status === 'Confirm' ? 'text-red-500' : status === 'Resolved' ? 'text-green-500' : ''
      }`}
    >
      Status: {status === 'Confirm' ? 'Pending' : status === 'Resolved' ? 'Resolved' : status}
    </p>

    <div className="mt-2 flex space-x-2">
      <button
        onClick={onConfirm}
        className="bg-custom-green text-white py-1 px-3 rounded hover:bg-hover-green"
      >
        Mark as Resolve
      </button>
    </div>
  </div>
);

const Page = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://aibackend-us18nadk.b4a.run/api/pending');
      setNotifications(response.data.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching detections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections(); // Call the function when the component mounts
  }, []);

  const handleResolve = async (id) => {
    try {
      setLoading(true);
      const notificationId = id;
      const response = await axios.put(
        `https://aibackend-us18nadk.b4a.run/api/resolve/${notificationId}`,
        { user_id: currentUser._id }
      );

      if (response.status === 200) {
        console.log(`Notification ${notificationId} resolved`);
        fetchDetections(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error confirming notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 w-full sm:w-1/3 relative mt-3">
      <h2 className="text-xl font-semibold mb-4">Incidents Detected</h2>

      {/* Show Loader */}
      {loading && (
        <Box
          className="absolute inset-0 flex items-center justify-center"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent overlay
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Display Notifications */}
      {!loading &&
        notifications.map((notification, index) => (
          <Notification
            key={index}
            {...notification}
            onConfirm={() => handleResolve(notification._id)}
          />
        ))}
    </div>
  );
};

export default Page;
