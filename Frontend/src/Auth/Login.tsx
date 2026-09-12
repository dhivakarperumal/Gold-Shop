import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Gem, LockKeyhole, Mail, ShieldCheck, Truck } from "lucide-react";
import api from "../api";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();
  const { user, setUserFromStorage } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      toast.success('Welcome back!');
      // store token and user via context helper
      setUserFromStorage(data.user, data.token);
      if (data.user?.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (error: any) {
      console.error('Login Error:', error);
      const message = error?.response?.data?.message || error.message || 'Login failed. Check your credentials.';
      toast.error(message);
    }
  };


  return (
    <div className="login-page">
      <section className="login-showcase" aria-label="Kanak Gold jewellery">
        <Link to="/" className="login-brand">
          <span className="login-brand-mark">K</span>
          <span>
            <strong>Kanak Gold</strong>
            <small>PURE GOLD, PURE TRUST</small>
          </span>
        </Link>

        <div className="showcase-copy">
          <p className="eyebrow"><span /> PREMIUM GOLD JEWELLERY</p>
          <h1>Timeless <em>Gold</em><br />for Every<br />Occasion.</h1>
          <p className="showcase-description">Discover exquisite BIS hallmarked jewellery crafted with precision. From daily wear elegance to bridal grandeur.</p>
          <div className="showcase-benefits">
            <div><span className="benefit-icon"><Gem /></span><p><strong>100% Authentic</strong><small>BIS Hallmarked Gold</small></p></div>
            <div><span className="benefit-icon"><ShieldCheck /></span><p><strong>Secure Shopping</strong><small>Your Safety, Our Priority</small></p></div>
            <div><span className="benefit-icon"><Truck /></span><p><strong>Free Shipping</strong><small>On all orders above ₹10,000</small></p></div>
          </div>
          <p className="showcase-tagline">Gold Makes<br /><span>Moments Special</span></p>
        </div>
        <div className="jewellery-image" aria-hidden="true" />
      </section>

      <section className="login-panel">
       
        <div className="login-card">
          <div className="login-heading">
            <h2>Welcome Back!</h2>
            <p>Login to continue to Kanak Gold</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field-group">
              <span className="field-label">Email address</span>
              <label className="input-shell">
                <Mail size={20} />
                <input name="email" type="email" placeholder="Enter your email address" value={form.email} onChange={handleChange} required />
              </label>
            </div>

            <div className="field-group">
              <span className="field-label">Password</span>
              <label className="input-shell">
                <LockKeyhole size={20} />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                <button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>
            </div>

            <div className="login-options">
              <label className="remember-me"><input type="checkbox" /> <span>Remember me</span></label>
              <button type="button" className="forgot-password">Forgot password?</button>
            </div>

            <button type="submit" className="login-submit">Login <ArrowRight size={23} /></button>

            <div className="or-divider"><span /> OR <span /></div>
            <button type="button" className="social-button"><b className="google-icon">G</b> Continue with Google</button>
            

            <p className="signup-prompt">Don't have an account? <Link to="/register">Sign Up</Link></p>
          </form>
        </div>
      </section>
    </div>
  );
}
