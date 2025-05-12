import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Category as CategoryIcon,
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { dashboardAPI } from '../services/api';

function MetricCard({ title, value, icon, color, subtitle }) {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box
        sx={{
          backgroundColor: `${color}20`,
          borderRadius: '50%',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
      </Box>
      <Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function Dashboard() {
  const theme = useTheme();

  const { data: stats, isLoading, error } = useQuery('dashboardStats', async () => {
    const response = await dashboardAPI.getStats();
    return response.data.data;
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load dashboard data. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            subtitle="Active users in your CRM"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={<CampaignIcon />}
            color={theme.palette.success.main}
            subtitle="Currently running campaigns"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Segments"
            value={stats?.totalSegments || 0}
            icon={<CategoryIcon />}
            color={theme.palette.info.main}
            subtitle="Customer segments created"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Engagement Rate"
            value={`${stats?.engagementRate || 0}%`}
            icon={<TrendingUpIcon />}
            color={theme.palette.warning.main}
            subtitle="Average campaign engagement"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Campaign Performance</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Open Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.openRate || 0} 
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Click Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.clickRate || 0} 
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Conversion Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stats?.conversionRate || 0} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <Box sx={{ mt: 2 }}>
                {stats?.recentActivity?.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {activity.timestamp}
                    </Typography>
                    <Typography variant="body1">
                      {activity.description}
                    </Typography>
                  </Box>
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity to display
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 