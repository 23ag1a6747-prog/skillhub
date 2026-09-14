const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Resume = require('../models/Resume');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register(req, res, next) {
  try {
    const { name, username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email or username already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, username: username.toLowerCase(), email: email.toLowerCase(), passwordHash });

    // Every user gets an empty resume shell so /api/resume always has something to GET.
    await Resume.create({
      user: user._id,
      personalInfo: { fullName: name, email: user.email },
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = { register, login, me };
