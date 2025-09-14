const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        
        const { username, email, password } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const user = new User({ username, email, password });
        await user.save();
        
        console.log('User created successfully:', user.username);
        
        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        console.log('Login successful for user:', username);
        
        // Create token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;