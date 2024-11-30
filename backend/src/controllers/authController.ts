import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        email,
        password, // Will be hashed by the model's pre-save hook
        name,
        phone
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone
        },
        token
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user and include password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone
        },
        token
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Error logging in' });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.userId)
        .populate('cats')
        .populate('reports');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cats: user.cats,
        reports: user.reports
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({ error: 'Error fetching profile' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, phone, currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update basic info
      if (name) user.name = name;
      if (phone) user.phone = phone;

      // Update password if provided
      if (currentPassword && newPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        user.password = newPassword;
      }

      await user.save();

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({ error: 'Error updating profile' });
    }
  }
}