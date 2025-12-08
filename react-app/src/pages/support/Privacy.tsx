import React from 'react';
import SupportLayout from '../../shared/components/SupportLayout';

const Privacy: React.FC = () => {
  return (
    <SupportLayout title="Política de Privacidad">
      <h2>1. Información que recopilamos</h2>
      <p>Recopilamos información personal que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, y datos de pago al comprar entradas.</p>

      <h2>2. Cómo usamos tu información</h2>
      <p>Utilizamos tu información para procesar tus transacciones, enviarte confirmaciones y actualizaciones sobre eventos, y para fines de marketing, siempre que hayas dado tu consentimiento.</p>

      <h2>3. Cómo compartimos tu información</h2>
      <p>No compartimos tu información personal con terceros, excepto cuando es necesario para completar una transacción (por ejemplo, con nuestros procesadores de pago) o si la ley lo exige.</p>

      <h2>4. Seguridad de tus datos</h2>
      <p>Tomamos medidas razonables para proteger tu información personal contra pérdida, robo, uso indebido y acceso no autorizado.</p>
    </SupportLayout>
  );
};

export default Privacy;
