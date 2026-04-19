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
    } = req.body;

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
    };

    const newRequest = await SacramentalRequest.create(requestData);

    // Handle uploaded documents
    if (req.files && req.files.length > 0) {
      const docRecords = req.files.map((file) => ({
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

module.exports = { createRequest, getMyRequests, getRequestById, trackRequest };
