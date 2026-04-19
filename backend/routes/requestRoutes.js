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
} = require('../controllers/requestController');

const requestValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('certificateType')
    .isIn(['Baptismal', 'Confirmation', 'Marriage', 'Death'])
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
  upload.array('documents', 5),
  requestValidation,
  createRequest
);

router.get('/', authMiddleware, getMyRequests);
router.get('/:id', authMiddleware, getRequestById);

module.exports = router;
