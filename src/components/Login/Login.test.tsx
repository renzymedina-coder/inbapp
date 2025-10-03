import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';
import { mockAuth } from '../../__mocks__/firebase';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('shows error message with invalid credentials', async () => {
    mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  test('redirects to dashboard on successful login', async () => {
    mockAuth.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: '123', email: 'test@example.com' }
    });

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'correctpassword');
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});