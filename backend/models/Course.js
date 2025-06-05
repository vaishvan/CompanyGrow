const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  tokens: {
    type: Number,
    required: true,
    default: 0
  },
  studyMaterials: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String
    },    type: {
      type: String,
      enum: ['video', 'document', 'quiz', 'assignment', 'file'],
      default: 'document'
    },
    url: {
      type: String
    }
  }],
  skillsRequired: [{
    type: String
  }],
  enrolledUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
