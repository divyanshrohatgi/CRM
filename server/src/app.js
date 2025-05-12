const communicationRoutes = require('./routes/communication.routes');
const aiRoutes = require('./routes/ai.routes');

// Routes
app.use('/api/segments', segmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/ai', aiRoutes); 