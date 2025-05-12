const express = require('express');
const Customer = require('../models/customer.model');
const Campaign = require('../models/campaign.model');
const Segment = require('../models/segment.model');
const CommunicationLog = require('../models/communication-log.model');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [totalCustomers, totalSegments, activeCampaigns, recentCampaigns] = await Promise.all([
      Customer.countDocuments(),
      Segment.countDocuments(),
      Campaign.countDocuments({ status: { $in: ['running', 'scheduled'] } }),
      Campaign.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Example: Calculate engagement, open, click, conversion rates from CommunicationLog (dummy logic)
    const totalLogs = await CommunicationLog.countDocuments();
    const sentLogs = await CommunicationLog.countDocuments({ status: 'sent' });
    const deliveredLogs = await CommunicationLog.countDocuments({ status: 'delivered' });
    const failedLogs = await CommunicationLog.countDocuments({ status: 'failed' });
    const openRate = totalLogs ? Math.round((deliveredLogs / totalLogs) * 100) : 0;
    const clickRate = 0; // Add real logic if you track clicks
    const conversionRate = 0; // Add real logic if you track conversions
    const engagementRate = openRate; // For now, use openRate as engagement

    const recentActivity = recentCampaigns.map(c => ({
      timestamp: c.createdAt,
      description: `Campaign "${c.name}" created.`
    }));

    res.json({
      data: {
        totalCustomers,
        activeCampaigns,
        totalSegments,
        engagementRate,
        openRate,
        clickRate,
        conversionRate,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router; 