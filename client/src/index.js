import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppContextProvider } from './context/AppContext'; // Import the new context provider

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
const queryClient = new QueryClient();
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider> {/* Add the AppContextProvider here */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppContextProvider>
      </QueryClientProvider>
    </Provider>
  </ThemeProvider>
);