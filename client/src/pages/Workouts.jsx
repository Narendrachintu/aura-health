import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  addWorkout, 
  deleteWorkout, 
  updateWorkout, 
  fetchWorkouts, 
  selectWorkouts, 
  fetchWorkoutStats, 
  selectWorkoutStats 
} from '../store/workoutSlice';

const WORKOUT_TYPES = [
  'running', 'walking', 'cycling', 'swimming', 'weightlifting', 
  'strength', 'yoga', 'hiit', 'cardio', 'stretching', 'sports', 'other'
];

function getRelativeDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Workouts() {
  const dispatch = useDispatch();
  const items = useSelector(selectWorkouts);
  const stats = useSelector(selectWorkoutStats);
  const status = useSelector((state) => state.workouts.status);

  // Filters
  const [filters, setFilters] = useState({
    startDate: getRelativeDate(-7),
    endDate: getRelativeDate(0),
  });

  // Add Form
  const [form, setForm] = useState({
    date: getRelativeDate(0),
    type: 'cardio',
    duration: 30,
    caloriesBurned: 250,
    name: '',
  });

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchWorkouts({ ...filters, limit: 100 }));
    dispatch(fetchWorkoutStats({ days: 30 }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      duration: Number(form.duration),
      caloriesBurned: Number(form.caloriesBurned),
    };
    const action = await dispatch(addWorkout(payload));
    if (addWorkout.fulfilled.match(action)) {
      toast.success('Workout added');
      setForm({ date: getRelativeDate(0), type: 'cardio', duration: 30, caloriesBurned: 250, name: '' });
      loadData();
    } else {
      toast.error(action.payload || 'Failed to add');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      ...editForm,
      date: new Date(editForm.date).toISOString(),
      duration: Number(editForm.duration),
      caloriesBurned: Number(editForm.caloriesBurned),
    };
    const action = await dispatch(updateWorkout({ id: editingId, payload }));
    if (updateWorkout.fulfilled.match(action)) {
      toast.success('Workout updated');
      setEditingId(null);
      setEditForm(null);
    } else {
      toast.error(action.payload || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const action = await dispatch(deleteWorkout(id));
    if (deleteWorkout.fulfilled.match(action)) {
      toast.success('Deleted');
      setDeletingId(null);
      loadData();
    } else {
      toast.error(action.payload || 'Delete failed');
    }
  };

  const startEdit = (w) => {
    setEditingId(w._id);
    setEditForm({
      date: new Date(w.date).toISOString().slice(0, 10),
      type: w.type,
      duration: w.duration,
      caloriesBurned: w.caloriesBurned,
      name: w.name || '',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      {/* Premium Header */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img src="/hero.png" alt="Workouts" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-125 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/40 to-transparent flex items-center p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-6">
            <div className="text-white">
              <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Workouts</h1>
              <p className="text-indigo-100 font-medium">Push your limits and track every movement.</p>
            </div>
            
            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <input 
                type="date" 
                value={filters.startDate} 
                onChange={(e) => setFilters(f => ({...f, startDate: e.target.value}))}
                className="text-xs text-white border-none focus:ring-0 p-1 bg-transparent"
              />
              <span className="text-indigo-300 text-xs">to</span>
              <input 
                type="date" 
                value={filters.endDate} 
                onChange={(e) => setFilters(f => ({...f, endDate: e.target.value}))}
                className="text-xs text-white border-none focus:ring-0 p-1 bg-transparent"
              />
              <button 
                onClick={loadData}
                className="bg-white text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors uppercase tracking-widest"
              >
                Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total sessions</p>
            <p className="text-3xl font-black text-indigo-600 leading-none">{stats.totalWorkouts || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total minutes</p>
            <p className="text-3xl font-black text-green-500 leading-none">{stats.totalDuration || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Cals burned</p>
            <p className="text-3xl font-black text-orange-500 leading-none">{stats.totalCaloriesBurned || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Daily Avg</p>
            <p className="text-3xl font-black text-purple-600 leading-none">{stats.avgDuration?.toFixed(0) || 0}m</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Add New Workout</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Workout Name (Optional)</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                  placeholder="e.g. Morning Run"
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm(f => ({...f, date: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                  <select 
                    value={form.type} 
                    onChange={(e) => setForm(f => ({...f, type: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 capitalize"
                  >
                    {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Duration (min)</label>
                  <input 
                    type="number" 
                    value={form.duration} 
                    onChange={(e) => setForm(f => ({...f, duration: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Calories</label>
                  <input 
                    type="number" 
                    value={form.caloriesBurned} 
                    onChange={(e) => setForm(f => ({...f, caloriesBurned: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? 'Saving...' : 'Add Workout'}
              </button>
            </form>
          </div>
        </div>

        {/* Workout List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Recent Entries
            <span className="text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <span className="text-4xl mb-2 block">🏃‍♂️</span>
              <p className="text-gray-500">No workouts found for this range.</p>
              <button onClick={() => setFilters({startDate: getRelativeDate(-30), endDate: getRelativeDate(0)})} className="text-indigo-600 font-bold mt-2 hover:underline">
                View last 30 days
              </button>
            </div>
          ) : (
            items.map((w) => (
              <div key={w._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {editingId === w._id ? (
                  /* Edit Form Inline */
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm(f => ({...f, name: e.target.value}))}
                        placeholder="Name"
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm"
                      />
                      <select 
                        value={editForm.type} 
                        onChange={(e) => setEditForm(f => ({...f, type: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm capitalize"
                      >
                        {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input 
                        type="number" 
                        value={editForm.duration} 
                        onChange={(e) => setEditForm(f => ({...f, duration: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm"
                      />
                      <input 
                        type="number" 
                        value={editForm.caloriesBurned} 
                        onChange={(e) => setEditForm(f => ({...f, caloriesBurned: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingId(null)} className="text-sm font-bold text-gray-400 px-3 py-1">Cancel</button>
                      <button type="submit" className="bg-green-600 text-white text-sm font-bold px-4 py-1 rounded-lg">Save</button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src="/fitness.png" alt="Fitness" className="w-12 h-12 object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 capitalize">
                          {w.name || w.type}
                          <span className="ml-2 text-xs font-normal text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                            {w.type}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {w.duration} min • {w.caloriesBurned} kcal
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {deletingId === w._id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg animate-pulse">
                          <span className="text-[10px] font-bold text-red-600 px-1 uppercase">Sure?</span>
                          <button onClick={() => handleDelete(w._id)} className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">Yes</button>
                          <button onClick={() => setDeletingId(null)} className="text-[10px] font-bold text-gray-400 px-1">No</button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => startEdit(w)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => setDeletingId(w._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
