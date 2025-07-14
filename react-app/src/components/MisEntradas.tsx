import React, { useEffect, useState } from 'react';
import type { EntradaData } from './EntradaCard';
import EntradaCard from './EntradaCard';
import Navbar from './Navbar';
import { Footer } from './Navbar';

// Simulación de usuario actual (en una app real, esto vendría de auth)
const USUARIO_ACTUAL = 'usuario_demo';

const MisEntradas: React.FC = () => {
  const [entradas, setEntradas] = useState<EntradaData[]>([]);

  useEffect(() => {
    // Simulación: obtener entradas del localStorage
    const data = localStorage.getItem(`entradas_${USUARIO_ACTUAL}`);
    if (data) {
      setEntradas(JSON.parse(data));
    } else {
      setEntradas([]);
    }
  }, []);

  return (
    <div className="mis-entradas-root">
      <Navbar />
      <main className="mis-entradas-main">
        <h2>Mis Entradas</h2>
        {entradas.length === 0 ? (
          <p>No tienes entradas compradas.</p>
        ) : (
          <div className="mis-entradas-list">
            {entradas.map((entrada, idx) => (
              <EntradaCard key={idx} {...entrada} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MisEntradas; 