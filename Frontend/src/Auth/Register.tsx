import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Gem, LockKeyhole, Mail, Phone, ShieldCheck, Truck, UserRound } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import api from "../api";
import "./Login.css";
import "./Register.css";

export function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      // Call backend API to register user using axios client
      const userId = uuidv4();
      await api.post('/auth/register', {
        user_id: userId,
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.password,
        status: 'active',
      });

      toast.success('Registration successful! Welcome.');
      navigate('/');
    } catch (error: any) {
      console.error('Registration Error:', error);
      const message = error?.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="login-page register-page">
      <section className="login-showcase" aria-label="Kanak Gold jewellery">
        <Link to="/" className="login-brand">
          <span className="login-brand-mark">K</span>
          <span><strong>Kanak Gold</strong><small>PURE GOLD, PURE TRUST</small></span>
        </Link>
        <div className="showcase-copy">
          <p className="eyebrow"><span /> YOUR GOLDEN JOURNEY</p>
          <h1>Begin Your<br /><em>Golden</em><br />Journey.</h1>
          <p className="showcase-description">Create your Kanak Gold account and discover thoughtfully crafted jewellery made for the moments you will remember.</p>
          <div className="showcase-benefits">
            <div><span className="benefit-icon"><Gem /></span><p><strong>Curated Collections</strong><small>Jewellery made for your style</small></p></div>
            <div><span className="benefit-icon"><ShieldCheck /></span><p><strong>Trusted Craftsmanship</strong><small>BIS Hallmarked Gold</small></p></div>
            <div><span className="benefit-icon"><Truck /></span><p><strong>Gifts, Delivered</strong><small>Beautiful moments at your door</small></p></div>
          </div>
          <p className="showcase-tagline">Your Story<br /><span>Starts in Gold</span></p>
        </div>
        <div className="jewellery-image" aria-hidden="true" />
      </section>

      <section className="login-panel register-panel">
        <Link to="/" className="back-home"><ArrowLeft size={18} /> Back to Home</Link>
        <div className="login-card register-card">
          <div className="login-heading"><h2>Create Account</h2><p>Join the Kanak Gold family today</p></div>
          <form onSubmit={handleSubmit} className="login-form register-form">
            <div className="field-group"><span className="field-label">Full name</span><label className="input-shell"><UserRound size={20} /><input name="username" placeholder="Enter your full name" value={form.username} onChange={handleChange} required /></label></div>
            <div className="field-group"><span className="field-label">Email address</span><label className="input-shell"><Mail size={20} /><input name="email" type="email" placeholder="Enter your email address" value={form.email} onChange={handleChange} required /></label></div>
            <div className="field-group"><span className="field-label">Phone number</span><label className="input-shell"><Phone size={20} /><input name="phone" type="tel" placeholder="Enter your phone number" value={form.phone} onChange={handleChange} required /></label></div>
            <div className="register-passwords">
              <div className="field-group"><span className="field-label">Password</span><label className="input-shell"><LockKeyhole size={20} /><input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} required /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></label></div>
              <div className="field-group"><span className="field-label">Confirm password</span><label className="input-shell"><LockKeyhole size={20} /><input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} required /><button type="button" className="password-toggle" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></label></div>
            </div>
            <button type="submit" className="login-submit">Create Account <ArrowRight size={23} /></button>
            <p className="signup-prompt">Already have an account? <Link to="/login">Sign In</Link></p>
          </form>
        </div>
      </section>
    </div>
  );
}
