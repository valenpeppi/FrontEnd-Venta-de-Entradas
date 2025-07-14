"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

// Definición de las props que el componente Login recibirá
interface LoginProps {
  onLoginSuccess: () => void // Función que se llamará al iniciar sesión con éxito
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Simulación de un proceso de autenticación
    // Posteriormente linkear con una API real
    if (username === "usuario" && password === "contraseña") {
      onLoginSuccess()
      navigate('/') // Redirigir a la página principal después del login
    } else {
      setError("Usuario o contraseña incorrectos.")
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        {error && <div className="login-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="username" className="login-label">
              Email
            </label>
            <input
              type="text"
              id="username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
