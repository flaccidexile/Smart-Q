const { SacramentalRequest, Document, User } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/requests
const getAllRequests = async (req, res, next) => {
  try {
    const { status, certificateType, source, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (certificateType) where.certificateType = certificateType;
    if (source) where.source = source;
    if (search) {
      where.fullName = { [Op.like]: `%${search}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: requests } = await SacramentalRequest.findAndCountAll({
      where,
      include: [
        { model: Document, as: 'documents' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      requests,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/requests/:id/status
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Approved', 'Released', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const request = await SacramentalRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await request.update({ status, notes: notes || request.notes });
    res.json({ message: 'Status updated successfully.', request });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/requests/:id
const deleteRequest = async (req, res, next) => {
  try {
    const request = await SacramentalRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }
    await request.destroy();
    res.json({ message: 'Request deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [total, pending, processing, approved, released, rejected] = await Promise.all([
      SacramentalRequest.count(),
      SacramentalRequest.count({ where: { status: 'Pending' } }),
      SacramentalRequest.count({ where: { status: 'Processing' } }),
      SacramentalRequest.count({ where: { status: 'Approved' } }),
      SacramentalRequest.count({ where: { status: 'Released' } }),
      SacramentalRequest.count({ where: { status: 'Rejected' } }),
    ]);

    res.json({ stats: { total, pending, processing, approved, released, rejected } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRequests, updateRequestStatus, deleteRequest, getAllUsers, getStats };
