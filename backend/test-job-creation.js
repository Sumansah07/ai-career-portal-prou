const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-career-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Job = require('./src/models/Job');

async function testJobCreation() {
  try {
    console.log('Testing job creation...');
    
    const testJobData = {
      title: 'Test Cloud Architect',
      company: {
        name: 'Test Company Ltd',
        location: {
          city: 'Coimbatore',
          isRemote: false
        }
      },
      description: 'This is a test job description for cloud architect position.',
      requirements: {
        education: {
          level: 'Bachelor'
        },
        experience: {
          min: 0,
          level: 'Entry Level'
        },
        skills: [{
          name: 'AWS',
          level: 'Basic',
          isRequired: true
        }]
      },
      responsibilities: ['Design cloud architecture', 'Manage cloud resources'],
      benefits: ['Health insurance', 'Remote work'],
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      postedBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      status: 'active'
    };

    console.log('Creating job with data:', JSON.stringify(testJobData, null, 2));
    
    const job = new Job(testJobData);
    const savedJob = await job.save();
    
    console.log('✅ Job created successfully!');
    console.log('Job ID:', savedJob._id);
    
    // Clean up
    await Job.findByIdAndDelete(savedJob._id);
    console.log('✅ Test job deleted');
    
  } catch (error) {
    console.error('❌ Job creation failed:', error);
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    mongoose.connection.close();
  }
}

testJobCreation();
