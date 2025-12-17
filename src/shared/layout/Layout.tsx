import React from 'react';
import Navbar from '@/shared/layout/Navbar';
import Footer from '@/shared/layout/Footer';
import MessageDisplay from '@/shared/MessageDisplay';
import { useMessage } from '@/shared/context/MessageContext';
import { useLocation } from "react-router-dom";
import styles from '@/shared/layout/styles/Layout.module.css';
import type { LayoutProps } from '@/types/common';


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
