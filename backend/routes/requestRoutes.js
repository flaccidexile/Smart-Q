const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createRequest,
  getMyRequests,
  getRequestById,
  trackRequest,
  cancelRequest,
} = require('../controllers/requestController');

const requestValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('certificateType')
    .isIn(['Baptismal', 'Confirmation', 'Marriage', 'Death', 'Mass Intention', 'Appointment'])
    .withMessage('Invalid certificate type.'),
];

// Public: track by ID (no auth)
router.get('/track/:id', trackRequest);

// Authenticated customers
router.post(
  '/',
  (req, res, next) => {
    // Allow kiosk (no token) or authenticated users
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return authMiddleware(req, res, next);
    }
    next();
  },
  upload.fields([
    { name: 'documents', maxCount: 5 },
    { name: 'paymentProof', maxCount: 1 }
  ]),
  requestValidation,
  createRequest
);

router.get('/', authMiddleware, getMyRequests);
router.get('/:id', authMiddleware, getRequestById);
router.put('/:id/cancel', authMiddleware, cancelRequest);

module.exports = router;
