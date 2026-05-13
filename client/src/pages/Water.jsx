import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  addWater, 
  deleteWater, 
  updateWater, 
  fetchWater, 
  selectWater, 
  fetchWaterStats, 
  selectWaterStats,
  fetchTodayWater,
  selectTodayWater
} from '../store/waterSlice';

function getRelativeDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Water() {
  const dispatch = useDispatch();
  const items = useSelector(selectWater);
  const todayItems = useSelector(selectTodayWater);
  const stats = useSelector(selectWaterStats);
  const status = useSelector((state) => state.water.status);

  // Filters
  const [filters, setFilters] = useState({
    startDate: getRelativeDate(-7),
    endDate: getRelativeDate(0),
  });

  // Add Form
  const [amount, setAmount] = useState(250);
  const [date, setDate] = useState(getRelativeDate(0));

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState(250);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadData();
    dispatch(fetchTodayWater());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchWater({ ...filters, limit: 100 }));
    dispatch(fetchWaterStats({ days: 30 }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      amount: Number(amount),
      date: new Date(date).toISOString(),
    };
    const action = await dispatch(addWater(payload));
    if (addWater.fulfilled.match(action)) {
      toast.success('Water logged');
      setAmount(250);
      loadData();
      dispatch(fetchTodayWater());
    } else {
      toast.error(action.payload || 'Failed to add');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const action = await dispatch(updateWater({ id: editingId, payload: { amount: Number(editAmount) } }));
    if (updateWater.fulfilled.match(action)) {
      toast.success('Updated');
      setEditingId(null);
      loadData();
      dispatch(fetchTodayWater());
    } else {
      toast.error(action.payload || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    const action = await dispatch(deleteWater(id));
    if (deleteWater.fulfilled.match(action)) {
      toast.success('Deleted');
      setDeletingId(null);
      loadData();
      dispatch(fetchTodayWater());
    } else {
      toast.error(action.payload || 'Delete failed');
    }
  };

  const startEdit = (w) => {
    setEditingId(w._id);
    setEditAmount(w.amount);
  };

  const totalToday = todayItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const goal = 2000; // Default goal
  const percentage = Math.min(Math.round((totalToday / goal) * 100), 100);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black text-blue-600">WATER INTAKE</h1>
        
        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <input 
            type="date" 
            value={filters.startDate} 
            onChange={(e) => setFilters(f => ({...f, startDate: e.target.value}))}
            className="text-sm border-none focus:ring-0 p-1"
          />
          <span className="text-gray-400">to</span>
          <input 
            type="date" 
            value={filters.endDate} 
            onChange={(e) => setFilters(f => ({...f, endDate: e.target.value}))}
            className="text-sm border-none focus:ring-0 p-1"
          />
          <button 
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Today Progress */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Progress</p>
            <p className="text-3xl font-black text-blue-600">{totalToday} <span className="text-sm text-gray-400">/ {goal} ml</span></p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{percentage}%</span>
          </div>
        </div>
        <div className="w-full bg-blue-50 rounded-full h-4 overflow-hidden border border-blue-100">
          <div 
            className="bg-blue-500 h-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Add */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-50 sticky top-24 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
              <img src="/water.png" alt="Water" className="w-14 h-14 object-contain" />
            </div>
            <h2 className="text-xl font-bold mb-4">Log Water</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[250, 500, 750, 1000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-xl border-2 font-bold transition-all ${amount === amt ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-blue-200'}`}
                >
                  {amt}ml
                </button>
              ))}
            </div>
            <div className="mb-4">
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
            <button 
              onClick={handleAdd}
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              Drink Up!
            </button>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">Drink History</h2>
          
          {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500">No water logged for this range.</p>
            </div>
          ) : (
            items.map((w) => (
              <div key={w._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {editingId === w._id ? (
                  <form onSubmit={handleUpdate} className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={editAmount} 
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="flex-1 bg-gray-50 border-none rounded-lg p-2 text-sm"
                    />
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs font-bold text-gray-400 px-2">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Save</button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/water.png" alt="Water" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{w.amount} ml</p>
                        <p className="text-xs text-gray-400">
                          {new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {deletingId === w._id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg">
                          <button onClick={() => handleDelete(w._id)} className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">Delete</button>
                          <button onClick={() => setDeletingId(null)} className="text-[10px] font-bold text-gray-400 px-1">No</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => startEdit(w)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                          <button onClick={() => setDeletingId(w._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
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
