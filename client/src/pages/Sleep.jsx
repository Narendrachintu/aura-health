import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  addSleep, 
  deleteSleep, 
  updateSleep, 
  fetchSleep, 
  selectSleep, 
  fetchSleepStats, 
  selectSleepStats 
} from '../store/sleepSlice';

const QUALITY_TYPES = ['poor', 'fair', 'good', 'excellent'];

function getRelativeDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Sleep() {
  const dispatch = useDispatch();
  const items = useSelector(selectSleep);
  const stats = useSelector(selectSleepStats);
  const status = useSelector((state) => state.sleep.status);

  // Filters
  const [filters, setFilters] = useState({
    startDate: getRelativeDate(-7),
    endDate: getRelativeDate(0),
  });

  // Add Form
  const [form, setForm] = useState({
    date: getRelativeDate(0),
    duration: 8,
    quality: 'good',
    notes: '',
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
    dispatch(fetchSleep({ ...filters, limit: 100 }));
    dispatch(fetchSleepStats({ days: 30 }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      duration: Number(form.duration),
    };
    const action = await dispatch(addSleep(payload));
    if (addSleep.fulfilled.match(action)) {
      toast.success('Sleep entry added');
      setForm({ date: getRelativeDate(0), duration: 8, quality: 'good', notes: '' });
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
    };
    const action = await dispatch(updateSleep({ id: editingId, payload }));
    if (updateSleep.fulfilled.match(action)) {
      toast.success('Sleep entry updated');
      setEditingId(null);
      setEditForm(null);
    } else {
      toast.error(action.payload || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const action = await dispatch(deleteSleep(id));
    if (deleteSleep.fulfilled.match(action)) {
      toast.success('Deleted');
      setDeletingId(null);
      loadData();
    } else {
      toast.error(action.payload || 'Delete failed');
    }
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({
      date: new Date(s.date).toISOString().slice(0, 10),
      duration: s.duration,
      quality: s.quality,
      notes: s.notes || '',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      {/* Premium Header */}
      <div className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <img src="/hero.png" alt="Sleep" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-125 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/40 to-transparent flex items-center p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-6">
            <div className="text-white">
              <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Sleep</h1>
              <p className="text-indigo-100 font-medium">Recharge your mind and body with quality rest.</p>
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
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Nights</p>
            <p className="text-3xl font-black text-indigo-600 leading-none">{stats.totalNights || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Duration</p>
            <p className="text-3xl font-black text-green-500 leading-none">{stats.avgDuration?.toFixed(1) || 0}h</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Best Sleep</p>
            <p className="text-3xl font-black text-blue-500 leading-none">{stats.maxDuration || 0}h</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-xl group hover:scale-[1.02] transition-all">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Sleep Quality</p>
            <p className="text-3xl font-black text-purple-600 leading-none">Good</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Log Sleep</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date of Sleep</label>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm(f => ({...f, date: e.target.value}))}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Duration (hrs)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={form.duration} 
                    onChange={(e) => setForm(f => ({...f, duration: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quality</label>
                  <select 
                    value={form.quality} 
                    onChange={(e) => setForm(f => ({...f, quality: e.target.value}))}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 capitalize"
                  >
                    {QUALITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Notes</label>
                <textarea 
                  value={form.notes} 
                  onChange={(e) => setForm(f => ({...f, notes: e.target.value}))}
                  placeholder="How did you feel?"
                  className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-indigo-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-900 transition-all active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? 'Saving...' : 'Add Sleep Entry'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Sleep History
            <span className="text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <span className="text-4xl mb-2 block">😴</span>
              <p className="text-gray-500">No sleep entries found for this range.</p>
            </div>
          ) : (
            items.map((s) => (
              <div key={s._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {editingId === s._id ? (
                  /* Edit Form Inline */
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <input 
                        type="number" step="0.5"
                        value={editForm.duration} 
                        onChange={(e) => setEditForm(f => ({...f, duration: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm"
                      />
                      <select 
                        value={editForm.quality} 
                        onChange={(e) => setEditForm(f => ({...f, quality: e.target.value}))}
                        className="bg-gray-50 border-none rounded-lg p-2 text-sm capitalize"
                      >
                        {QUALITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input 
                        type="text" 
                        value={editForm.notes} 
                        onChange={(e) => setEditForm(f => ({...f, notes: e.target.value}))}
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
                        <img src="/sleep.png" alt="Sleep" className="w-12 h-12 object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {s.duration} Hours
                          <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            s.quality === 'excellent' ? 'bg-green-100 text-green-700' : 
                            s.quality === 'good' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {s.quality}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        {s.notes && <p className="text-[10px] text-gray-400 mt-1 italic">"{s.notes}"</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {deletingId === s._id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg animate-pulse">
                          <span className="text-[10px] font-bold text-red-600 px-1 uppercase">Sure?</span>
                          <button onClick={() => handleDelete(s._id)} className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">Yes</button>
                          <button onClick={() => setDeletingId(null)} className="text-[10px] font-bold text-gray-400 px-1">No</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => startEdit(s)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">✏️</button>
                          <button onClick={() => setDeletingId(s._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
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
