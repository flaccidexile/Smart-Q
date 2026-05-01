const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getAllRequests,
  updateRequestStatus,
  deleteRequest,
  getAllUsers,
  getStats,
  getReports,
  getCalendarAppointments
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/stats', getStats);
router.get('/requests', getAllRequests);
router.patch('/requests/:id/status', updateRequestStatus);
router.delete('/requests/:id', deleteRequest);
router.get('/users', getAllUsers);
router.get('/reports', getReports);
router.get('/calendar', getCalendarAppointments);

module.exports = router;
