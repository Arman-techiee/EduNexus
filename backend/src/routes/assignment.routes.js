const express = require('express')
const router = express.Router()
const { protect, allowRoles } = require('../middleware/auth.middleware')
const {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getMySubmissions,
  gradeSubmission
} = require('../controllers/assignment.controller')

router.use(protect)

// Instructor routes
router.post('/', allowRoles('INSTRUCTOR'), createAssignment)
router.put('/:id', allowRoles('INSTRUCTOR'), updateAssignment)
router.delete('/:id', allowRoles('INSTRUCTOR', 'ADMIN'), deleteAssignment)
router.patch('/submissions/:submissionId/grade', allowRoles('INSTRUCTOR'), gradeSubmission)

// Student routes
router.post('/:id/submit', allowRoles('STUDENT'), submitAssignment)
router.get('/my-submissions', allowRoles('STUDENT'), getMySubmissions)

// All roles
router.get('/', allowRoles('ADMIN', 'INSTRUCTOR', 'STUDENT'), getAllAssignments)
router.get('/:id', allowRoles('ADMIN', 'INSTRUCTOR', 'STUDENT'), getAssignmentById)

module.exports = router