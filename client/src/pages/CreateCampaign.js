import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { campaignAPI, segmentAPI } from '../services/api';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  subject: Yup.string().required('Subject is required'),
  content: Yup.string().required('Content is required'),
  segmentId: Yup.string().required('Segment is required'),
  sendTime: Yup.date().min(new Date(), 'Send time must be in the future'),
});

function CreateCampaign() {
  const navigate = useNavigate();

  const { data: segments, isLoading: isLoadingSegments } = useQuery(
    'segments',
    () => segmentAPI.getSegments({ limit: 100 })
  );

  const createMutation = useMutation(
    (values) => campaignAPI.createCampaign(values),
    {
      onSuccess: () => {
        navigate('/campaigns');
      }
    }
  );

  const formik = useFormik({
    initialValues: {
      name: '',
      subject: '',
      content: '',
      segmentId: '',
      sendTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // Default to 1 hour from now
    },
    validationSchema,
    onSubmit: (values) => {
      createMutation.mutate(values);
    }
  });

  if (isLoadingSegments) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Create Campaign</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {createMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error creating campaign. Please try again.
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Campaign Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Segment</InputLabel>
                <Select
                  name="segmentId"
                  value={formik.values.segmentId}
                  onChange={formik.handleChange}
                  error={formik.touched.segmentId && Boolean(formik.errors.segmentId)}
                  label="Target Segment"
                >
                  {segments?.data?.segments.map((segment) => (
                    <MenuItem key={segment._id} value={segment._id}>
                      {segment.name} ({segment.customerCount} customers)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="subject"
                label="Email Subject"
                value={formik.values.subject}
                onChange={formik.handleChange}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                name="content"
                label="Email Content"
                value={formik.values.content}
                onChange={formik.handleChange}
                error={formik.touched.content && Boolean(formik.errors.content)}
                helperText={formik.touched.content && formik.errors.content}
                placeholder="You can use {{name}}, {{email}}, and other customer fields in your content"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                name="sendTime"
                label="Send Time"
                value={formik.values.sendTime}
                onChange={formik.handleChange}
                error={formik.touched.sendTime && Boolean(formik.errors.sendTime)}
                helperText={formik.touched.sendTime && formik.errors.sendTime}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/campaigns')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isLoading}
                >
                  {createMutation.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Create Campaign'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateCampaign; 