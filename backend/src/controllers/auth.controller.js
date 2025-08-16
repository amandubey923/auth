import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { sendEmail } from '../utils/sendEmail.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd || process.env.COOKIE_SECURE === 'true',
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = signToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ message: 'Signup successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    setTokenCookie(res, token);
    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -resetPasswordTokenHash -resetPasswordExpires');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always 200 to avoid email enumeration
    if (!user) return res.status(200).json({ message: 'If that email exists, we sent a link' });

    // generate raw token (sent to user) and store hashed version in DB
    const raw = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordTokenHash = hash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${raw}`;
    const html = `<p>You requested a password reset. Click the link below (valid 15 minutes):</p>
                  <p><a href="${resetLink}">${resetLink}</a></p>`;

    const info = await sendEmail({ to: user.email, subject: 'Reset your password', html });
    // For Ethereal, nodemailer preview URL is logged in sendEmail util.
    res.json({ message: 'If that email exists, we sent a link', info: process.env.NODE_ENV !== 'production' ? (info && info.messageId) : undefined });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // raw token coming from link
    const { password } = req.body;
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordTokenHash: hash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
