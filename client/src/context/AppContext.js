// Step 1: Create a context file (src/context/AppContext.js)
import React, { createContext, useContext } from 'react';

// Create the context
export const AppContext = createContext(null);

// Create a provider component
export const AppContextProvider = ({ children }) => {
  // Add any shared state or functions here
  const contextValue = {
    // Your shared state/functions will go here
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined || context === null) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};