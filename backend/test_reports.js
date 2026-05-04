const { SacramentalRequest, Document, User, AuditLog, BlockedDate } = require('./models');
const { Op } = require('sequelize');
const sequelize = require('./config/db');

async function testAll() {
  try {
    const targetYear = '2026';
    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${parseInt(targetYear) + 1}-01-01T00:00:00Z`);

    // 1
    const volumeData = await SacramentalRequest.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt'))), 'monthNum'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'value']
      ],
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '<', endDate)
        ]
      },
      group: ['monthNum'],
      order: [[sequelize.literal('monthNum'), 'ASC']]
    });

    // 2
    const approvedRequests = await SacramentalRequest.findAll({
      where: { 
        status: { [Op.in]: ['Approved', 'Released'] },
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '<', endDate)
        ]
      },
      order: [['updatedAt', 'DESC']],
      limit: 10
    });

    const allApproved = await SacramentalRequest.findAll({ 
      where: { 
        status: { [Op.in]: ['Approved', 'Released'] },
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '<', endDate)
        ]
      } 
    });

    // 3
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // 4
    const allRequests = await SacramentalRequest.findAll({
      attributes: ['id', 'fullName', 'certificateType', 'purpose', 'status', 'source', 'appointmentDate', 'createdAt', 'paymentStatus', 'amountDue'],
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '<', endDate)
        ]
      },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 500,
    });

    // 5
    const typeBreakdown = await SacramentalRequest.findAll({
      attributes: [
        'certificateType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '>=', startDate),
          sequelize.where(sequelize.fn('COALESCE', sequelize.col('appointmentDate'), sequelize.col('createdAt')), '<', endDate)
        ]
      },
      group: ['certificateType'],
    });

    console.log('Success! No errors thrown.');
  } catch (err) {
    console.error('ERROR THROWN:', err);
  } finally {
    process.exit();
  }
}

testAll();
