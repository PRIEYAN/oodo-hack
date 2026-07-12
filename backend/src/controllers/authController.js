import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { ROLES } from '../models/User.js';
import ApiError, { asyncHandler } from '../utils/ApiError.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    throw new ApiError(400, 'name, email, password and role are required.');
  if (!ROLES.includes(role)) throw new ApiError(400, `role must be one of: ${ROLES.join(', ')}.`);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  res.status(201).json({ token: signToken(user), user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'email and password are required.');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid email or password.');

  res.json({ token: signToken(user), user });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
