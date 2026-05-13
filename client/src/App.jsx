import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Calories from './pages/Calories';
import Sleep from './pages/Sleep';
import Water from './pages/Water';
import Profile from './pages/Profile';

import { authSliceActions, selectIsAuthed } from './store/authSlice';
import { dashboardSliceActions, selectAuthLoading } from './store/dashboardSlice';

function ProtectedRoute({ children }) {
  const isAuthed = useSelector(selectIsAuthed);
  const location = useLocation();
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const isAuthed = useSelector(selectIsAuthed);
  const authLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        dispatch(dashboardSliceActions.hydrateRequest());
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      alive = false;
      void alive;
    };
  }, [dispatch]);

  const onLogout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    dispatch(authSliceActions.logout());
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-indigo-600">AURA</span>
            <span className="text-2xl font-light tracking-tight text-gray-400">HEALTH</span>
          </div>
          
          {isAuthed ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</a>
              <a href="/workouts" className="hover:text-indigo-600 transition-colors">Workouts</a>
              <a href="/calories" className="hover:text-indigo-600 transition-colors">Calories</a>
              <a href="/sleep" className="hover:text-indigo-600 transition-colors">Sleep</a>
              <a href="/water" className="hover:text-indigo-600 transition-colors">Water</a>
              <a href="/profile" className="hover:text-indigo-600 transition-colors">Profile</a>
              <button 
                onClick={onLogout} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all font-bold"
              >
                Logout
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-4 text-sm font-medium">
              <a href="/login" className="text-gray-600 hover:text-indigo-600">Login</a>
              <a href="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md">Get Started</a>
            </nav>
          )}

          {/* Mobile Menu Toggle (simplified for now) */}
          {isAuthed && (
            <div className="md:hidden flex gap-2 overflow-x-auto py-2">
              <a href="/dashboard" className="text-xs font-bold px-2">Dash</a>
              <a href="/profile" className="text-xs font-bold px-2">Profile</a>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calories"
            element={
              <ProtectedRoute>
                <Calories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sleep"
            element={
              <ProtectedRoute>
                <Sleep />
              </ProtectedRoute>
            }
          />
          <Route
            path="/water"
            element={
              <ProtectedRoute>
                <Water />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to={isAuthed ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={isAuthed ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>

      {authLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

