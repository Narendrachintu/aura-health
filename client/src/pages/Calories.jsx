import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  addCalorie, 
  deleteCalorie, 
  updateCalorie, 
  fetchCalories, 
  selectCalories, 
  fetchCalorieStats, 
  selectCalorieStats 
} from '../store/calorieSlice';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

function getRelativeDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Calories() {
  const dispatch = useDispatch();
  const items = useSelector(selectCalories);
  const stats = useSelector(selectCalorieStats);
  const status = useSelector((state) => state.calories.status);

  // Filters
  const [filters, setFilters] = useState({
    startDate: getRelativeDate(-7),
    endDate: getRelativeDate(0),
  });

  // Add Form
  const [form, setForm] = useState({
    date: getRelativeDate(0),
    mealType: 'lunch',
    foodName: '',
    calories: 500,
    protein: 20,
    carbs: 50,
    fat: 15,
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
    dispatch(fetchCalories({ ...filters, limit: 100 }));
    dispatch(fetchCalorieStats({ days: 30 }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    };
    const action = await dispatch(addCalorie(payload));
    if (addCalorie.fulfilled.match(action)) {
      toast.success('Entry added');
      setForm({
        date: getRelativeDate(0),
        mealType: 'lunch',
        foodName: '',
        calories: 500,
        protein: 20,
        carbs: 50,
        fat: 15,
      });
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
      calories: Number(editForm.calories),
      protein: Number(editForm.protein),
      carbs: Number(editForm.carbs),
      fat: Number(editForm.fat),
    };
    const action = await dispatch(updateCalorie({ id: editingId, payload }));
    if (updateCalorie.fulfilled.match(action)) {
      toast.success('Entry updated');
      setEditingId(null);
      setEditForm(null);
    } else {
      toast.error(action.payload || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const action = await dispatch(deleteCalorie(id));
    if (deleteCalorie.fulfilled.match(action)) {
      toast.success('Deleted');
      setDeletingId(null);
      loadData();
    } else {
      toast.error(action.payload || 'Delete failed');
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditForm({
      date: new Date(c.date).toISOString().slice(0, 10),
      mealType: c.mealType,
      foodName: c.foodName || '',
      calories: c.calories,
      protein: c.protein,
      carbs: c.carbs,
      fat: c.fat,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      {/* Premium Header */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img src="/hero.png" alt="Nutrition" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-125 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-orange-900/40 to-transparent flex items-center p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-6">
            <div className="text-white">
              <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Nutrition</h1>
              <p className="text-orange-100 font-medium">Fuel your body with precision and balance.</p>
            </div>
            
            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <input 
                type="date" 
                value={filters.startDate} 
                onChange={(e) => setFilters(f => ({...f, startDate: e.target.value}))}
                className="text-xs text-white border-none focus:ring-0 p-1 bg-transparent"
              />
              <span className="text-orange-300 text-xs">to</span>
              <input 
                type="date" 
                value={filters.endDate} 
                onChange={(e) => setFilters(f => ({...f, endDate: e.target.value}))}
                className="text-xs text-white border-none focus:ring-0 p-1 bg-transparent"
              />
              <button 
                onClick={loadData}
                className="bg-white text-orange-600 px-4 py-1.5 rounded-xl text-xs font-black hover:bg-orange-50 transition-colors uppercase tracking-widest"
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
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Cals</p>
            <p className="text-3xl font-black text-orange-600 leading-none">{stats.totalCalories || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Avg/Day</p>
            <p className="text-3xl font-black text-green-500 leading-none">{stats.avgCalories?.toFixed(0) || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Protein Avg</p>
            <p className="text-3xl font-black text-blue-500 leading-none">{stats.avgProtein?.toFixed(0) || 0}g</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Max Meal</p>
            <p className="text-3xl font-black text-purple-600 leading-none">{stats.maxCalories || 0}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Log Meal</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Food Item</label>
                <input 
                  type="text" 
                  value={form.foodName} 
                  onChange={(e) => setForm(f => ({...f, foodName: e.target.value}))}
                  placeholder="e.g. Chicken Salad"
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm(f => ({...f, date: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Meal</label>
                  <select 
                    value={form.mealType} 
                    onChange={(e) => setForm(f => ({...f, mealType: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-orange-500 capitalize"
                  >
                    {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Calories (kcal)</label>
                <input 
                  type="number" 
                  value={form.calories} 
                  onChange={(e) => setForm(f => ({...f, calories: e.target.value}))}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Protein</label>
                  <input 
                    type="number" 
                    value={form.protein} 
                    onChange={(e) => setForm(f => ({...f, protein: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Carbs</label>
                  <input 
                    type="number" 
                    value={form.carbs} 
                    onChange={(e) => setForm(f => ({...f, carbs: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fat</label>
                  <input 
                    type="number" 
                    value={form.fat} 
                    onChange={(e) => setForm(f => ({...f, fat: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? 'Saving...' : 'Add Meal'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Meal History
            <span className="text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <span className="text-4xl mb-2 block">🥗</span>
              <p className="text-gray-500">No meals logged for this range.</p>
            </div>
          ) : (
            items.map((c) => (
              <div key={c._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {editingId === c._id ? (
                  /* Edit Form Inline */
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <input 
                        type="text" 
                        value={editForm.foodName} 
                        onChange={(e) => setEditForm(f => ({...f, foodName: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm"
                      />
                      <select 
                        value={editForm.mealType} 
                        onChange={(e) => setEditForm(f => ({...f, mealType: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm capitalize"
                      >
                        {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input 
                        type="number" 
                        value={editForm.calories} 
                        onChange={(e) => setEditForm(f => ({...f, calories: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm"
                      />
                      <div className="flex gap-1">
                        <input type="number" value={editForm.protein} onChange={(e) => setEditForm(f => ({...f, protein: e.target.value}))} className="w-1/3 bg-gray-50 border-none rounded-lg p-1 text-xs" />
                        <input type="number" value={editForm.carbs} onChange={(e) => setEditForm(f => ({...f, carbs: e.target.value}))} className="w-1/3 bg-gray-50 border-none rounded-lg p-1 text-xs" />
                        <input type="number" value={editForm.fat} onChange={(e) => setEditForm(f => ({...f, fat: e.target.value}))} className="w-1/3 bg-gray-50 border-none rounded-lg p-1 text-xs" />
                      </div>
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
                      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center overflow-hidden">
                        <img src="/nutrition.png" alt="Nutrition" className="w-12 h-12 object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {c.foodName || 'Unnamed Meal'}
                          <span className="ml-2 text-[10px] font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded-full uppercase">
                            {c.mealType}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {c.calories} kcal
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-blue-600 font-bold">P: {c.protein}g</span>
                          <span className="text-[10px] text-green-600 font-bold">C: {c.carbs}g</span>
                          <span className="text-[10px] text-yellow-600 font-bold">F: {c.fat}g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {deletingId === c._id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg animate-pulse">
                          <span className="text-[10px] font-bold text-red-600 px-1 uppercase">Sure?</span>
                          <button onClick={() => handleDelete(c._id)} className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">Yes</button>
                          <button onClick={() => setDeletingId(null)} className="text-[10px] font-bold text-gray-400 px-1">No</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => startEdit(c)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg">✏️</button>
                          <button onClick={() => setDeletingId(c._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
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
