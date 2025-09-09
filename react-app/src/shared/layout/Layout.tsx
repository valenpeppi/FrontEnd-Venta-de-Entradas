import React from 'react';
import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MessageDisplay from '../MessageDisplay';
import { useMessage } from '../../shared/context/MessageContext';
import styles from './styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { messages } = useMessage();

  return (
    <div className={styles.layoutContainer}>
      <Navbar />
      
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

      <Footer />
    </div>
  );
};

export default Layout;
