import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import VendorManagement from './pages/Vendors';
import CandidateManagement from './pages/Candidates';
import VideoManagement from './pages/Videos';
import VideoDetails from './pages/VideoDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/vendors" element={<VendorManagement />} />
        <Route path="/candidates" element={<CandidateManagement />} />
        <Route path="/videos" element={<VideoManagement />} />
        <Route path="/videos/:id" element={<VideoDetails />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
