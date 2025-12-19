const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('email-validator');

// In-memory user storage (use a database in production)
let users = [];

// Validation function
const validateSignupData = (username, email, password, confirmPassword) => {
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (username.length > 20) {
    errors.push('Username must not exceed 20 characters');
  }

  if (!email || !validator.validate(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return errors;
};

// Signup route - POST 
const signupUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validate input
    const errors = validateSignupData(username, email, password, confirmPassword);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Check if user already exists
    const existingUser = users.find(
      u => u.username === username || u.email === email
    );
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username or email already registered' 
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    // Don't send password back
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred during signup',
      error: error.message
    });
  }
};

// Get all users (for testing - remove in production)
const getAllUsers = (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({ users: usersWithoutPasswords });
};

// Check if username/email exists
const checkUserExists = (req, res) => {
  const { username, email } = req.query;

  if (username) {
    const exists = users.some(u => u.username === username);
    return res.json({ username, exists });
  }

  if (email) {
    const exists = users.some(u => u.email === email.toLowerCase());
    return res.json({ email, exists });
  }

  res.status(400).json({ message: 'Provide username or email to check' });
};

// Reset users (for testing)
const resetUsers = (req, res) => {
  users = [];
  res.json({ message: 'Users reset successfully' });
};

module.exports = {
  signupUser,
  getAllUsers,
  checkUserExists,
  resetUsers
};
