const mongoose = require('mongoose');

const checkDatabaseConnection = async () => {
  try {
    const dbState = mongoose.connection.readyState;
    console.log('Database state:', dbState);
    
    if (dbState === 1) {
      console.log('✅ Database connected successfully');
      process.exit(0);
    } else {
      console.log('❌ Database not connected');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
};

// If this script is run directly
if (require.main === module) {
  checkDatabaseConnection();
}

module.exports = checkDatabaseConnection;