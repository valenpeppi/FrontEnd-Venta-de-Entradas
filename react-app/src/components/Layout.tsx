import React from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar'; // Importa el Navbar
import Footer from './Footer'; // Importa el Footer (asumiendo que existe o lo crearías)
import MessageDisplay from './MessageDisplay'; // Importa MessageDisplay

// Interfaz para las props del componente Layout
interface LayoutProps {
  children: ReactNode; // Contenido específico de la página
  isLoggedIn: boolean;
  userName: string | null;
  onLogout: () => void;
  appMessage: string | null; // Prop para el mensaje global
  setAppMessage: (message: string | null) => void; // Prop para la función de establecer mensaje
}

const Layout: React.FC<LayoutProps> = ({ children, isLoggedIn, userName, onLogout, appMessage, setAppMessage }) => {
  return (
    <div className="layout-container">
      {/* Navbar es parte del layout */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        onLogout={onLogout} 
      />
      
      {/* MessageDisplay es parte del layout para notificaciones globales */}
      {/* Se renderiza directamente, ya que MessageDisplay maneja su propio posicionamiento fijo */}
      <MessageDisplay 
        message={appMessage} 
        type={appMessage?.includes('exitoso') || appMessage?.includes('comprado') || appMessage?.includes('agregado') ? 'success' : 'error'} 
      />

      {/* Contenido específico de cada página se renderizará aquí */}
      <main className="layout-main-content">
        {/* Pasamos setAppMessage a los children para que puedan enviar mensajes */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            // Clona el elemento hijo y añade la prop setAppMessage
            return React.cloneElement(child, { setAppMessage: setAppMessage } as any); // 'as any' para evitar errores de tipo si HomePage no tiene la prop definida aún
          }
          return child;
        })}
      </main>

      {/* Footer es parte del layout */}
      <Footer />
    </div>
  );
};

export default Layout;
