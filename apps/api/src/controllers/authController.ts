import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { generateReferralCode } from '../utils/referral';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password, name, role = 'CUSTOMER', referredBy } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referredBy) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: referredBy }
      });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Hash password and generate referral code
    const hashedPassword = await hashPassword(password);
    const referralCode = await generateReferralCode();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase(),
        referralCode,
        referredBy: referredBy || null
      }
    });

    // If user was referred, give rewards
    if (referrer) {
      // Give referrer 10,000 points
      await prisma.user.update({
        where: { id: referrer.id },
        data: { pointsBalance: { increment: 10000 } }
      });

      // Create points history
      await prisma.pointsHistory.create({
        data: {
          userId: referrer.id,
          points: 10000,
          type: 'EARNED',
          description: `Referral reward for inviting ${email}`,
          expiresAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000) // 3 months
        }
      });

      // Give new user a discount coupon
      await prisma.coupon.create({
        data: {
          userId: user.id,
          code: `WELCOME${user.referralCode}`,
          discount: 10, // 10% discount
          discountType: 'PERCENTAGE',
          expiresAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000) // 3 months
        }
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        referralCode: user.referralCode,
        pointsBalance: user.pointsBalance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        referralCode: user.referralCode,
        pointsBalance: user.pointsBalance,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        referralCode: true,
        pointsBalance: true,
        profilePicture: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};