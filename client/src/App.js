import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import CreateSegment from './pages/CreateSegment';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="segments" element={<Segments />} />
        <Route path="segments/create" element={<CreateSegment />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/create" element={<CreateCampaign />} />
        <Route path="campaigns/:id" element={<CampaignDetails />} />
      </Route>
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default App; 