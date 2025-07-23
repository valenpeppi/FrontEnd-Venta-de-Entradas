import type React from "react"
import { useState, useEffect } from "react" // Importa useEffect
import { useNavigate, Link } from "react-router-dom"
import './Login.css' 

// Definición de las props que el componente Login recibirá
interface LoginProps {
  onLoginSuccess: (userName: string) => void; // Función que se llamará al iniciar sesión con éxito
  setAppMessage: (message: string | null) => void; // Nueva prop para limpiar mensajes de la aplicación
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, setAppMessage }) => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Limpia cualquier mensaje de la aplicación cuando el componente Login se monta
  useEffect(() => {
    setAppMessage(null);
  }, [setAppMessage]); // Se ejecuta una vez al montar, dependiendo de setAppMessage

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
          mail: email, 
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
      console.log('Respuesta del backend:', data);

       // Usar el nombre real si viene
      
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

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
              type="email"
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
        <button onClick={() => navigate(-1)} className="back-button">Volver</button>
      </div>
    </div>
  )
}

export default Login
