import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

import { getDashboard, selectDashboard, fetchSuggestions } from '../store/dashboardSlice';
import { fetchCalorieStats, selectCalorieStats } from '../store/calorieSlice';
import { fetchWorkoutStats, selectWorkoutStats } from '../store/workoutSlice';
import { selectAuthUser } from '../store/authSlice';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Tooltip, 
  Legend,
  Filler
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const { today, week, suggestions, status } = useSelector(selectDashboard);
  const calorieStats = useSelector(selectCalorieStats);
  const workoutStats = useSelector(selectWorkoutStats);
  const user = useSelector(selectAuthUser);

  useEffect(() => {
    dispatch(getDashboard());
    dispatch(fetchSuggestions());
    dispatch(fetchCalorieStats({ days: 7 }));
    dispatch(fetchWorkoutStats({ days: 7 }));
  }, [dispatch]);

  // Chart Data Preparation
  const calorieChartData = useMemo(() => {
    if (!calorieStats?.daily) return null;
    return {
      labels: calorieStats.daily.map(d => d._id.split('-').slice(1).join('/')),
      datasets: [{
        label: 'Calories',
        data: calorieStats.daily.map(d => d.totalCalories),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [calorieStats]);

  const workoutChartData = useMemo(() => {
    if (!workoutStats?.daily) return null;
    return {
      labels: workoutStats.daily.map(d => d._id.split('-').slice(1).join('/')),
      datasets: [{
        label: 'Minutes',
        data: workoutStats.daily.map(d => d.totalDuration),
        backgroundColor: '#6366f1',
        borderRadius: 8,
      }]
    };
  }, [workoutStats]);

  // Progress Calculations
  const goals = user?.goals || { dailyCalories: 2000, dailyWater: 2000, dailySleep: 8 };
  const waterProgress = Math.min(Math.round(((today?.waterMl || 0) / goals.dailyWater) * 100), 100);
  const calorieProgress = Math.min(Math.round(((today?.caloriesConsumed || 0) / goals.dailyCalories) * 100), 100);
  
  const getProgressColor = (pct) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (status === 'loading' && !today) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      {/* Welcome Banner Card */}
      <div className="bg-indigo-600 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="p-10 md:p-14 z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-indigo-100 text-lg font-medium max-w-md">Your health journey is looking great today. You've already completed 60% of your daily goals!</p>
            <div className="mt-8 flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <span className="font-bold">🔥 3 Day Streak</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <span className="font-bold">✨ Elite Level</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative h-full min-h-[300px]">
            <img 
              src="/banner.png" 
              alt="Wellness Journey" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-lighten opacity-90 scale-110"
            />
          </div>
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calories Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 relative overflow-hidden group hover:shadow-2xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Calories</p>
              <p className="text-3xl font-black text-orange-500">{today?.caloriesConsumed || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Goal: {goals.dailyCalories} kcal</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/nutrition.png" alt="Calories" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${getProgressColor(calorieProgress)}`} style={{ width: `${calorieProgress}%` }}></div>
          </div>
        </div>

        {/* Water Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 relative overflow-hidden group hover:shadow-2xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Water</p>
              <p className="text-3xl font-black text-blue-500">{today?.waterMl || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Goal: {goals.dailyWater} ml</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/water.png" alt="Water" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${getProgressColor(waterProgress)}`} style={{ width: `${waterProgress}%` }}></div>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 relative overflow-hidden group hover:shadow-2xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sleep</p>
              <p className="text-3xl font-black text-indigo-600">{today?.sleepHours || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Goal: {goals.dailySleep} hrs</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/sleep.png" alt="Sleep" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {(today?.sleepHours || 0) >= goals.dailySleep ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">✅ Goal Met</span>
            ) : (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">⚠️ Under Goal</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
              Weekly Calories
            </h3>
            <div className="h-64">
              {calorieChartData ? (
                <Line 
                  data={calorieChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                  }} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">No daily data available</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Weekly Workouts
            </h3>
            <div className="h-64">
              {workoutChartData ? (
                <Bar 
                  data={workoutChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                  }} 
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">No daily data available</div>
              )}
            </div>
          </div>
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                ✨ AI Health Tips
              </h3>
              <div className="space-y-4">
                {suggestions?.length > 0 ? (
                  suggestions.slice(0, 4).map((tip, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-lg">{tip.icon || '💡'}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          tip.priority === 'high' ? 'bg-red-500' : tip.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`}>
                          {tip.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-indigo-200 transition-colors">{tip.title}</h4>
                      <p className="text-xs text-white/70 leading-relaxed">{tip.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/50 italic py-4">Generating personalized tips...</div>
                )}
              </div>
              <button 
                onClick={() => dispatch(fetchSuggestions())}
                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all border border-white/10"
              >
                Refresh Tips
              </button>
            </div>
            {/* Background decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Your Macros Today</h3>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center text-xs font-bold text-green-600 mb-1">{today?.protein || 0}g</div>
                <span className="text-[10px] font-bold text-gray-400">PRO</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-600 mb-1">{today?.carbs || 0}g</div>
                <span className="text-[10px] font-bold text-gray-400">CARB</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-600 mb-1">{today?.fat || 0}g</div>
                <span className="text-[10px] font-bold text-gray-400">FAT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
