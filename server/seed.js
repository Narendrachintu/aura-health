require('dotenv').config({ path: './server/.env' });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const User = require('./models/User');
const Workout = require('./models/Workout');
const Calorie = require('./models/Calorie');
const Sleep = require('./models/Sleep');
const Water = require('./models/Water');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    const users = await User.find({});
    console.log(`Found ${users.length} users to seed.`);

    for (const user of users) {
      const userId = user._id;
      console.log(`Seeding data for: ${user.email}...`);

      // Clear existing data
      await Workout.deleteMany({ user: userId });
      await Calorie.deleteMany({ user: userId });
      await Sleep.deleteMany({ user: userId });
      await Water.deleteMany({ user: userId });

      const days = 10; // 10 days of data
      const now = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Seed Workout
        await Workout.create({
          user: userId,
          type: ['running', 'cycling', 'weightlifting', 'yoga', 'swimming'][Math.floor(Math.random() * 5)],
          duration: Math.floor(Math.random() * 45) + 20,
          caloriesBurned: Math.floor(Math.random() * 300) + 200,
          date: date, // Using actual Date object
        });

        // Seed Calories
        await Calorie.create({
          user: userId,
          foodName: ['Oatmeal', 'Chicken Salad', 'Fruit Bowl', 'Grilled Salmon', 'Protein Shake'][Math.floor(Math.random() * 5)],
          calories: Math.floor(Math.random() * 400) + 300,
          protein: Math.floor(Math.random() * 20) + 10,
          carbs: Math.floor(Math.random() * 50) + 20,
          fat: Math.floor(Math.random() * 15) + 5,
          mealType: ['breakfast', 'lunch', 'dinner', 'snack'][Math.floor(Math.random() * 4)],
          date: date,
        });

        // Seed Sleep
        await Sleep.create({
          user: userId,
          sleepTime: '22:30',
          wakeTime: '06:30',
          duration: (Math.random() * 2 + 6).toFixed(1),
          quality: ['good', 'excellent', 'fair'][Math.floor(Math.random() * 4)],
          date: date,
        });

        // Seed Water
        await Water.create({
          user: userId,
          amount: Math.floor(Math.random() * 1000) + 2000,
          date: date,
        });
      }
    }

    console.log('🎉 ALL USERS SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
