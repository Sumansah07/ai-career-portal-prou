// MongoDB initialization script for production deployment
db = db.getSiblingDB('ai-career-portal');

// Create indexes for User collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "skills.name": 1 });
db.users.createIndex({ "preferences.industries": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "role": 1, "isActive": 1 });

// Create indexes for Job collection
db.jobs.createIndex({ "title": "text", "company.name": "text", "description": "text" });
db.jobs.createIndex({ "requirements.skills.name": 1 });
db.jobs.createIndex({ "employmentType": 1 });
db.jobs.createIndex({ "workMode": 1 });
db.jobs.createIndex({ "company.industry": 1 });
db.jobs.createIndex({ "status": 1 });
db.jobs.createIndex({ "createdAt": -1 });
db.jobs.createIndex({ "postedBy": 1 });
db.jobs.createIndex({ "status": 1, "createdAt": -1 });
db.jobs.createIndex({ "postedBy": 1, "status": 1 });

// Create indexes for Application collection
db.applications.createIndex({ "applicant": 1, "job": 1 }, { unique: true });
db.applications.createIndex({ "job": 1, "status": 1 });
db.applications.createIndex({ "applicant": 1, "status": 1 });
db.applications.createIndex({ "appliedAt": -1 });
db.applications.createIndex({ "status": 1, "appliedAt": -1 });

// Create indexes for Resume collection
db.resumes.createIndex({ "userId": 1 });
db.resumes.createIndex({ "processingStatus": 1 });
db.resumes.createIndex({ "createdAt": -1 });
db.resumes.createIndex({ "userId": 1, "createdAt": -1 });

print("✅ Database indexes created successfully");

// Create default admin user (only if it doesn't exist)
const adminExists = db.users.findOne({ email: "admin@example.com" });
if (!adminExists) {
    db.users.insertOne({
        firstName: "System",
        lastName: "Admin",
        email: "admin@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaQJfKS4l9yzw6PVc8xhVlJ5e", // "admin123" hashed
        role: "admin",
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    print("✅ Default admin user created");
} else {
    print("ℹ️  Admin user already exists");
}

print("🎉 Database initialization completed successfully!");