import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSignInAlt, FaGoogle } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { login } from "../services/authService";
import { getGoogleAuthUrl } from "../config";
import { isValidEmail, isValidPassword } from "../utils/validators";
import "./style/Auth.css";

export default function Login() {
  const { showToast } = useToast();
  const { syncLocalCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidPassword(form.password)) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    
    try {
      const response = await login(form);
      
      // Sync local cart with database after login
      await syncLocalCart();
      
      showToast("Welcome back!");
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(location.state?.from || "/");
      }
    } catch (error) {
      setErrors({ general: error.message || "Login failed. Please try again." });
      showToast(error.message || "Login failed!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="page-enter auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="eyebrow">Welcome Back</span>
            <h1>Login to Your Account</h1>
            <p>Access your orders, wishlist and saved addresses.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                {errors.general}
              </div>
            )}
            
            <div className="field">
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange("email")} 
                className={errors.email ? "invalid" : ""} 
                placeholder="Enter your email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            
            <div className="field">
              <label htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange("password")} 
                className={errors.password ? "invalid" : ""} 
                placeholder="Enter your password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
              <FaSignInAlt /> {loading ? "Signing In…" : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button className="btn btn-google btn-block" onClick={handleGoogleLogin}>
            <FaGoogle /> Continue with Google
          </button>

          <p className="auth-switch">
            New to Priya Textiles? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
