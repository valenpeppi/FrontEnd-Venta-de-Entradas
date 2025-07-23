import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterCompany.css'; 

interface RegisterProps {
  onRegisterSuccess: () => void;
  setAppMessage: (message: string | null) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, setAppMessage }) => {
  const [dniOrganiser, setDniOrganiser] = useState<string>('');
  const [company_name, setCompanyName] = useState<string>('');
  const [cuil, setCuil] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [adress, setAdress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAppMessage(null); // Limpia cualquier mensaje al montar
  }, [setAppMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validaciones
    if (!dniOrganiser || !company_name || !contactEmail || !password || !confirmPassword || !phone || !adress) {
      setError('Por favor, completa todos los campos.');
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
          dniOrganiser: dniOrganiser,
          company_name: company_name,
          cuil: cuil,
          contactEmail: contactEmail,
          password: password,
          phone: phone,
          adress: adress,
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
        navigate('/logincompany'); // Redirige al login de empresa
      }, 2000);
    } catch (err) {
      setError('Error de red o del servidor.');
    }
  };

  return (
    <div className="register-container"> 
      <div className="register-card"> 
        <h2 className="register-title">Registrarse</h2> 
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
        <form onSubmit={handleSubmit}>
          <div className="register-form-grid"> 
            <div className="register-field-col-span"> 
              <label htmlFor="register-CUIL" className="register-label">CUIL:</label>
              <input
                type="text"
                id="register-CUIL"
                className="register-input"
                value={cuil}
                onChange={(e) => setCuil(e.target.value)} // Corregido a setCuil
                required
              />
            </div>
            <div className="register-field-col-span">
              <label htmlFor="register-companyName" className="register-label">Nombre de la Empresa:</label>
              <input
                type="text"
                id="register-companyName"
                className="register-input"
                value={company_name}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="register-field-col-span">
              <label htmlFor="register-email" className="register-label">Email de Contacto:</label>
              <input
                type="email"
                id="register-email"
                className="register-input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>
            <div className="register-field-col-span">
              <label htmlFor="register-phone" className="register-label">Teléfono:</label>
              <input
                type="text"
                id="register-phone"
                className="register-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="register-field-col-span">
              <label htmlFor="register-adress" className="register-label">Dirección:</label>
              <input
                type="text"
                id="register-adress"
                className="register-input"
                value={adress}
                onChange={(e) => setAdress(e.target.value)}
                required
              />
            </div>
            <div className="register-field-col-span">
              <label htmlFor="register-password" className="register-label">Contraseña:</label>
              <input
                type="password"
                id="register-password"
                className="register-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="register-field-col-span">
              <label htmlFor="confirm-password" className="register-label">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirm-password"
                className="register-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="register-submit-btn"
          >
            Registrarse
          </button>
          <div className="register-login-link-container">
            <p className="register-login-link-text">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/logincompany" className="register-login-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
        <button onClick={() => navigate(-1)} className="back-button">Volver</button> {/* Botón "Volver" añadido */}
      </div>
    </div>
  );
};

export default Register;
