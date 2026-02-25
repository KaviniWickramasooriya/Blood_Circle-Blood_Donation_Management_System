import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-box text-center">
        <h1 className="display-1 text-danger">404</h1>
        <h2 className="mb-3">Oops! Page not found</h2>
        <p className="text-muted">The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;
