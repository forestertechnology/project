import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateMenu from './pages/CreateMenu';
import HomePage from './pages/HomePage';
import AuthCallback from './pages/auth/callback';
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantSetup from './components/RestaurantSetup';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/create-menu" element={
        <ProtectedRoute>
          <CreateMenu />
        </ProtectedRoute>
      } />
      <Route path="/setup" element={
        <ProtectedRoute>
          <RestaurantSetup />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
