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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 antialiased">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-scale-in">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">Iniciar Sesión</h2>
        {error && <div className="p-3 rounded-md shadow-sm mb-4 bg-red-100 text-red-800 text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-lg font-semibold mb-2">
              Email
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-gray-700 text-lg font-semibold mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-2/3 transform -translate-y-1/3 flex items-center text-gray-800 hover:text-gray-950 text-xl focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
