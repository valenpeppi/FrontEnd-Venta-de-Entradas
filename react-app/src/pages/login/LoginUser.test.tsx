import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './LoginUser';
import '@testing-library/jest-dom';
import axios, { AxiosError } from 'axios';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('axios');
vi.mock('../../shared/context/MessageContext', () => ({
  useMessage: () => ({
    messages: [],
    clearMessages: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    MemoryRouter: actual.MemoryRouter,
  };
});

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
};

describe('🔐 Componente LoginUser', () => {
  const mockOnLoginSuccess = vi.fn();

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
      data: {
        token: 'fake-jwt-token',
        user: { id: 1, name: 'Agus', role: 'user' },
      },
    };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

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
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(
        mockResponse.data.user,
        mockResponse.data.token
      );
    });

    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(localStorage.getItem('user')).toContain('Agus');
  });

  
  it('muestra mensaje de error si el servidor devuelve 401', async () => {
    const fakeError = {
      isAxiosError: true,
      response: { data: { message: 'Credenciales incorrectas.' } },
    } as AxiosError;

    mockedAxios.post.mockRejectedValueOnce(fakeError);

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

  
  it('muestra mensaje de error genérico si no hay respuesta del servidor', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.post.mockRejectedValueOnce(networkError);

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


  
  it('muestra error si falta uno de los campos requeridos', async () => {
    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(
      await screen.findByText(/Por favor, corrige los errores antes de continuar/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(
      await screen.findByText(/Por favor, corrige los errores antes de continuar/i)
    ).toBeInTheDocument();
  });

  
  it('muestra íconos de validación correctos al completar los campos', async () => {
    render(
      <MemoryRouter>
        <Login onLoginSuccess={mockOnLoginSuccess} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(emailInput, { target: { value: 'correo_invalido' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/Email inválido/i)).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'user@mail.com' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText(/Email inválido/i)).toBeNull();
    });

    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(passwordInput).toHaveValue('123456');
    });
  });
});
