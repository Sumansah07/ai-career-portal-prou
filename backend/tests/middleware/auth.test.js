const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { auth, authorize } = require('../../src/middleware/auth');
const User = require('../../src/models/User');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('auth middleware', () => {
    it('should authenticate valid token', async () => {
      // Create a test user
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });
      await user.save();

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
      
      const req = {
        header: jest.fn().mockReturnValue(`Bearer ${token}`)
      };
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(user._id.toString());
    });

    it('should reject request without token', async () => {
      const req = {
        header: jest.fn().mockReturnValue(null)
      };
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided, authorization denied'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      const req = {
        header: jest.fn().mockReturnValue('Bearer invalid-token')
      };
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ userId: fakeUserId, role: 'student' }, process.env.JWT_SECRET);
      
      const req = {
        header: jest.fn().mockReturnValue(`Bearer ${token}`)
      };
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is no longer valid'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      });
      await testUser.save();
    });

    it('should allow access for authorized role', async () => {
      const req = {
        user: { userId: testUser._id, role: 'student' }
      };
      const res = mockResponse();
      const next = mockNext;

      const authorizeMiddleware = authorize('student');
      await authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userRole).toBe('student');
    });

    it('should deny access for unauthorized role', async () => {
      const req = {
        user: { userId: testUser._id, role: 'student' }
      };
      const res = mockResponse();
      const next = mockNext;

      const authorizeMiddleware = authorize('recruiter');
      await authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. This feature is only available to recruiter.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow access for multiple authorized roles', async () => {
      const req = {
        user: { userId: testUser._id, role: 'student' }
      };
      const res = mockResponse();
      const next = mockNext;

      const authorizeMiddleware = authorize('student', 'recruiter');
      await authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userRole).toBe('student');
    });
  });
});