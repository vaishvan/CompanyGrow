const express = require('express');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Project = require('../models/Project');

const router = express.Router();

// Generate analytics report (admin only)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalProjects = await Project.countDocuments();
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const topPerformers = await User.find()
      .sort({ totalTokens: -1 })
      .limit(10)
      .select('name totalTokens');

    const analytics = {
      totalUsers,
      totalCourses,
      totalProjects,
      usersByRole,
      topPerformers
    };

    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate PDF report (admin only)
router.get('/pdf', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalProjects = await Project.countDocuments();
    
    const topPerformers = await User.find()
      .sort({ totalTokens: -1 })
      .limit(5)
      .select('name totalTokens');

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;

    // Title
    page.drawText('CompanyGrow Analytics Report', {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    yPosition -= 50;

    // Date
    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });

    yPosition -= 40;

    // Summary statistics
    page.drawText('Summary Statistics', {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    yPosition -= 30;

    const stats = [
      `Total Users: ${totalUsers}`,
      `Total Courses: ${totalCourses}`,
      `Total Projects: ${totalProjects}`
    ];

    stats.forEach(stat => {
      page.drawText(stat, {
        x: 70,
        y: yPosition,
        size: 14,
        font: font,
        color: rgb(0, 0, 0)
      });
      yPosition -= 25;
    });

    yPosition -= 20;

    // Top performers
    page.drawText('Top Performers', {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    yPosition -= 30;

    topPerformers.forEach((performer, index) => {
      page.drawText(`${index + 1}. ${performer.name} - ${performer.totalTokens} tokens`, {
        x: 70,
        y: yPosition,
        size: 14,
        font: font,
        color: rgb(0, 0, 0)
      });
      yPosition -= 25;
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=companygrow-report.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee dashboard data
router.get('/employee-dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's courses with real progress
    const userCourses = await Course.find();
    
    // Calculate real course completion data
    let totalCourseProgress = 0;
    let completedCourses = 0;
    const courseProgressData = [];
      for (const course of userCourses) {
      // Find user's enrollment in this course
      const userEnrollment = course.enrolledUsers?.find(enrollment => 
        enrollment.user.toString() === userId.toString() || 
        enrollment.user._id?.toString() === userId.toString()
      );
      
      // Only include courses the user is actually enrolled in
      if (userEnrollment) {
        const courseProgress = userEnrollment.progress || 0;
        
        totalCourseProgress += courseProgress;
        if (courseProgress >= 100) {
          completedCourses++;
        }
        
        courseProgressData.push({
          name: course.name,
          progress: courseProgress
        });
      }
    }
    
    // Get user's projects with real progress
    const userProjects = await Project.find({
      'assignedEmployees.employee': userId
    });
    
    let totalProjectProgress = 0;
    const projectProgressData = [];
    
    for (const project of userProjects) {
      // For now, use mock data for projects as there's no progress tracking yet
      const projectProgress = Math.floor(Math.random() * 101);
      totalProjectProgress += projectProgress;
      
      projectProgressData.push({
        name: project.name,
        progress: projectProgress
      });
    }
      // Calculate overall progress
    const totalItems = courseProgressData.length + userProjects.length;
    const overallProgress = totalItems > 0 
      ? Math.round((totalCourseProgress + totalProjectProgress) / totalItems)
      : 0;
    
    // Get user's skills
    const user = await User.findById(userId);
    const totalSkills = user.skills?.length || 0;
    
    const myProgress = {
      overall: overallProgress,
      courses: courseProgressData.slice(0, 5), // Show top 5 courses
      projects: projectProgressData.slice(0, 5) // Show top 5 projects
    };

    const dashboard = {
      completedCourses,
      activeProjects: userProjects.length,
      totalSkills,
      myProgress
    };

    res.json(dashboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get individual employee report data (managers can view employee reports, exclude admin/manager profiles)
router.get('/employee/:id', auth, async (req, res) => {
  try {
    const requestingUser = req.user;
    const employeeId = req.params.id;
    
    // Only managers and admins can view employee reports
    if (requestingUser.role !== 'manager' && requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only managers can view employee reports.' });
    }
    
    // Get the employee data
    const employee = await User.findById(employeeId).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Don't allow viewing reports of managers or admins
    if (employee.role === 'manager' || employee.role === 'admin') {
      return res.status(403).json({ message: 'Cannot view reports for managers or administrators' });
    }
    
    // Get employee's courses with real progress
    const userCourses = await Course.find();
    
    // Calculate course completion data for this specific employee
    let totalCourseProgress = 0;
    let completedCourses = 0;
    const courseProgressData = [];
    
    for (const course of userCourses) {
      // Find employee's enrollment in this course
      const userEnrollment = course.enrolledUsers?.find(enrollment => 
        enrollment.user.toString() === employeeId.toString() || 
        enrollment.user._id?.toString() === employeeId.toString()
      );
      
      // Only include courses the employee is actually enrolled in
      if (userEnrollment) {
        const courseProgress = userEnrollment.progress || 0;
        
        totalCourseProgress += courseProgress;
        if (courseProgress >= 100) {
          completedCourses++;
        }
        
        courseProgressData.push({
          name: course.name,
          progress: courseProgress,
          enrolledDate: userEnrollment.enrolledDate || 'N/A'
        });
      }
    }
    
    // Get employee's projects with progress
    const userProjects = await Project.find({
      'assignedEmployees.employee': employeeId
    });
    
    let totalProjectProgress = 0;
    const projectProgressData = [];
    
    for (const project of userProjects) {
      // For now, use mock data for projects as there's no progress tracking yet
      const projectProgress = Math.floor(Math.random() * 101);
      totalProjectProgress += projectProgress;
      
      projectProgressData.push({
        name: project.name,
        progress: projectProgress,
        assignedDate: project.createdAt || 'N/A'
      });
    }
    
    // Calculate overall progress
    const totalItems = courseProgressData.length + userProjects.length;
    const overallProgress = totalItems > 0 
      ? Math.round((totalCourseProgress + totalProjectProgress) / totalItems)
      : 0;
    
    // Get employee's skills
    const totalSkills = employee.skills?.length || 0;
    
    // Prepare report data
    const employeeReport = {
      employee: {
        id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        position: employee.position,
        email: employee.email,
        profileImage: employee.profileImage,
        joinDate: employee.createdAt
      },
      statistics: {
        completedCourses,
        activeProjects: userProjects.length,
        totalSkills,
        overallProgress
      },
      progress: {
        overall: overallProgress,
        courses: courseProgressData,
        projects: projectProgressData
      }
    };
    
    res.json(employeeReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate PDF report for individual employee (managers can generate PDFs)
router.get('/employee/:id/pdf', auth, async (req, res) => {
  try {
    const requestingUser = req.user;
    const employeeId = req.params.id;
    
    // Only managers and admins can generate employee PDFs
    if (requestingUser.role !== 'manager' && requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only managers can generate employee reports.' });
    }
    
    // Get the employee data
    const employee = await User.findById(employeeId).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Don't allow generating reports for managers or admins
    if (employee.role === 'manager' || employee.role === 'admin') {
      return res.status(403).json({ message: 'Cannot generate reports for managers or administrators' });
    }
    
    // Get employee's course progress
    const userCourses = await Course.find();
    let completedCourses = 0;
    const courseProgressData = [];
    
    for (const course of userCourses) {
      const userEnrollment = course.enrolledUsers?.find(enrollment => 
        enrollment.user.toString() === employeeId.toString()
      );
      
      if (userEnrollment) {
        const courseProgress = userEnrollment.progress || 0;
        if (courseProgress >= 100) {
          completedCourses++;
        }
        courseProgressData.push({
          name: course.name,
          progress: courseProgress
        });
      }
    }
    
    // Get employee's projects
    const userProjects = await Project.find({
      'assignedEmployees.employee': employeeId
    });
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;

    // Title
    page.drawText(`Employee Performance Report`, {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    yPosition -= 30;

    // Employee Name
    page.drawText(`Employee: ${employee.name}`, {
      x: 50,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    yPosition -= 25;

    // Employee Details
    page.drawText(`ID: ${employee.employeeId || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });

    yPosition -= 20;

    page.drawText(`Position: ${employee.position || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });

    yPosition -= 20;

    page.drawText(`Email: ${employee.email || 'N/A'}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });

    yPosition -= 30;

    // Date
    page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });

    yPosition -= 40;

    // Performance Summary
    page.drawText('Performance Summary', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    yPosition -= 25;

    const stats = [
      `Completed Courses: ${completedCourses}`,
      `Active Projects: ${userProjects.length}`,
      `Total Skills: ${employee.skills?.length || 0}`
    ];

    stats.forEach(stat => {
      page.drawText(stat, {
        x: 70,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0)
      });
      yPosition -= 20;
    });

    yPosition -= 20;

    // Course Progress
    if (courseProgressData.length > 0) {
      page.drawText('Course Progress', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      yPosition -= 25;

      courseProgressData.slice(0, 10).forEach((course) => {
        page.drawText(`${course.name}: ${course.progress}%`, {
          x: 70,
          y: yPosition,
          size: 11,
          font: font,
          color: rgb(0, 0, 0)
        });
        yPosition -= 18;
      });
    }

    yPosition -= 20;

    // Projects
    if (userProjects.length > 0) {
      page.drawText('Assigned Projects', {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0)
      });

      yPosition -= 25;

      userProjects.slice(0, 8).forEach((project) => {
        page.drawText(`• ${project.name}`, {
          x: 70,
          y: yPosition,
          size: 11,
          font: font,
          color: rgb(0, 0, 0)
        });
        yPosition -= 18;
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${employee.name.replace(/\s+/g, '_')}_report.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
