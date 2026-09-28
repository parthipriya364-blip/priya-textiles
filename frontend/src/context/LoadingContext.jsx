import { createContext, useContext, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, setLoadingMessage }}>
      {isLoading && <LoadingScreen message={loadingMessage} />}
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
