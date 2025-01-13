import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';

export function renderWithProviders(ui: ReactNode) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
}

// Helper to create a wrapper for testing hooks
export function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  };
}
