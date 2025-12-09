import React from 'react';
import SupportLayout from '@/shared/components/SupportLayout';

const About: React.FC = () => {
  return (
    <SupportLayout title="Sobre TicketApp" subtitle="Conectando fans con experiencias inolvidables">
      <p>
        TicketApp es líder en la venta de entradas para los mejores eventos de música, deportes, teatro y entretenimiento en todo el país. Nuestra tarea es acercar a las personas a experiencias inolvidables, brindando un servicio seguro, rápido y confiable.
      </p>
      <p>
        Con años de trayectoria, TicketApp se ha consolidado como la plataforma preferida por millones de usuarios, ofreciendo innovación, atención personalizada y la mejor tecnología para que tu acceso a los eventos sea simple y seguro.
      </p>
    </SupportLayout>
  );
};

export default About;
