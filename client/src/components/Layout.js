import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  IconButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SegmentIcon from '@mui/icons-material/Segment';
import CampaignIcon from '@mui/icons-material/Campaign';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 260;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Segments', icon: <SegmentIcon />, path: '/segments' },
  { text: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns' },
];

function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <Toolbar 
          sx={{ 
            justifyContent: collapsed ? 'center' : 'space-between', 
            background: 'linear-gradient(45deg, #3f51b5 30%, #002984 90%)',
            color: 'white',
            minHeight: '80px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            px: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="/logo.png" alt="CRM Logo" style={{ height: 40 }} />
            {!collapsed && (
              <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 600 }}>
                CRM
              </Typography>
            )}
          </Box>
          <IconButton onClick={() => setCollapsed((prev) => !prev)} sx={{ color: 'white', ml: 1 }}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemIcon sx={{ 
                color: 'inherit',
                minWidth: collapsed ? 'unset' : '40px',
                justifyContent: 'center',
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: location.pathname.startsWith(item.path) ? 700 : 400
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </div>
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ bgcolor: '#3f51b5', color: 'white', width: 36, height: 36, fontWeight: 600 }}>
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </Avatar>
        {!collapsed && (
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{user?.name || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      bgcolor: '#f8fafc',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(45deg, #3f51b5 30%, #002984 90%)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: '70px' }}>
          {isMobile && (
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={handleDrawerToggle} 
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            CRM Software
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={handleAvatarClick}
            sx={{
              '&:hover': {
                bgcolor: alpha('#fff', 0.1)
              }
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#fff', 
                color: '#3f51b5',
                width: 36,
                height: 36,
                fontWeight: 600
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 2,
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                }
              }
            }}
          >
            <MenuItem disabled sx={{ opacity: 0.8 }}>
              {user?.name || 'User'}
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                color: '#d32f2f',
                '&:hover': {
                  bgcolor: alpha('#d32f2f', 0.08)
                }
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: collapsed ? 80 : drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              transition: 'width 0.2s',
              overflowX: 'hidden',
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e3eafc 100%)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          minHeight: '100vh',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Toolbar sx={{ minHeight: '70px' }} />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout; 