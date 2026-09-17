import './LoadingScreen.css';

export default function LoadingScreen({ message = 'Loading...', fullScreen = true }) {
  return (
    <div className={`loading-screen ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <h1 className="loading-brand">Priya Textiles</h1>
        </div>
        
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <p className="loading-message">{message}</p>
        
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
}
