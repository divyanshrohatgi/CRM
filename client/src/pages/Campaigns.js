import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  LinearProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ContentCopy as CopyIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { campaignAPI, segmentAPI } from '../services/api';

const columnsBase = [
  { field: 'name', headerName: 'Campaign Name', width: 200 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => (
      <Chip
        label={
          params.value === 'running' ? 'Active' :
          params.value === 'paused' ? 'Paused' :
          params.value.charAt(0).toUpperCase() + params.value.slice(1)
        }
        color={
          params.value === 'running' ? 'success' :
          params.value === 'draft' ? 'default' :
          params.value === 'paused' ? 'warning' :
          'error'
        }
        size="small"
        variant="outlined"
      />
    ),
  },
  { 
    field: 'segment', 
    headerName: 'Target Segment', 
    width: 200,
    valueGetter: (params) => params.row.segment?.name || 'N/A'
  },
  {
    field: 'progress',
    headerName: 'Progress',
    width: 200,
    renderCell: (params) => (
      <Box sx={{ width: '100%' }}>
        <LinearProgress 
          variant="determinate" 
          value={params.row.progress || 0} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary">
          {params.row.sent || 0} / {params.row.total || 0}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'stats',
    headerName: 'Performance',
    width: 200,
    renderCell: (params) => (
      <Box>
        <Typography variant="caption" display="block">
          Open Rate: {params.row.openRate || 0}%
        </Typography>
        <Typography variant="caption" display="block">
          Click Rate: {params.row.clickRate || 0}%
        </Typography>
      </Box>
    ),
  },
];

function Campaigns() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [form, setForm] = useState({
    name: '',
    status: 'Draft',
    segmentId: '',
    message: '',
    scheduleTime: null,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [segments, setSegments] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await campaignAPI.getCampaigns();
      const data = (res.data.campaigns || res.data.data || res.data).map((c, idx) => ({
        id: c._id || idx + 1,
        ...c,
      }));
      setRows(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const res = await segmentAPI.getSegments();
      const data = (res.data.segments || res.data.data || res.data).map((s) => ({
        id: s._id,
        name: s.name,
      }));
      setSegments(data);
    } catch (err) {
      console.error('Failed to fetch segments:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
  }, []);

  const handleOpenDialog = (mode, campaign = null) => {
    setDialogMode(mode);
    setSelectedCampaign(campaign);
    setForm(
      campaign
        ? {
            name: campaign.name,
            status: campaign.status,
            segmentId: campaign.segment?._id || '',
            message: campaign.message || '',
            scheduleTime: campaign.scheduleTime || null,
          }
        : {
            name: '',
            status: 'Draft',
            segmentId: '',
            message: '',
            scheduleTime: null,
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCampaign(null);
    setForm({
      name: '',
      status: 'Draft',
      segmentId: '',
      message: '',
      scheduleTime: null,
    });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMenuOpen = (event, row) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        status: form.status,
        segmentId: form.segmentId,
        message: form.message,
        scheduleTime: form.scheduleTime,
      };
      if (dialogMode === 'add') {
        await campaignAPI.createCampaign(payload);
        setSnackbar({ open: true, message: 'Campaign created!', severity: 'success' });
      } else {
        await campaignAPI.updateCampaign(selectedCampaign._id, payload);
        setSnackbar({ open: true, message: 'Campaign updated!', severity: 'success' });
      }
      handleCloseDialog();
      fetchCampaigns();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Operation failed',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await campaignAPI.deleteCampaign(campaign._id);
      setSnackbar({ open: true, message: 'Campaign deleted!', severity: 'success' });
      fetchCampaigns();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Delete failed',
        severity: 'error',
      });
    }
  };

  const handleStatusChange = async (campaign, newStatus) => {
    try {
      await campaignAPI.updateCampaign(campaign._id, { status: newStatus });
      setSnackbar({ open: true, message: `Campaign ${newStatus.toLowerCase()}!`, severity: 'success' });
      fetchCampaigns();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Status update failed',
        severity: 'error',
      });
    }
  };

  const handleDuplicate = async (campaign) => {
    try {
      const { _id, ...campaignData } = campaign;
      await campaignAPI.createCampaign({
        ...campaignData,
        name: `${campaignData.name} (Copy)`,
        status: 'Draft',
      });
      setSnackbar({ open: true, message: 'Campaign duplicated!', severity: 'success' });
      fetchCampaigns();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Duplication failed',
        severity: 'error',
      });
    }
  };

  const columns = [
    ...columnsBase,
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <Tooltip title="More options">
            <IconButton onClick={(e) => handleMenuOpen(e, params.row)} size="small">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Campaigns</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Create Campaign
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Create Campaign' : 'Edit Campaign'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Campaign Name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="running">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Target Segment</InputLabel>
                <Select
                  name="segmentId"
                  value={form.segmentId}
                  onChange={handleFormChange}
                  label="Target Segment"
                >
                  {segments.map((segment) => (
                    <MenuItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Campaign Message"
                name="message"
                value={form.message}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Schedule (Optional)"
                name="scheduleTime"
                type="datetime-local"
                value={form.scheduleTime || ''}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          handleOpenDialog('edit', selectedRow);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          handleStatusChange(selectedRow, 'running');
        }}>
          <PlayIcon fontSize="small" sx={{ mr: 1 }} /> Activate
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          handleStatusChange(selectedRow, 'paused');
        }}>
          <StopIcon fontSize="small" sx={{ mr: 1 }} /> Pause
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          handleDuplicate(selectedRow);
        }}>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleMenuClose();
          handleDelete(selectedRow);
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

export default Campaigns; 