import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, selectAuthError, selectIsAuthed, selectAuthStatus } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthed = useSelector(selectIsAuthed);
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (isAuthed) navigate('/dashboard', { replace: true });
  }, [isAuthed, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      email: fd.get('email'),
      password: fd.get('password'),
    };
    const action = await dispatch(login(payload));
    if (login.fulfilled.match(action)) {
      toast.success('Welcome back to Aura!');
    } else {
      toast.error(action.payload || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-50">
        {/* Left Side: Hero Image */}
        <div className="hidden md:block relative bg-indigo-600 overflow-hidden">
          <img 
            src="/hero.png" 
            alt="Aura Health" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-black mb-4">Transform Your Life with Aura.</h2>
            <p className="text-indigo-100 font-medium">Track your wellness journey with AI-powered insights and a supportive community.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight text-indigo-600">SIGN IN</h1>
            <p className="text-gray-500 mt-2 font-medium">Welcome back to your health sanctuary.</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="name@example.com"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {status === 'loading' ? 'Authenticating...' : 'Enter App'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
