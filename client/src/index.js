import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppContextProvider } from './context/AppContext'; // Import the new context provider

const theme = createTheme(); // You can customize this if you want

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