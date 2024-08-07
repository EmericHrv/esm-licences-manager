import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StockPage from './pages/StockPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage'; // Importez le composant NotFoundPage

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};


const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/" /> : children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={
        <PrivateRoute>
          <HomePage />
        </PrivateRoute>
      } />
      <Route path="/stock" element={
        <PrivateRoute>
          <StockPage />
        </PrivateRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="*" element={<NotFoundPage />} /> {/* Route pour la page 404 */}
    </Routes>
  );
};

export default App;
