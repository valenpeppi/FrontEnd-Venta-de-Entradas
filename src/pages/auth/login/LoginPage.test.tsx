import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';

// Mock dependencies
vi.mock('@/services/AuthService', () => ({
    AuthService: {
        login: vi.fn(),
        googleLogin: vi.fn(),
    },
}));

vi.mock('@/shared/context/MessageContext', () => ({
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
    };
});

describe('🔐 Componente LoginPage', () => {
    const mockOnLoginSuccess = vi.fn();
    const mockLogin = vi.mocked(AuthService.login);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza el formulario de login', () => {
        render(
            <MemoryRouter>
                <LoginPage onLoginSuccess={mockOnLoginSuccess} />
            </MemoryRouter>
        );
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    });

    it('bloquea envío si el email es inválido', async () => {
        render(
            <MemoryRouter>
                <LoginPage onLoginSuccess={mockOnLoginSuccess} />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText('Email');
        const submitBtn = screen.getByRole('button', { name: 'Iniciar Sesión' });

        fireEvent.change(emailInput, { target: { value: 'bad-email' } });
        fireEvent.click(submitBtn);

        // Expect validation logic to prevent service call
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('llama al servicio de login con credenciales correctas', async () => {
        mockLogin.mockResolvedValueOnce({
            token: 'fake-token',
            user: { id: 1, role: 'user', name: 'Test User', mail: 'test@example.com' }
        });

        render(
            <MemoryRouter>
                <LoginPage onLoginSuccess={mockOnLoginSuccess} />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } });

        const form = screen.getByRole('button', { name: 'Iniciar Sesión' }).closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: '123456'
            });
            expect(mockOnLoginSuccess).toHaveBeenCalled();
        });
    });
});
