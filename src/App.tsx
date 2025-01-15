import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { SessionExpirationWarning } from './components/SessionExpirationWarning';
import { DashboardButton } from './components/DashboardButton';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CreateMenu from './pages/CreateMenu';
import EditMenuItem from './pages/EditMenuItem';

function App() {
  return (
    <>
      <SessionExpirationWarning />
      <DashboardButton />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-menu" 
          element={
            <ProtectedRoute>
              <CreateMenu />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-menu-item/:id" 
          element={
            <ProtectedRoute>
              <EditMenuItem />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
