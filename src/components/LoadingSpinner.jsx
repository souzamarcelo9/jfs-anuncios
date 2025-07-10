import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>Saving data...</p>
    </div>
  );
};

export default LoadingSpinner;