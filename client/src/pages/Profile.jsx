import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, selectAuthUser, selectAuthStatus } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectAuthStatus);

  const [formData, setFormData] = useState({
    name: '',
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    goals: {
      dailyCalories: 2000,
      dailyWater: 2000,
      dailySleep: 8,
      weeklyWorkouts: 3,
      targetWeight: 70,
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        height: user.height || '',
        weight: user.weight || '',
        age: user.age || '',
        gender: user.gender || 'male',
        activityLevel: user.activityLevel || 'moderate',
        goals: {
          dailyCalories: user.goals?.dailyCalories || 2000,
          dailyWater: user.goals?.dailyWater || 2000,
          dailySleep: user.goals?.dailySleep || 8,
          weeklyWorkouts: user.goals?.weeklyWorkouts || 3,
          targetWeight: user.goals?.targetWeight || 70,
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('goals.')) {
      const goalKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        goals: { ...prev.goals, [goalKey]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      return { bmi, category };
    }
    return null;
  };

  const bmiData = calculateBMI();

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      {/* Profile Header */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img src="/hero.png" alt="Profile" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-transparent flex items-center p-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full border-4 border-white/30 flex items-center justify-center overflow-hidden">
               <span className="text-4xl">👤</span>
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-black">{formData.name || 'Your Profile'}</h1>
              <p className="text-indigo-100 font-medium">Manage your health metrics and personal goals.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 relative overflow-hidden">
             {/* Decorative Background Icon */}
            <img src="/fitness.png" alt="" className="absolute -top-10 -right-10 w-40 opacity-5" />
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 rounded-xl">📋</span>
              Personal Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="sedentary">Sedentary (Office job)</option>
                  <option value="light">Lightly Active (Light exercise)</option>
                  <option value="moderate">Moderately Active (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (Athlete level)</option>
                </select>
              </div>

              {bmiData && (
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Body Mass Index (BMI)</p>
                    <p className="text-4xl font-black text-indigo-600">{bmiData.bmi}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl font-bold text-sm ${
                    bmiData.category === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {bmiData.category}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Goals */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 relative overflow-hidden">
            <img src="/nutrition.png" alt="" className="absolute -top-10 -right-10 w-40 opacity-5" />
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 bg-orange-50 rounded-xl">🎯</span>
              Daily Goals
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Calorie Goal (kcal)</label>
                <input
                  type="number"
                  name="goals.dailyCalories"
                  value={formData.goals.dailyCalories}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Water Goal (ml)</label>
                <input
                  type="number"
                  name="goals.dailyWater"
                  value={formData.goals.dailyWater}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Sleep Goal (hours)</label>
                <input
                  type="number"
                  name="goals.dailySleep"
                  value={formData.goals.dailySleep}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Weekly Workouts</label>
                  <input
                    type="number"
                    name="goals.weeklyWorkouts"
                    value={formData.goals.weeklyWorkouts}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Target Weight</label>
                  <input
                    type="number"
                    name="goals.targetWeight"
                    value={formData.goals.targetWeight}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="w-full mt-8 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {status === 'loading' ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>

          <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Health Milestone</h3>
                <p className="text-indigo-200 text-sm mb-6">You're in the top 15% of active users this week!</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
                   <div>
                      <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Next Badge</p>
                      <p className="font-bold">Consistency King</p>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
