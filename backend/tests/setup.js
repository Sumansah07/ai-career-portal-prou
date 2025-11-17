const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
  
  // Stop in-memory MongoDB instance
  if (mongod) {
    await mongod.stop();
  }
});

// Global test helpers
global.testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  role: 'student'
};

global.testRecruiter = {
  firstName: 'Test',
  lastName: 'Recruiter',
  email: 'recruiter@example.com',
  password: 'password123',
  role: 'recruiter'
};