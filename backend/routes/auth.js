const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const user = new User({ name, email, role, phone });
    await user.setPassword(password);
    await user.save();
    res.json({ message: 'User registered' });
  } catch (e) {
    res.status(400).json({ message: 'Email already registered or invalid data' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

module.exports = router;
