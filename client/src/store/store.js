import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import workoutsReducer from './workoutSlice';
import caloriesReducer from './calorieSlice';
import sleepReducer from './sleepSlice';
import waterReducer from './waterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    workouts: workoutsReducer,
    calories: caloriesReducer,
    sleep: sleepReducer,
    water: waterReducer,
  },
});

