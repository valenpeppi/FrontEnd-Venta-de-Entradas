import React from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MessageDisplay from './MessageDisplay';
import { useMessage } from '../context/MessageContext';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { messages } = useMessage();

  return (
    <div className="layout-container">
      <Navbar />
      
      {/* Renderizar todos los mensajes */}
      {messages.map(message => (
        <MessageDisplay 
          key={message.id}
          message={message.text} 
          type={message.type} 
        />
      ))}

      <main className="layout-main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
