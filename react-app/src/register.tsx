import React, { useState } from 'react';


interface RegisterProps {
  onRegisterSuccess: () => void; 
  onGoToLogin: () => void; 
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onGoToLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validaciones
    if (!email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Aquí iría la lógica para registrar el usuario en la base de datos
    // Por ahora, realizamos una simulación de éxito inmediato
    console.log('Intentando registrar usuario:', { email, password });

    setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
    setTimeout(() => {
      onRegisterSuccess();
    }, 2000); // Redirige después de 2 segundos para que el usuario vea el mensaje
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 antialiased">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-scale-in">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">Registrarse</h2>
        {error && (
          <div className="p-3 rounded-md shadow-sm mb-4 bg-red-100 text-red-800 text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-3 rounded-md shadow-sm mb-4 bg-green-100 text-green-800 text-center">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="register-email" className="block text-gray-700 text-lg font-semibold mb-2">Email:</label>
            <input
              type="email"
              id="register-email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="register-password" className="block text-gray-700 text-lg font-semibold mb-2">Contraseña:</label>
            <input
              type="password"
              id="register-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-gray-700 text-lg font-semibold mb-2">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirm-password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Registrarse
          </button>
          <div className="mt-6 text-center">
            <p className="text-gray-600">¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
