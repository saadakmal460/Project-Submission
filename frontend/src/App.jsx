import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import SignUp from './Components/Auth/SignUp';
import LandingPage from './Pages/LandingPage';
import SkinCancerDetection from './Pages/Detection';
import './App.css';
import SignIn from './Components/Auth/SignIn';
import Dashboard from './Components/Dashboard/Dashboard';
import CameraRecorder from './Pages/Camera';
import VideoPlayer from './Pages/Player';
import Page from './Components/TP/Page';
import CameraPage from './Pages/CameraPage';
import Camera from './Pages/Camera';
import StreamPlayer from './Pages/StreamPlayer';
import CameraStream from './Pages/Camera2'
import UsersManagment from './Components/Admin/AddUser';
import EditandDelete from './Components/Admin/EditandDelete';
import UploadVideo from './Pages/UploadVideo';



function App() {
  return (

    <Router> {/* Wrap your app with Router */}
      <div>
        <Navbar/>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/police" element={<Page />} />
          <Route path="/camera" element={<CameraStream />} />
          <Route path="/stream" element={<StreamPlayer />} />

          <Route path="/detection" element={<SkinCancerDetection />} /> 
          <Route path="/admin/add" element={<UsersManagment />} /> 
          <Route path="/admin/manage" element={<EditandDelete />} /> 

          <Route path="/" element={<CameraPage />} />
          <Route path="/upload" element={<UploadVideo />} />
         

          
          

        </Routes>
      </div>
    </Router>

    
  );
}

export default App;
