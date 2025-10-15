import React from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MessageDisplay from '../MessageDisplay';
import { useMessage } from '../../shared/context/MessageContext';
import { useLocation } from "react-router-dom"; 
import styles from './styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { messages } = useMessage();
  const location = useLocation();

  const disableHeaderFooter = location.pathname.startsWith("/pay/processing");

  return (
    <div className={styles.layoutContainer}>
      <div className={disableHeaderFooter ? styles.disabled : ""}>
        <Navbar />
      </div>
      
      <div className={styles.messageListContainer}>
        {messages.map(message => (
          <MessageDisplay 
            key={message.id}
            message={message.text} 
            type={message.type} 
          />
        ))}
      </div>

      <main className={styles.layoutMainContent}>
        {children}
      </main>

      <div className={disableHeaderFooter ? styles.disabled : ""}>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
