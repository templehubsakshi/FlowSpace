import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signup, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { UserPlus, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  // ✅ Clear localStorage on mount (prevents old session issues)
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentWorkspaceId');
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(signup({ name, email, password }));

    if (result.type === 'auth/signup/fulfilled') {
      toast.success('Account created successfully! 🎉');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0b1020] overflow-hidden px-4">

      {/* Neon Background Glows */}
      <div className="absolute -left-32 top-1/2 w-[450px] h-[450px] bg-purple-600/30 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute -right-32 top-1/2 w-[450px] h-[450px] bg-indigo-500/30 blur-3xl rounded-full animate-pulse"></div>

      {/* Card */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(128,0,255,0.5)] rounded-2xl p-8 sm:p-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-5 sm:p-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(128,0,255,0.7)]">
              <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            Join FlowSpace
          </h1>

          <p className="text-gray-300 text-sm sm:text-base">
            Create your account and start managing your workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">Minimum 6 characters</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold tracking-wide text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition duration-300 shadow-[0_0_20px_rgba(128,0,255,0.7)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-sm text-center text-gray-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 underline decoration-2 underline-offset-4 transition">
            Sign in
          </Link>
        </p>

      </div>

      <p className="absolute bottom-4 text-center text-gray-500 text-xs">
        © 2026 FlowSpace. All rights reserved.
      </p>
    </div>
  );
}