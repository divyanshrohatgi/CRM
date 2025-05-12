import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  FilterList as FilterListIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Save as SaveIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { segmentAPI } from '../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
];

const LOGIC_OPERATORS = [
  { value: 'AND', label: 'All conditions must match (AND)' },
  { value: 'OR', label: 'Any condition can match (OR)' },
];

const FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'status', label: 'Status' },
  { value: 'lastActivity', label: 'Last Activity' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'customField1', label: 'Custom Field 1' },
  { value: 'customField2', label: 'Custom Field 2' },
];

const columnsBase = [
  { field: 'name', headerName: 'Segment Name', width: 200 },
  { field: 'description', headerName: 'Description', width: 300 },
  {
    field: 'rules',
    headerName: 'Rules',
    width: 300,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {params.row.rules?.map((rule, index) => (
          <Chip
            key={index}
            size="small"
            label={`${rule.field} ${rule.operator} ${rule.value}`}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    ),
  },
  {
    field: 'customerCount',
    headerName: 'Customers',
    width: 120,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleIcon fontSize="small" />
        <Typography>{params.row.customerCount || 0}</Typography>
      </Box>
    ),
  },
];

function Segments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    rules: [{ field: '', operator: '', value: '', groupId: 'group-1' }],
    ruleLogic: 'AND',
    groups: [{ id: 'group-1', logic: 'AND' }],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchSegments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await segmentAPI.getSegments();
      const data = (res.data.segments || res.data.data || res.data).map((s, idx) => ({
        id: s._id || idx + 1,
        ...s,
      }));
      setRows(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleOpenDialog = (mode, segment = null) => {
    setDialogMode(mode);
    setSelectedSegment(segment);
    setForm(
      segment
        ? {
            name: segment.name,
            description: segment.description,
            rules: segment.rules || [{ field: '', operator: '', value: '', groupId: 'group-1' }],
            ruleLogic: segment.ruleLogic || 'AND',
            groups: segment.groups || [{ id: 'group-1', logic: 'AND' }],
          }
        : {
            name: '',
            description: '',
            rules: [{ field: '', operator: '', value: '', groupId: 'group-1' }],
            ruleLogic: 'AND',
            groups: [{ id: 'group-1', logic: 'AND' }],
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSegment(null);
    setForm({
      name: '',
      description: '',
      rules: [{ field: '', operator: '', value: '', groupId: 'group-1' }],
      ruleLogic: 'AND',
      groups: [{ id: 'group-1', logic: 'AND' }],
    });
    setPreviewData(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...form.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setForm({ ...form, rules: newRules });
  };

  const addRule = (groupId) => {
    setForm({
      ...form,
      rules: [...form.rules, { field: '', operator: '', value: '', groupId }],
    });
  };

  const removeRule = (index) => {
    const newRules = form.rules.filter((_, i) => i !== index);
    setForm({ ...form, rules: newRules });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(form.rules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setForm({ ...form, rules: items });
  };

  const addGroup = () => {
    const groupId = `group-${form.groups.length + 1}`;
    setForm({
      ...form,
      groups: [...form.groups, { id: groupId, logic: 'AND' }],
      rules: [...form.rules, { field: '', operator: '', value: '', groupId }],
    });
  };

  const removeGroup = (groupId) => {
    setForm({
      ...form,
      groups: form.groups.filter(g => g.id !== groupId),
      rules: form.rules.filter(r => r.groupId !== groupId),
    });
  };

  const handleGroupLogicChange = (groupId, logic) => {
    setForm({
      ...form,
      groups: form.groups.map(g => g.id === groupId ? { ...g, logic } : g),
    });
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await segmentAPI.previewSegment({ rules: form.rules, ruleLogic: form.ruleLogic });
      setPreviewData(res.data);
      setPreviewDialogOpen(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to preview segment',
        severity: 'error',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        const response = await segmentAPI.createSegment({ ...form, rules: form.rules });
        setSnackbar({ open: true, message: 'Segment created!', severity: 'success' });
        handleCloseDialog();
        fetchSegments();
        navigate(`/segments/${response.data.data._id}`);
      } else {
        await segmentAPI.updateSegment(selectedSegment._id, { ...form, rules: form.rules });
        setSnackbar({ open: true, message: 'Segment updated!', severity: 'success' });
        handleCloseDialog();
        fetchSegments();
        navigate(`/segments/${selectedSegment._id}`);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Operation failed',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (segment) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;
    try {
      await segmentAPI.deleteSegment(segment._id);
      setSnackbar({ open: true, message: 'Segment deleted!', severity: 'success' });
      fetchSegments();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Delete failed',
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
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog('edit', params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row)} size="small" color="error">
              <DeleteIcon />
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
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Segments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Create Segment
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
          {dialogMode === 'add' ? 'Create Segment' : 'Edit Segment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Segment Name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Segment Rules
                </Typography>
                <DragDropContext onDragEnd={handleDragEnd}>
                  {form.groups.map((group) => (
                    <Paper key={group.id} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Group Logic</InputLabel>
                          <Select
                            value={group.logic}
                            onChange={(e) => handleGroupLogicChange(group.id, e.target.value)}
                            label="Group Logic"
                          >
                            {LOGIC_OPERATORS.map((op) => (
                              <MenuItem key={op.value} value={op.value}>
                                {op.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {form.groups.length > 1 && (
                          <IconButton
                            color="error"
                            onClick={() => removeGroup(group.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Droppable droppableId={group.id}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef}>
                            {form.rules
                              .filter((rule) => rule.groupId === group.id)
                              .map((rule, index) => (
                                <Draggable
                                  key={`${group.id}-${index}`}
                                  draggableId={`${group.id}-${index}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Paper
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{ p: 2, mb: 2 }}
                                    >
                                      <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={1}>
                                          <div {...provided.dragHandleProps}>
                                            <DragIndicatorIcon />
                                          </div>
                                        </Grid>
                                        <Grid item xs={11}>
                                          <Grid container spacing={2}>
                                            <Grid item xs={12} md={3}>
                                              <FormControl fullWidth size="small">
                                                <InputLabel>Field</InputLabel>
                                                <Select
                                                  value={rule.field}
                                                  onChange={(e) =>
                                                    handleRuleChange(index, 'field', e.target.value)
                                                  }
                                                  label="Field"
                                                >
                                                  {FIELDS.map((field) => (
                                                    <MenuItem key={field.value} value={field.value}>
                                                      {field.label}
                                                    </MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                              <FormControl fullWidth size="small">
                                                <InputLabel>Operator</InputLabel>
                                                <Select
                                                  value={rule.operator}
                                                  onChange={(e) =>
                                                    handleRuleChange(index, 'operator', e.target.value)
                                                  }
                                                  label="Operator"
                                                >
                                                  {OPERATORS.map((op) => (
                                                    <MenuItem key={op.value} value={op.value}>
                                                      {op.label}
                                                    </MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                              <TextField
                                                label="Value"
                                                value={rule.value}
                                                onChange={(e) =>
                                                  handleRuleChange(index, 'value', e.target.value)
                                                }
                                                fullWidth
                                                size="small"
                                              />
                                            </Grid>
                                            <Grid item xs={12} md={1}>
                                              <IconButton
                                                color="error"
                                                onClick={() => removeRule(index)}
                                                disabled={form.rules.length === 1}
                                              >
                                                <RemoveCircleIcon />
                                              </IconButton>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Paper>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <Button
                        startIcon={<AddCircleIcon />}
                        onClick={() => addRule(group.id)}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Add Rule to Group
                      </Button>
                    </Paper>
                  ))}
                </DragDropContext>
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={addGroup}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Add Rule Group
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handlePreview} disabled={previewLoading}>
            {previewLoading ? <CircularProgress size={24} /> : 'Preview'}
          </Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />}>
            {dialogMode === 'add' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Segment Preview</DialogTitle>
        <DialogContent>
          {previewData ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Matching Customers: {previewData.total || 0}
              </Typography>
              <List>
                {previewData.customers?.map((customer) => (
                  <ListItem key={customer._id}>
                    <ListItemText
                      primary={customer.name}
                      secondary={customer.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Typography>No preview data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default Segments; 