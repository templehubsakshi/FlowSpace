import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isAuthenticated, error } = useSelector((state) => state.auth);

  // Show toast error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Navigate to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    const result = await dispatch(login({ email, password }));

    if (result.type === 'auth/login/fulfilled') {
      toast.success('Welcome back! 🎉');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0b1020] overflow-hidden px-4">

      {/* Background Glows */}
      <div className="absolute -left-32 top-1/2 w-[450px] h-[450px] bg-purple-600/20 blur-3xl rounded-full"></div>
      <div className="absolute -right-32 top-1/2 w-[450px] h-[450px] bg-indigo-600/20 blur-3xl rounded-full"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 sm:p-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-6 sm:p-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md">
              <LogIn className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-gray-300 text-sm sm:text-base">Sign in to continue to FlowSpace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              className="w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:ring-4 focus:ring-white/10 transition-all outline-none disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/50 focus:border-white/50 focus:ring-4 focus:ring-white/10 transition-all outline-none disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold tracking-wide text-white
                         bg-gradient-to-r from-indigo-500 to-purple-600
                         hover:from-indigo-600 hover:to-purple-700
                         transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Signup Link */}
        <p className="text-sm sm:text-base text-center text-gray-400 pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Create one now
          </Link>
        </p>

      </div>
    </div>
  );
}
