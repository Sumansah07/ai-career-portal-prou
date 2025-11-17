const mongoose = require('mongoose');
const User = require('../../src/models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'student'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isActive).toBe(true);
    });

    it('should hash password before saving', async () => {
      const password = 'testpassword123';
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: password,
        role: 'student'
      });

      await user.save();
      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(20); // Hashed password is longer
    });

    it('should fail validation for invalid email', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail validation for short password', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: '123' // Too short
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail validation for missing required fields', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
        // Missing firstName and lastName
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });
      await user.save();
    });

    it('should compare passwords correctly', async () => {
      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });

    it('should return full name virtual', () => {
      expect(user.fullName).toBe('Test User');
    });

    it('should exclude sensitive fields from JSON', () => {
      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.emailVerificationToken).toBeUndefined();
      expect(userJSON.passwordResetToken).toBeUndefined();
    });
  });

  describe('User Roles', () => {
    it('should default to student role', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      });

      await user.save();
      expect(user.role).toBe('student');
    });

    it('should accept valid roles', async () => {
      const roles = ['student', 'recruiter', 'admin'];

      for (const role of roles) {
        const user = new User({
          firstName: 'Test',
          lastName: 'User',
          email: `${role}@example.com`,
          password: 'password123',
          role: role
        });

        await user.save();
        expect(user.role).toBe(role);
      }
    });

    it('should reject invalid roles', async () => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      });

      await expect(user.save()).rejects.toThrow();
    });
  });
});