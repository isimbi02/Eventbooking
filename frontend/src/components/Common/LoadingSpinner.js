import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid #f3f3f3', 
        borderTop: '4px solid #1976d2', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;