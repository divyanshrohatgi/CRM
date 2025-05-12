import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { campaignAPI } from '../services/api';

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'draft':
      return 'default';
    case 'paused':
      return 'warning';
    case 'completed':
      return 'info';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
}

function StatCard({ title, value, icon, color }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: campaign, isLoading } = useQuery(
    ['campaign', id],
    () => campaignAPI.getCampaign(id)
  );

  const { data: stats, isLoading: isLoadingStats } = useQuery(
    ['campaignStats', id],
    () => campaignAPI.getCampaignStats(id)
  );

  if (isLoading || isLoadingStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const deliveryRate = Math.round((stats?.data?.delivered / stats?.data?.sent) * 100 || 0);
  const bounceRate = Math.round((stats?.data?.bounced / stats?.data?.sent) * 100 || 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </Button>
        <Typography variant="h4">Campaign Details</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">{campaign?.data?.name}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {campaign?.data?.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Chip
              label={campaign?.data?.status}
              color={getStatusColor(campaign?.data?.status)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Recipients"
            value={stats?.data?.total || 0}
            icon={<ScheduleIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Messages Sent"
            value={stats?.data?.sent || 0}
            icon={<CheckCircleIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Delivered"
            value={stats?.data?.delivered || 0}
            icon={<CheckCircleIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Failed"
            value={stats?.data?.failed || 0}
            icon={<ErrorIcon sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Performance
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Delivery Rate</Typography>
                <Typography variant="body2">{deliveryRate}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={deliveryRate}
                color="success"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Bounce Rate</Typography>
                <Typography variant="body2">{bounceRate}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={bounceRate}
                color="error"
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Delivery Logs
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.data?.recentLogs?.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{log.customer.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          color={log.status === 'delivered' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CampaignDetails; 