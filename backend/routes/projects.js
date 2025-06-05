const express = require('express');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name')
      .populate('assignedEmployees.employee', 'name employeeId');
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get projects assigned to current user (employee) - MUST come before /:id route
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'assignedEmployees.employee': req.user._id
    })
      .populate('createdBy', 'name')
      .populate('assignedEmployees.employee', 'name employeeId');
    
    // Add mock progress data for demonstration
    const projectsWithProgress = projects.map(project => ({
      ...project.toObject(),
      progress: Math.floor(Math.random() * 101), // Random progress between 0-100
      status: ['Not Started', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)]
    }));
    
    res.json(projectsWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('assignedEmployees.employee', 'name employeeId');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (admin/manager only)
router.post('/', auth, managerAuth, async (req, res) => {
  try {
    const { name, description, tokens, skillsRequired, deadline } = req.body;
    
    const project = new Project({
      name,
      description,
      tokens,
      skillsRequired,
      deadline,
      createdBy: req.user._id
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, managerAuth, async (req, res) => {
  try {
    const { name, description, tokens, skillsRequired, deadline, status } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, tokens, skillsRequired, deadline, status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign employee to project
router.post('/:id/assign', auth, managerAuth, async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee is already assigned
    const isAssigned = project.assignedEmployees.some(
      emp => emp.employee.toString() === employeeId
    );

    if (isAssigned) {
      return res.status(400).json({ message: 'Employee already assigned to this project' });
    }

    project.assignedEmployees.push({ employee: employeeId });
    await project.save();

    // Update user's projects
    employee.projects.push({ project: project._id });    await employee.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project progress/completion (for employees)
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { completed } = req.body;
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the employee assignment
    const employeeAssignment = project.assignedEmployees.find(
      emp => emp.employee.toString() === userId.toString()
    );

    if (!employeeAssignment) {
      return res.status(403).json({ message: 'You are not assigned to this project' });
    }

    // Check if project was already completed to prevent double token awarding
    const wasAlreadyCompleted = employeeAssignment.completed;

    // Update completion status
    employeeAssignment.completed = completed;

    // Award tokens if project is being marked as completed for the first time
    if (completed && !wasAlreadyCompleted) {
      const user = await User.findById(userId);
      if (user) {
        // Award tokens
        const tokensToAward = project.tokens || 0;
        user.totalTokens += tokensToAward;
        user.availableTokens += tokensToAward;
        
        // Update the assignment with tokens earned
        employeeAssignment.tokensEarned = tokensToAward;
        
        await user.save();
        
        console.log(`Awarded ${tokensToAward} tokens to user ${user.name} for completing project: ${project.name}`);
      }
    }

    await project.save();
    res.json({ 
      message: completed ? 'Project marked as completed and tokens awarded!' : 'Project progress updated',
      tokensAwarded: completed && !wasAlreadyCompleted ? project.tokens : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
