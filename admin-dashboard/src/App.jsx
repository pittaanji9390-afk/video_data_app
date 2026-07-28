import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import VendorManagement from './pages/Vendors';
import CandidateManagement from './pages/Candidates';
import VideoManagement from './pages/Videos';
import VideoDetails from './pages/VideoDetails';
import QCReview from './pages/QCReview';
import PaymentDashboard from './pages/Payments';
import AnalyticsDashboard from './pages/Analytics';

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
        <Route path="/qc-review/:id" element={<QCReview />} />
        <Route path="/payments" element={<PaymentDashboard />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
