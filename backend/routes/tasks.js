const express = require('express');
const router = express.Router();
const Task = require('../models/tasks');
const auth = require('../middleware/auth');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        
        const task = new Task({
            user: req.userId,
            title,
            description,
            priority,
            dueDate
        });
        
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true }
        );
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.userId });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        task.completed = !task.completed;
        await task.save();
        
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;