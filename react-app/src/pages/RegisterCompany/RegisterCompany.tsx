import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMessage } from '../../context/MessageContext';
import './RegisterCompany.css';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [company_name, setCompanyName] = useState<string>('');
  const [cuil, setCuil] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validaciones
    if (!company_name || !contactEmail || !password || !confirmPassword || !phone || !address) {
      setError('Por favor, completa todos los campos obligatorios: Nombre de la Empresa, Email, Contraseña, Confirmar Contraseña, Teléfono y Dirección.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setError('Por favor, introduce un email válido.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: company_name,
          cuil: cuil,
          contactEmail: contactEmail,
          password: password,
          phone: phone,
          address: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error al registrar la empresa.');
        return;
      }

      setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
      setTimeout(() => {
        onRegisterSuccess();
        navigate('/logincompany');
      }, 2000);
    } catch (err) {
      setError('Error de red o del servidor.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Registrar Empresa</h2>
        {error && (
          <div className="register-error-message">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="register-success-message">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <label htmlFor="register-companyName" className="register-label">Nombre de la Empresa</label>
            <input
              type="text"
              id="register-companyName"
              className="register-input"
              value={company_name}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="register-CUIL" className="register-label">CUIL</label>
            <input
              type="text"
              id="register-CUIL"
              className="register-input"
              value={cuil}
              onChange={(e) => setCuil(e.target.value)}
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="register-email" className="register-label">Email de Contacto</label>
            <input
              type="email"
              id="register-email"
              className="register-input"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="register-phone" className="register-label">Teléfono</label>
            <input
              type="text"
              id="register-phone"
              className="register-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="register-address" className="register-label">Dirección</label>
            <input
              type="text"
              id="register-address"
              className="register-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="register-password" className="register-label">Contraseña</label>
            <input
              type="password"
              id="register-password"
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="register-form-group">
            <label htmlFor="confirm-password" className="register-label">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirm-password"
              className="register-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="register-button"
          >
            Registrar Empresa
          </button>
          <div className="register-login-link">
            ¿Ya tienes una cuenta de organizador?{' '}
            <Link to="/logincompany" className="register-link">
              Inicia sesión aquí
            </Link>
          </div>
        </form>
        <button onClick={() => navigate(-1)} className="back-button">Volver</button>
      </div>
    </div>
  );
};

export default Register;
