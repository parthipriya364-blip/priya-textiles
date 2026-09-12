import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus, FaGoogle } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { signup } from "../services/authService";
import { getGoogleAuthUrl } from "../config";
import { isNotEmpty, isValidEmail, isValidPassword, isValidPhone } from "../utils/validators";
import "./style/Auth.css";

export default function Register() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isNotEmpty(form.name)) next.name = "Full name is required.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidPhone(form.phone)) next.phone = "Enter a valid 10-digit phone number.";
    if (!isValidPassword(form.password)) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    
    try {
      await signup(form);
      showToast("Account created — welcome to Priya Textiles!");
      navigate("/", { replace: true });
    } catch (error) {
      setErrors({ general: error.message || "Registration failed. Please try again." });
      showToast(error.message || "Registration failed!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className="page-enter auth-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="eyebrow">Join Us</span>
            <h1>Create an Account</h1>
            <p>Faster checkout, order tracking and an always-open wishlist.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                {errors.general}
              </div>
            )}
            
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input 
                id="name" 
                value={form.name} 
                onChange={handleChange("name")} 
                className={errors.name ? "invalid" : ""} 
                placeholder="Enter your full name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            
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
              <label htmlFor="phone">Phone Number</label>
              <input 
                id="phone" 
                value={form.phone} 
                onChange={handleChange("phone")} 
                className={errors.phone ? "invalid" : ""} 
                placeholder="10-digit phone number"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
            
            <div className="field">
              <label htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange("password")} 
                className={errors.password ? "invalid" : ""} 
                placeholder="At least 6 characters"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block auth-submit" disabled={loading}>
              <FaUserPlus /> {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button className="btn btn-google btn-block" onClick={handleGoogleSignup}>
            <FaGoogle /> Sign up with Google
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
