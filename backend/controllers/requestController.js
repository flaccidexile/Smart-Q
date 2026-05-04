const { validationResult } = require('express-validator');
const { SacramentalRequest, Document } = require('../models');
const path = require('path');

// POST /api/requests  (authenticated or kiosk guest)
const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fullName,
      certificateType,
      purpose,
      contactNumber,
      address,
      dateOfSacrament,
      appointmentDate,
      appointmentTime,
      source,
      paymentMethod,
    } = req.body;

    const prices = {
      'Baptismal':      150.00,
      'Confirmation':   150.00,
      'Marriage':       300.00,
      'Death':          100.00,
      'Mass Intention':   0.00,
      'Appointment':      0.00,
    };
    const amountDue = prices[certificateType] ?? 0.00;

    const paymentProofPath = req.files && req.files['paymentProof'] && req.files['paymentProof'][0] 
      ? req.files['paymentProof'][0].path 
      : null;

    const requestData = {
      fullName,
      certificateType,
      purpose,
      contactNumber,
      address,
      dateOfSacrament: dateOfSacrament || null,
      appointmentDate: appointmentDate || null,
      appointmentTime: appointmentTime || null,
      source: source || 'online',
      status: 'Pending',
      userId: req.user ? req.user.id : null,
      paymentMethod: paymentMethod || 'onsite',
      amountDue,
      paymentProof: paymentProofPath,
    };

    const newRequest = await SacramentalRequest.create(requestData);

    // Handle uploaded documents
    if (req.files && req.files['documents'] && req.files['documents'].length > 0) {
      const docRecords = req.files['documents'].map((file) => ({
        requestId: newRequest.id,
        filename: file.originalname,
        storedPath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
      }));
      await Document.bulkCreate(docRecords);
    }

    const full = await SacramentalRequest.findByPk(newRequest.id, {
      include: [{ model: Document, as: 'documents' }],
    });

    res.status(201).json({ message: 'Request submitted successfully.', request: full });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests  (own requests for customer)
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await SacramentalRequest.findAll({
      where: { userId: req.user.id },
      include: [{ model: Document, as: 'documents' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/:id
const getRequestById = async (req, res, next) => {
  try {
    const request = await SacramentalRequest.findByPk(req.params.id, {
      include: [{ model: Document, as: 'documents' }],
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Customers can only view their own requests
    if (req.user && req.user.role === 'customer' && request.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/track/:id  (public tracking by ID - no auth needed)
const trackRequest = async (req, res, next) => {
  try {
    const request = await SacramentalRequest.findByPk(req.params.id, {
      attributes: ['id', 'fullName', 'certificateType', 'status', 'appointmentDate', 'appointmentTime', 'createdAt', 'updatedAt'],
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found. Please check your request ID.' });
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

// PUT /api/requests/:id/cancel
const cancelRequest = async (req, res, next) => {
  try {
    const request = await SacramentalRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Must belong to the user
    if (request.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only cancel your own requests.' });
    }

    // Can only cancel Pending requests
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot cancel request because it is already ${request.status}.` });
    }

    request.status = 'Cancelled';
    await request.save();

    res.json({ message: 'Request cancelled successfully.', request });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getMyRequests, getRequestById, trackRequest, cancelRequest };
