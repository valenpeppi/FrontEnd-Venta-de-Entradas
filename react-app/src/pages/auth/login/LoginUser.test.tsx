import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './LoginUser';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService';

// Mock AuthService
vi.mock('../../services/AuthService', () => ({
  AuthService: {
    login: vi.fn(),
  },
}));

// Mock MessageContext
vi.mock('../../shared/context/MessageContext', () => ({
  useMessage: () => ({
    messages: [],
    clearMessages: vi.fn(),
  }),
}));

// Mock Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    MemoryRouter: actual.MemoryRouter,
  };
});

describe('🔐 Componente LoginUser', () => {
  const mockOnLoginSuccess = vi.fn();
  const mockLogin = vi.mocked(AuthService.login);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('muestra errores de validación si los campos están vacíos al enviar', async () => {
    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(
      await screen.findByText(/Por favor, corrige los errores antes de continuar/i)
    ).toBeInTheDocument();
  });

  it('valida formato de email incorrecto', async () => {
    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'correo_invalido' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Email inválido/i)).toBeInTheDocument();
  });

  it('realiza login exitoso y llama a onLoginSuccess', async () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Agus', role: 'user', mail: 'test@example.com' },
    };
    mockLogin.mockResolvedValueOnce(mockResponse);

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        mail: 'test@example.com',
        password: '123456',
      });
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(
        mockResponse.user,
        mockResponse.token
      );
    });

    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(localStorage.getItem('user')).toContain('Agus');
  });

  it('muestra mensaje de error si el servidor devuelve error', async () => {
    const fakeError = {
      response: { data: { message: 'Credenciales incorrectas.' } },
    };
    mockLogin.mockRejectedValueOnce(fakeError);

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(
      await screen.findByText(/Credenciales incorrectas/i)
    ).toBeInTheDocument();

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  it('muestra mensaje de error genérico si falla sin respuesta', async () => {
    const networkError = new Error('Network Error');
    mockLogin.mockRejectedValueOnce(networkError);

    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(
      await screen.findByText((content) =>
        /Error de red o del servidor/i.test(content) || /Network Error/i.test(content)
      )
    ).toBeInTheDocument();

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
});


