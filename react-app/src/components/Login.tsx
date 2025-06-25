"use client"

import type React from "react"
import { useState } from "react"

// Definición de las props que el componente Login recibirá
interface LoginProps {
  onLoginSuccess: () => void // Función que se llamará al iniciar sesión con éxito
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false) // Estado para mostrar/ocultar contraseña

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Simulación de un proceso de autenticación
    // Posteriormente linkear con una API real
    if (username === "usuario" && password === "contraseña") {
      onLoginSuccess()
    } else {
      setError("Usuario o contraseña incorrectos.")
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="login-input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="login-password-toggle"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
          <button
            type="submit"
            className="login-btn-submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
