import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authController } from '../../controllers/authController';
import { User } from '../../models/User';
import { errorHandler } from '../../middleware/errorHandler';
import { IUser } from '../../types';

// Create Express app for testing
const app = express();
app.use(express.json());
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/logout', authController.logout);
app.get('/auth/me', authController.protect, authController.getMe);
app.use(errorHandler);

describe('Auth Controller', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        role: 'student',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('should not register user with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        role: 'student',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('password');
    });

    it('should not register user with duplicate email', async () => {
      // Create first user
      await global.testUtils.createTestUser({
        email: 'john@example.com',
      });

      const userData = {
        name: 'Jane Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email');
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user?.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, user!.password)).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    let testUser: IUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser({
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
      });
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should not login inactive user', async () => {
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('account is deactivated');
    });

    it('should update lastLogin timestamp', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.lastLogin).toBeDefined();
      expect(new Date(updatedUser!.lastLogin!).getTime()).toBeGreaterThan(
        new Date(testUser.createdAt).getTime()
      );
    });
  });

  describe('GET /auth/me', () => {
    let testUser: IUser;
    let token: string;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
      token = global.testUtils.generateTestToken(testUser._id.toString());
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should not get user with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id.toString() },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('expired');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });
});