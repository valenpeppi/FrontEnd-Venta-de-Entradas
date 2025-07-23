"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

// Definición de las props que el componente Login recibirá
interface LoginProps {
  onLoginSuccess: (userName: string) => void // Función que se llamará al iniciar sesión con éxito, ahora recibe el nombre de usuario
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Enviando login:', email, password);
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // o email, según tu backend
          password,
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es 2xx, lanza error
        const errorData = await response.json();
        setError(errorData.message || 'Usuario o contraseña incorrectos.');
        return;
      }

      const data = await response.json();
      // Aquí puedes guardar el token, usuario, etc.
      onLoginSuccess(email); // O data.userName si tu backend lo devuelve
      navigate('/');
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de red o del servidor.');
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        {error && <div className="login-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              type="text"
              id="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field-password">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="login-input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="login-btn-submit"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="login-register-link">
          <p>¿No tienes cuenta? <Link to="/register" className="login-register-link-btn">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Login
