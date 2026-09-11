import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken } from '../services/authService';

const STORAGE_KEY = 'priya-textiles-user';

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userString));
        
        // Store token and user data
        setAuthToken(token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event('userChanged'));
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
        
        // Reload to update UI
        window.location.reload();
      } catch (error) {
        console.error('Error processing Google auth:', error);
        navigate('/login?error=invalid_response');
      }
    } else {
      navigate('/login?error=missing_credentials');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="loader"></div>
      <p>Completing Google Sign-In...</p>
    </div>
  );
}
