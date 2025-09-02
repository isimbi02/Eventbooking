import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p>{message || 'An error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn primary" style={{ marginTop: '1rem' }}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;