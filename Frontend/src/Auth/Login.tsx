import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import api from "../api";

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
    <div className="flex items-center justify-center min-h-screen bg-[#f5f6f8] px-4 font-sans">
      <div className="w-[380px] bg-white border border-gray-200 shadow-xl rounded-2xl px-6 py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1b88f3]/10 rounded-full mx-auto flex items-center justify-center mb-4">
             <span className="text-[#1b88f3] font-bold text-2xl">KG</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Sign in to Kanak Gold management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 pr-10 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-[#1b88f3]/20 focus:border-[#1b88f3] outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-bold bg-[#1b88f3] hover:bg-[#1569c7] transition-all duration-300 shadow-md cursor-pointer"
          >
            Sign In
          </button>

          

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-[#1b88f3] font-bold hover:underline"
            >
              Contact Admin
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
