const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Project = require('../models/Project');

const router = express.Router();

// Get all employees (for admin dashboard)
router.get('/employees', auth, adminAuth, async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .populate('courses.course', 'name')
      .populate('projects.project', 'name');
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
