const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

// Sample user database (in production, use a real database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('password123', 10),
    email: 'admin@example.com'
  }
];

// Middleware
const authMiddleware = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Login route - POST
const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ 
    message: 'Login successful', 
    user: { id: user.id, username: user.username, email: user.email } 
  });
};

// Logout route - POST
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
};

// Register route - POST
const registerUser = (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password: bcrypt.hashSync(password, 10),
    email
  };

  users.push(newUser);

  res.status(201).json({ 
    message: 'User registered successfully', 
    user: { id: newUser.id, username: newUser.username, email: newUser.email } 
  });
};

// Get current user
const getCurrentUser = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = users.find(u => u.id === req.session.userId);
  res.json({ user: { id: user.id, username: user.username, email: user.email } });
};

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
  authMiddleware
};