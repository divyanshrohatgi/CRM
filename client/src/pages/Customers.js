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
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Block as BlockIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { customerAPI, segmentAPI } from '../services/api';

const columnsBase = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => {
      const status = (params.value || '').toString().trim().toLowerCase();
      let label = 'Unknown';
      let color = 'default';
      let icon = <BlockIcon fontSize="small" />;
      if (status === 'active') {
        label = 'Active';
        color = 'success';
        icon = <CheckCircleIcon fontSize="small" />;
      } else if (status === 'lead') {
        label = 'Lead';
        color = 'info';
        icon = <StarIcon fontSize="small" />;
      } else if (status === 'inactive') {
        label = 'Inactive';
        color = 'default';
        icon = <BlockIcon fontSize="small" />;
      }
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={label}
            color={color}
            size="small"
            variant="outlined"
            icon={icon}
          />
        </Box>
      );
    },
  },
  {
    field: 'segments',
    headerName: 'Segments',
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {params.row.segments?.map((segment, index) => (
          <Chip
            key={index}
            label={segment.name}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    ),
  },
  {
    field: 'lastActivity',
    headerName: 'Last Activity',
    width: 180,
    valueGetter: (params) => new Date(params.row.lastActivity).toLocaleDateString(),
  },
];

function Customers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    status: 'Active',
    segments: [],
    lastActivity: new Date().toISOString(),
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [segments, setSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerAPI.getCustomers();
      const data = (res.data.customers || res.data.data || res.data).map((c, idx) => ({
        id: c._id || idx + 1,
        ...c,
      }));
      setRows(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
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
    fetchCustomers();
    fetchSegments();
  }, []);

  const handleOpenDialog = (mode, customer = null) => {
    setDialogMode(mode);
    setSelectedCustomer(customer);
    setForm(
      customer
        ? {
            name: customer.name,
            email: customer.email,
            status: customer.status || 'Active',
            segments: customer.segments || [],
            lastActivity: customer.lastActivity || new Date().toISOString(),
          }
        : {
            name: '',
            email: '',
            status: 'Active',
            segments: [],
            lastActivity: new Date().toISOString(),
          }
    );
    setSelectedSegments(customer?.segments?.map((s) => s.id) || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setForm({
      name: '',
      email: '',
      status: 'Active',
      segments: [],
      lastActivity: new Date().toISOString(),
    });
    setSelectedSegments([]);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSegmentChange = (event) => {
    const value = event.target.value;
    setSelectedSegments(value);
    setForm({
      ...form,
      segments: segments.filter((s) => value.includes(s.id)),
    });
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
        ...form,
        status: form.status || 'Active',
        segments: form.segments || [],
        lastActivity: form.lastActivity || new Date().toISOString(),
      };

      if (dialogMode === 'add') {
        await customerAPI.createCustomer(payload);
        setSnackbar({ open: true, message: 'Customer added successfully!', severity: 'success' });
      } else {
        await customerAPI.updateCustomer(selectedCustomer._id, payload);
        setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
      }
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Operation failed',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerAPI.deleteCustomer(customer._id);
      setSnackbar({ open: true, message: 'Customer deleted!', severity: 'success' });
      fetchCustomers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Delete failed',
        severity: 'error',
      });
    }
  };

  const handleBulkImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await customerAPI.bulkCreateCustomers(formData);
      setSnackbar({ open: true, message: 'Customers imported successfully!', severity: 'success' });
      fetchCustomers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Import failed',
        severity: 'error',
      });
    }
  };

  const handleRestore = async (customer) => {
    try {
      await customerAPI.updateCustomer(customer._id, { status: 'Active' });
      setSnackbar({ open: true, message: 'Customer restored!', severity: 'success' });
      fetchCustomers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Restore failed',
        severity: 'error',
      });
    }
  };

  const columns = [
    ...columnsBase,
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog('edit', params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          {params.row.status === 'Inactive' ? (
            <Tooltip title="Restore">
              <IconButton onClick={() => handleRestore(params.row)} size="small" color="success">
                <RestoreIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="More actions">
              <IconButton onClick={(e) => handleMenuOpen(e, params.row)} size="small">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Customers</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            component="label"
          >
            Import
            <input
              type="file"
              hidden
              accept=".csv,.xlsx"
              onChange={handleBulkImport}
            />
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowInactive((prev) => !prev)}
          >
            {showInactive ? 'Show Active' : 'Show Inactive'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Customer
          </Button>
        </Box>
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
            rows={rows.filter(row => showInactive ? row.status === 'Inactive' : row.status !== 'Inactive')}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            error={error}
            sx={{ 
              height: 400, 
              width: '100%',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                backgroundColor: '#f8fafc',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f1f5f9',
                borderBottom: '2px solid #e0e0e0',
              },
              '& .MuiDataGrid-columnHeader': {
                fontWeight: 600,
              },
            }}
          />
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add Customer' : 'Edit Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                fullWidth
                required
                type="email"
                variant="outlined"
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
                  variant="outlined"
                >
                  <MenuItem value="Active">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography>Active</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Lead">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon color="info" fontSize="small" />
                      <Typography>Lead</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Inactive">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BlockIcon color="action" fontSize="small" />
                      <Typography>Inactive</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Activity"
                name="lastActivity"
                type="date"
                value={form.lastActivity.split('T')[0]}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Segments</InputLabel>
                <Select
                  multiple
                  value={selectedSegments}
                  onChange={handleSegmentChange}
                  label="Segments"
                  variant="outlined"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={segments.find((s) => s.id === value)?.name}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {segments.map((segment) => (
                    <MenuItem key={segment.id} value={segment.id}>
                      {segment.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 180,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        <MenuItem onClick={() => {
          handleOpenDialog('edit', selectedRow);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(selectedRow);
          handleMenuClose();
        }} sx={{ color: '#d32f2f' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete
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

export default Customers; 