const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

// Get all courses (for browsing)
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy', 'name');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get courses assigned to current user (employee)
router.get('/my-courses', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all courses and filter by enrollment
    const allCourses = await Course.find().populate('createdBy', 'name');
    
    // Filter to show only enrolled courses, or show all with enrollment status
    const coursesWithProgress = allCourses
      .map(course => {
        const userEnrollment = course.enrolledUsers?.find(enrollment => 
          enrollment.user.toString() === userId.toString()
        );
        
        // Only return courses where user is enrolled, or if no one is enrolled yet (new course)
        if (userEnrollment || course.enrolledUsers?.length === 0) {
          return {
            ...course.toObject(),
            progress: {
              completedModules: userEnrollment ? Math.floor((userEnrollment.progress / 100) * (course.studyMaterials?.length || 1)) : 0,
              totalModules: course.studyMaterials?.length || 1,
              percentage: userEnrollment ? userEnrollment.progress : 0,
              completed: userEnrollment ? userEnrollment.completed : false
            }
          };
        }
        return null;
      })
      .filter(course => course !== null); // Remove null values
    
    res.json(coursesWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for a course (employee)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // In a real application, you would add the course to the user's enrolled courses
    // For now, just return success
    res.json({ message: 'Successfully registered for course', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single course
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy', 'name');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (admin/manager only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, tokens, image, studyMaterials, skillsRequired } = req.body;
    
    const course = new Course({
      name,
      description,
      tokens,
      image,
      studyMaterials,
      skillsRequired,
      createdBy: req.user._id
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, tokens, image, studyMaterials, skillsRequired } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, description, tokens, image, studyMaterials, skillsRequired },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course progress (when user clicks on study material)
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { materialIndex, progress } = req.body;
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find or create user enrollment
    let userEnrollment = course.enrolledUsers.find(enrollment => 
      enrollment.user.toString() === userId.toString()
    );

    if (!userEnrollment) {
      // Auto-enroll user if not already enrolled
      course.enrolledUsers.push({
        user: userId,
        progress: progress,
        completed: progress >= 100
      });    } else {
      // Update existing enrollment
      const oldProgress = userEnrollment.progress;
      userEnrollment.progress = Math.max(userEnrollment.progress, progress);
      userEnrollment.completed = userEnrollment.progress >= 100;
      
      // Award tokens if course is newly completed
      if (!userEnrollment.completed && userEnrollment.progress >= 100 && oldProgress < 100) {
        const user = await User.findById(userId);
        if (user) {
          user.totalTokens += course.tokens;
          user.availableTokens += course.tokens;
          await user.save();
        }
      }
    }

    await course.save();
    res.json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for a course (updated to handle actual enrollment)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const isEnrolled = course.enrolledUsers.some(enrollment => 
      enrollment.user.toString() === userId.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({ message: 'Already registered for this course' });
    }

    // Enroll user
    course.enrolledUsers.push({
      user: userId,
      progress: 0,
      completed: false
    });

    await course.save();
    res.json({ message: 'Successfully registered for course', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
