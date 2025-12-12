import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from './ForgotPasswordPage';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';

// Mock AuthService
vi.mock('@/services/AuthService', () => ({
    AuthService: {
        forgotPassword: vi.fn(),
    },
}));

// Mock MessageContext
vi.mock('@/shared/context/MessageContext', () => ({
    useMessage: () => ({
        addMessage: vi.fn(),
    }),
}));

describe('🔐 Componente ForgotPasswordPage', () => {
    const mockForgotPassword = vi.mocked(AuthService.forgotPassword);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza correctamente el formulario', () => {
        render(
            <MemoryRouter>
                <ForgotPasswordPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Recuperar Contraseña/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enviar enlace/i })).toBeInTheDocument();
    });

    it('muestra error si el email no es válido', async () => {
        render(
            <MemoryRouter>
                <ForgotPasswordPage />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/Email/i);
        fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

        const form = screen.getByRole('button', { name: /Enviar enlace/i }).closest('form');
        fireEvent.submit(form!);

        expect(await screen.findByText(/Formato de email inválido/i)).toBeInTheDocument();
        expect(mockForgotPassword).not.toHaveBeenCalled();
    });

    it('llama a AuthService.forgotPassword y muestra éxito', async () => {
        mockForgotPassword.mockResolvedValueOnce({ message: 'Enlace enviado' });

        render(
            <MemoryRouter>
                <ForgotPasswordPage />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/Email/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const form = screen.getByRole('button', { name: /Enviar enlace/i }).closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
        });

        expect(await screen.findByText(/Si el correo está registrado, recibirás un enlace/i)).toBeInTheDocument();
    });
});
