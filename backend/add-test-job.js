const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-career-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Job = require('./src/models/Job');

async function addTestJob() {
  try {
    console.log('Adding test job for mock user...');
    
    const testJob = new Job({
      title: 'Senior Full Stack Developer',
      company: {
        name: 'Tech Innovations Inc.',
        location: {
          city: 'San Francisco',
          isRemote: false
        }
      },
      description: 'We are looking for a senior full stack developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
      requirements: {
        education: {
          level: 'Bachelor'
        },
        experience: {
          min: 3,
          level: 'Senior Level'
        },
        skills: [
          { name: 'JavaScript', level: 'Advanced', isRequired: true },
          { name: 'React', level: 'Advanced', isRequired: true },
          { name: 'Node.js', level: 'Intermediate', isRequired: true },
          { name: 'MongoDB', level: 'Intermediate', isRequired: false }
        ]
      },
      responsibilities: [
        'Develop and maintain web applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code',
        'Participate in code reviews'
      ],
      benefits: [
        'Health insurance',
        'Flexible working hours',
        'Remote work options',
        'Professional development budget'
      ],
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      salary: {
        min: 90000,
        max: 120000,
        currency: 'USD',
        period: 'yearly'
      },
      postedBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Consistent mock ObjectId
      status: 'active'
    });

    const savedJob = await testJob.save();
    console.log('✅ Test job created successfully!');
    console.log('Job ID:', savedJob._id);
    console.log('Posted by:', savedJob.postedBy);
    
    // Add another test job
    const testJob2 = new Job({
      title: 'Frontend React Developer',
      company: {
        name: 'Digital Solutions LLC',
        location: {
          city: 'New York',
          isRemote: true
        }
      },
      description: 'Join our team as a Frontend React Developer and help build amazing user interfaces for our clients.',
      requirements: {
        education: {
          level: 'Bachelor'
        },
        experience: {
          min: 2,
          level: 'Mid Level'
        },
        skills: [
          { name: 'React', level: 'Advanced', isRequired: true },
          { name: 'TypeScript', level: 'Intermediate', isRequired: true },
          { name: 'CSS', level: 'Advanced', isRequired: true }
        ]
      },
      responsibilities: [
        'Build responsive web applications',
        'Implement UI/UX designs',
        'Optimize application performance'
      ],
      benefits: [
        'Remote work',
        'Health insurance',
        'Stock options'
      ],
      employmentType: 'Full-time',
      workMode: 'Remote',
      salary: {
        min: 70000,
        max: 95000,
        currency: 'USD',
        period: 'yearly'
      },
      postedBy: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Consistent mock ObjectId
      status: 'active'
    });

    const savedJob2 = await testJob2.save();
    console.log('✅ Second test job created successfully!');
    console.log('Job ID:', savedJob2._id);
    
    console.log('\n📊 Summary:');
    console.log('- Created 2 test jobs');
    console.log('- Both jobs assigned to mock-user-id');
    console.log('- Jobs should now appear in the manage jobs page');
    
  } catch (error) {
    console.error('❌ Error creating test job:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestJob();
