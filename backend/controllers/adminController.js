const { SacramentalRequest, Document, User, AuditLog, BlockedDate } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

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
      order: [['createdAt', 'ASC']],
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
    
    // Log the action
    await AuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Updated Status -> ${status}`,
      target: `Request #${request.id}`,
    });

    res.json({ message: 'Status updated successfully.', request });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/requests/:id/payment
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    if (!['Unpaid', 'Paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status.' });
    }

    const request = await SacramentalRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    await request.update({ paymentStatus });
    
    await AuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name,
      action: `Updated Payment Status -> ${paymentStatus}`,
      target: `Request #${request.id}`,
    });

    res.json({ message: 'Payment status updated successfully.', request });
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

// GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const targetYear = req.query.year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${parseInt(targetYear) + 1}-01-01T00:00:00Z`);

    const volumeData = await SacramentalRequest.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt'))), 'monthNum'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'value']
      ],
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '<', endDate)
        ]
      },
      group: ['monthNum'],
      order: [[sequelize.literal('monthNum'), 'ASC']]
    });

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullYearData = monthLabels.map((m, i) => {
      const found = volumeData.find(d => parseInt(d.dataValues.monthNum) === i + 1);
      return { label: m, value: found ? parseInt(found.dataValues.value) : 0 };
    });

    // 2. Financial Ledger (Approved requests = paid)
    // For now, assuming static fees: Baptismal/Confirmation = 500, Marriage = 1000, Death = 500
    const approvedRequests = await SacramentalRequest.findAll({
      where: { 
        status: { [Op.in]: ['Approved', 'Released'] },
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '<', endDate)
        ]
      },
      order: [['updatedAt', 'DESC']],
      limit: 10
    });

    let totalRevenue = 0;
    const ledger = approvedRequests.map(req => {
      const amount = parseFloat(req.amountDue) || 0;
      totalRevenue += amount;
      return {
        date: req.updatedAt.toISOString().split('T')[0],
        type: `${req.certificateType} Fee`,
        amount
      };
    });

    // Calculate actual total revenue from all approved/released
    const allApproved = await SacramentalRequest.findAll({ 
      where: { 
        status: { [Op.in]: ['Approved', 'Released'] },
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '<', endDate)
        ]
      } 
    });
    let totalAllTimeRevenue = 0;
    allApproved.forEach(req => {
      totalAllTimeRevenue += parseFloat(req.amountDue) || 0;
    });

    // 3. Audit Logs
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const formattedLogs = logs.map(log => {
      const date = new Date(log.createdAt);
      return {
        time: `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        admin: log.adminName,
        action: log.action,
        target: log.target
      }
    });

    // 4. All requests summary (for full request list in reports)
    const allRequests = await SacramentalRequest.findAll({
      attributes: ['id', 'fullName', 'certificateType', 'purpose', 'status', 'source', 'appointmentDate', 'createdAt', 'paymentStatus', 'amountDue'],
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '<', endDate)
        ]
      },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 500,
    });

    // 5. Type breakdown counts
    const typeBreakdown = await SacramentalRequest.findAll({
      attributes: [
        'certificateType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('SacramentalRequest.appointmentDate'), sequelize.col('SacramentalRequest.createdAt')), '<', endDate)
        ]
      },
      group: ['certificateType'],
    });

    const formattedRequests = allRequests.map(r => ({
      id:              r.id,
      fullName:        r.fullName,
      certificateType: r.certificateType,
      purpose:         r.purpose,
      status:          r.status,
      source:          r.source,
      appointmentDate: r.appointmentDate,
      createdAt:       r.createdAt ? r.createdAt.toISOString().split('T')[0] : '—',
      paymentStatus:   r.paymentStatus,
      amountDue:       parseFloat(r.amountDue) || 0,
      userName:        r.user?.name || null,
    }));

    res.json({
      reportData: fullYearData,
      totalRevenue: totalAllTimeRevenue,
      ledger,
      auditLogs: formattedLogs,
      allRequests: formattedRequests,
      typeBreakdown: typeBreakdown.map(t => ({
        type: t.dataValues.certificateType,
        count: parseInt(t.dataValues.count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/calendar
const getCalendarAppointments = async (req, res, next) => {
  try {
    const appointments = await SacramentalRequest.findAll({
      where: { appointmentDate: { [Op.not]: null } },
      attributes: ['id', 'appointmentDate', 'appointmentTime', 'certificateType', 'fullName', 'purpose', 'notes', 'contactNumber', 'source', 'status', 'conflictResolved'],
    });

    const blockedDatesData = await BlockedDate.findAll({
      attributes: ['date']
    });
    const blockedDates = blockedDatesData.map(b => b.date);

    // Format them for the calendar
    // Detect conflicts (same date, same time, different requests)
    const formatted = [];
    const timeMap = {};

    appointments.forEach(a => {
      const key = `${a.appointmentDate}-${a.appointmentTime}`;
      if (!timeMap[key]) timeMap[key] = [];
      timeMap[key].push(a);
    });

    appointments.forEach(a => {
      const key = `${a.appointmentDate}-${a.appointmentTime}`;
      // Conflict exists if > 1 request at the exact same time, AND it's not manually marked as resolved
      const conflict = timeMap[key].length > 1 && !a.conflictResolved;

      formatted.push({
        id: a.id,
        date: a.appointmentDate,
        time: a.appointmentTime ? a.appointmentTime.substring(0,5) : '12:00',
        type: a.certificateType,
        fullName: a.fullName,
        purpose: a.purpose,
        notes: a.notes,
        contactNumber: a.contactNumber,
        source: a.source === 'kiosk' ? 'Kiosk' : 'Web',
        conflict,
        status: a.status,
        conflictResolved: a.conflictResolved
      });
    });

    res.json({ appointments: formatted, blockedDates });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/calendar/block
const toggleBlockDate = async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required.' });

    const existing = await BlockedDate.findOne({ where: { date } });
    if (existing) {
      await existing.destroy();
      res.json({ message: 'Date unblocked successfully.', blocked: false, date });
    } else {
      await BlockedDate.create({ date });
      res.json({ message: 'Date blocked successfully.', blocked: true, date });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/calendar/resolve
const resolveConflicts = async (req, res, next) => {
  try {
    const { ids, resolve } = req.body; // resolve is boolean
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'An array of request IDs is required.' });
    }

    await SacramentalRequest.update(
      { conflictResolved: resolve },
      { where: { id: { [Op.in]: ids } } }
    );

    res.json({ message: `Conflicts ${resolve ? 'resolved' : 'unresolved'} successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRequests, updateRequestStatus, updatePaymentStatus, deleteRequest, getAllUsers, getStats, getReports, getCalendarAppointments, toggleBlockDate, resolveConflicts };
