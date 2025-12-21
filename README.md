<h1>🎟️ TicketApp – FrontEnd</h1>

<p align="center">
  <a href="https://github.com/valenpeppi/tp" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/🏠%20Repo%20Raíz-Info%20General-4C51BF?style=for-the-badge&logo=github&logoColor=white" alt="Repo Raíz General"/>
  </a>
</p>

<p align="center">
  <a href="https://github.com/valenpeppi/FrontEnd-Venta-de-Entradas" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/💻%20Repo%20Frontend-TicketApp-0b7285?style=for-the-badge&logo=github&logoColor=white" alt="Repo Frontend"/>
  </a>
  <a href="https://github.com/valenpeppi/BackEnd-Venta-de-Entradas" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/⚙️%20Repo%20Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Repo Backend"/>
  </a>
  <a href="https://drive.google.com/file/d/1JQ4jZBuJwJ3PSq4Bxjy0-jp5qHoPxyZK/view" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/🗺️%20Modelo%20ER-DER-ff9800?style=for-the-badge&logo=googledrive&logoColor=white" alt="DER TicketApp"/>
  </a>
</p>

<p align="center">
  <a href="https://github.com/agussantinelli" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/👤%20Agustín%20Santinelli-agussantinelli-000000?style=for-the-badge&logo=github&logoColor=white" alt="Agus"/>
  </a>
  <a href="https://github.com/martin-ratti" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/👤%20Martín%20Ratti-martin--ratti-000000?style=for-the-badge&logo=github&logoColor=white" alt="Martín"/>
  </a>
  <a href="https://github.com/gianzaba" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/👤%20Gianlucas%20Zabaleta-gianzaba-000000?style=for-the-badge&logo=github&logoColor=white" alt="Gianlucas"/>
  </a>
  <a href="https://github.com/valenpeppi" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/👤%20Valentín%20Peppino-valenpeppi-000000?style=for-the-badge&logo=github&logoColor=white" alt="Valentín"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=000000" alt="React Badge"/>
  <img src="https://img.shields.io/badge/Vite-6.4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TS Badge"/>
  <img src="https://img.shields.io/badge/react--router--dom-6.25.1-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="RRD Badge"/>
  <img src="https://img.shields.io/badge/axios-1.11.0-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios Badge"/>
  <img src="https://img.shields.io/badge/Vitest-3.2.4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest Badge"/>
  <img src="https://img.shields.io/badge/Playwright-1.56.0-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright Badge"/>
  <img src="https://img.shields.io/badge/ESLint-9.25.0-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint Badge"/>
  <img src="https://img.shields.io/badge/jsPDF-Tickets%20PDF-000000?style=for-the-badge" alt="jsPDF Badge"/>
  <img src="https://img.shields.io/badge/Stripe-Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe Badge"/>
  <img src="https://img.shields.io/badge/Google%20reCAPTCHA-Seguridad-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="reCAPTCHA Badge"/>
</p>

<hr/>

<h2>🎯 Objetivo</h2>

<p>
  <strong>TicketApp</strong> es una aplicación web de <strong>venta de entradas</strong> desarrollada como trabajo práctico de la cátedra 
  <strong>Desarrollo de Software (DSW) – UTN FRRO, 2025</strong>.
</p>

<p>
  Este repositorio contiene el <strong>FrontEnd</strong>:
  una <strong>Single Page Application (SPA)</strong> en React + TypeScript que se integra con un backend
  en Node.js + Express y una base de datos MySQL mediante una <strong>API REST</strong>.
</p>

<p>
  El objetivo principal es cubrir el ciclo completo:
</p>

<ul>
  <li>Exploración y búsqueda de eventos.</li>
  <li>Selección de butacas (sectores enumerados) y entradas generales.</li>
  <li>Gestión de carrito y validaciones.</li>
  <li>Flujo de pago con <strong>Stripe</strong>.</li>
  <li>Descarga de tickets en <strong>PDF</strong>.</li>
  <li>Gestión de eventos por parte de empresas organizadoras.</li>
  <li>Panel administrativo para aprobación y destacado de eventos.</li>
  <li>Asistente de chat con IA integrado vía API de terceros.</li>
</ul>

<hr/>


<h2>💼 Modelo de Negocio</h2>

<p>
  TicketApp opera bajo un modelo de Marketplace de Eventos, funcionando como una plataforma intermediaria que conecta a dos audiencias principales para generar valor mutuo. Por un lado, permite a las empresas organizadoras publicar, gestionar y monetizar sus espectáculos, brindándoles herramientas administrativas y acceso a estadísticas de venta. Por otro lado, ofrece a los asistentes un entorno seguro y eficiente para descubrir experiencias de entretenimiento, realizar pagos protegidos a través de Stripe y recibir sus entradas digitales en formato PDF de manera inmediata. Además, incorpora un rol de administrador que actúa como garante de calidad, supervisando la veracidad de los eventos y brindando soporte a ambas partes del ecosistema.
</p>

<hr/>

<h2>🧱 Stack y características del FrontEnd</h2>

<h3>🔧 Fundación técnica</h3>

<table>
  <thead>
    <tr>
      <th>Componente</th>
      <th>Tecnología</th>
      <th>Versión</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>UI Framework</strong></td>
      <td>React</td>
      <td>19.1.1</td>
    </tr>
    <tr>
      <td><strong>Build Tool</strong></td>
      <td>Vite</td>
      <td>6.4.0</td>
    </tr>
    <tr>
      <td><strong>Lenguaje</strong></td>
      <td>TypeScript</td>
      <td>5.8.3</td>
    </tr>
    <tr>
      <td><strong>Routing</strong></td>
      <td>react-router-dom</td>
      <td>6.25.1</td>
    </tr>
    <tr>
      <td><strong>Cliente HTTP</strong></td>
      <td>axios</td>
      <td>1.11.0</td>
    </tr>
    <tr>
      <td><strong>Testing Unitario</strong></td>
      <td>Vitest</td>
      <td>3.2.4</td>
    </tr>
    <tr>
      <td><strong>Testing E2E</strong></td>
      <td>Playwright</td>
      <td>1.56.0</td>
    </tr>
    <tr>
      <td><strong>Manejo de estado global</strong></td>
      <td>React Context API + custom hooks</td>
      <td>–</td>
    </tr>
    <tr>
      <td><strong>Pagos</strong></td>
      <td>Stripe Checkout</td>
      <td>Integración vía backend</td>
    </tr>
    <tr>
      <td><strong>Tickets PDF</strong></td>
      <td>jsPDF</td>
      <td>3.0.2</td>
    </tr>
  </tbody>
</table>

<p>
  Se utiliza <strong>Context API</strong> en lugar de Redux u otros state managers externos, priorizando una arquitectura ligera pero
  bien estructurada.
</p>

<hr/>

<h2>📦 Estructura del proyecto</h2>

<pre><code>FrontEnd-Venta-de-Entradas/
├── public/                      # Archivos estáticos públicos
├── src/
│   ├── assets/                  # Recursos estáticos (imágenes, fuentes)
│   ├── hooks/                   # Custom hooks reutilizables
│   ├── pages/                   # Vistas por módulo (Admin, Auth, Events, Sales...)
│   ├── services/                # Servicios de API y lógica de negocio
│   ├── shared/                  # Componentes (UI), Contexts, Utilidades
│   ├── types/                   # Definiciones de tipos TypeScript globales
│   ├── App.tsx                  # Configuración de rutas y providers
│   └── Main.tsx                 # Entry point de la aplicación
├── tests/                       # Configuración y tests E2E
├── .env                         # Variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── index.html                   # HTML base de la aplicación
├── package.json                 # Dependencias y scripts
├── README.md                    # Documentación
├── tsconfig.json                # Configuración de TypeScript
└── vite.config.ts               # Configuración de Vite
</code></pre>

<hr/>

<h2>🧭 Capacidades por rol y flujos</h2>

<h3>📊 Matriz de funcionalidad</h3>

<table>
  <thead>
    <tr>
      <th>Capability</th>
      <th>Guest</th>
      <th>User</th>
      <th>Company</th>
      <th>Admin</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Browse Events</td>
      <td>✓</td>
      <td>✓</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Search Events</td>
      <td>✓</td>
      <td>✓</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>View Event Details</td>
      <td>✓</td>
      <td>✓</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Select Seats/Tickets</td>
      <td>✓</td>
      <td>✓</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Add to Cart</td>
      <td>–</td>
      <td>✓</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>Purchase Tickets</td>
      <td>–</td>
      <td>✓</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>View My Tickets</td>
      <td>–</td>
      <td>✓</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>Download PDF Tickets</td>
      <td>–</td>
      <td>✓</td>
      <td>–</td>
      <td>–</td>
    </tr>
    <tr>
      <td>Manage Support Messages</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Create Events</td>
      <td>–</td>
      <td>–</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Approve Events</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Feature Events</td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>AI Chat Assistant</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
    </tr>
  </tbody>
</table>

<h3>🧵 Flujos principales</h3>

<ul>
  <li><strong>Event Discovery Flow</strong>:
    <code>/</code> → <code>/event/:id</code> → <code>/cart</code>
  </li>
  <li><strong>Purchase Flow</strong>:
    <code>/cart</code> → <code>/pay</code> → <code>/pay/processing</code> → <code>/pay/success</code> (o <code>/pay/failure</code>) → <code>/myTickets</code>
  </li>
  <li><strong>Authentication Flow</strong>:
    <code>/login</code> o <code>/register</code> → redirección según rol (User, Company, Admin).
  </li>
  <li><strong>Event Management Flow (Company)</strong>:
    <code>/create-event</code> → aprobación en <code>/admin</code> → destacado en <code>/feature-events</code>
  </li>
</ul>

<hr/>

<h2>🔐 Acceso, AuthRoute y Contexts</h2>

<h3>AuthRoute</h3>

<p>
  El componente <code>AuthRoute</code> envuelve las rutas que requieren lógica de acceso:
</p>

<ul>
  <li><strong>guestOnly</strong> – sólo usuarios no autenticados (login / registro).</li>
  <li><strong>allowedRoles</strong> – restringe la ruta a un subconjunto: <code>user</code>, <code>company</code>, <code>admin</code>.</li>
  <li>Rutas públicas – se definen sin wrapper.</li>
</ul>

<h3>Contexts principales</h3>

<ul>
  <li><strong>AuthContext</strong>: Control de sesión, token JWT y sincronización con localStorage.</li>
  <li><strong>CartContext</strong>: Gestión de items (eventos, sectores, butacas) previo al pago.</li>
  <li><strong>EventsContext</strong>: Listado, filtrado y búsqueda de eventos desde la API.</li>
  <li><strong>SearchContext</strong>: Estado compartido de parámetros de búsqueda.</li>
  <li><strong>EventDetailContext</strong>: Lógica específica para la selección de butacas en un evento.</li>
  <li><strong>MessageContext</strong>: Feedback visual global (toasts/notificaciones).</li>
</ul>

<hr/>

<h2>💳 Flujo de pago e integración con pasarelas</h2>

<p>
  El FrontEnd coordina el flujo de pago contra el backend, persistiendo el estado en <code>localStorage</code> para recuperar la sesión tras los redireccionamientos externos:
</p>

<ol>
  <li><strong>Selección:</strong> El usuario arma su pedido, agrupado por eventos y sectores (TicketGroup).</li>
  <li><strong>Inicio de Pago (Pay.tsx):</strong> Se comunica con el backend para iniciar sesión en Stripe.</li>
  <li><strong>Procesamiento (ProcessingPayment.tsx):</strong>
    <ul>
      <li>Al regresar de la pasarela, se muestra una pantalla de carga.</li>
      <li>Se ejecuta una estrategia de <strong>polling</strong> (hasta 8 intentos) para confirmar el estado de la transacción.</li>
    </ul>
  </li>
  <li><strong>Resolución:</strong>
    <ul>
      <li><strong>Éxito (Success.tsx):</strong> Se limpia el carrito y se redirige a mis tickets.</li>
      <li><strong>Fallo (Failure.tsx):</strong> Se informa el error y permite reintentar.</li>
    </ul>
  </li>
</ol>

<hr/>

<h2>⚙️ Configuración, scripts y variables de entorno</h2>

<h3>Scripts npm del FrontEnd</h3>

<table>
  <thead>
    <tr>
      <th>Comando</th>
      <th>Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm run dev</code></td>
      <td>Inicia el servidor de desarrollo de Vite (HMR) – puerto 5173 por defecto.</td>
    </tr>
    <tr>
      <td><code>npm run build</code></td>
      <td>Compila TypeScript y genera el build de producción en <code>dist/</code>.</td>
    </tr>
    <tr>
      <td><code>npm run preview</code></td>
      <td>Levanta un servidor para previsualizar el build de producción.</td>
    </tr>
    <tr>
      <td><code>npm run test:unit</code></td>
      <td>Ejecuta los tests unitarios con Vitest.</td>
    </tr>
    <tr>
      <td><code>npm run test:e2e</code></td>
      <td>Ejecuta los tests end-to-end con Playwright.</td>
    </tr>
    <tr>
      <td><code>npm run lint</code></td>
      <td>Corre ESLint para revisar la calidad del código.</td>
    </tr>
  </tbody>
</table>

<h3>Variables de entorno (FrontEnd)</h3>

<ul>
  <li><code>VITE_API_BASE</code> – URL base de la API (ej: <code>http://localhost:3000/api</code>).</li>
  <li><code>VITE_GOOGLE_CLIENT_ID</code> – Client ID para autenticación con Google.</li>
  <li><code>VITE_RECAPTCHA_SITE_KEY</code> – Clave de sitio para reCAPTCHA v2.</li>
  <li><code>VITE_BACKEND_URL</code> – (Opcional) Alternativa para la URL del backend si se requiere.</li>
</ul>

<hr/>

<h2>🚀 Instalación y ejecución (fin a fin)</h2>

<h3>1️⃣ Requisitos</h3>

<ul>
  <li>Node.js 18 o superior.</li>
  <li>MySQL 8 o superior.</li>
  <li>Git.</li>
</ul>

<h3>2️⃣ Clonar repositorios</h3>

<pre><code># Frontend
git clone https://github.com/valenpeppi/FrontEnd-Venta-de-Entradas.git
cd FrontEnd-Venta-de-Entradas

# Backend
git clone https://github.com/valenpeppi/BackEnd-Venta-de-Entradas.git
cd BackEnd-Venta-de-Entradas
</code></pre>

<h3>3️⃣ Configurar backend (.env)</h3>

<pre><code>OPENROUTER_API_KEY=tu_api_key_ai
GOOGLE_CLIENT_ID=tu_google_client_id

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=ticketapp
DATABASE_URL="mysql://root:password@localhost:3306/ticketapp"

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

RECAPTCHA_SECRET_KEY=tu_recaptcha_secret
STRIPE_SECRET_KEY=tu_stripe_secret
STRIPE_WEBHOOK_SECRET=tu_stripe_webhook_secret

EMAIL_USER=ticketapp15@gmail.com
EMAIL_PASS=""
JWT_SECRET=super-secret-key
</code></pre>

<h3>4️⃣ Configurar frontend (.env)</h3>
<p>Crear archivo <code>.env</code> en <code>FrontEnd-Venta-de-Entradas/</code>:</p>

<pre><code>VITE_API_BASE=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_RECAPTCHA_SITE_KEY=tu_recaptcha_site_key
</code></pre>

<h3>5️⃣ Migraciones Prisma</h3>

<pre><code>npx prisma migrate reset
</code></pre>

<h3>6️⃣ Levantar backend</h3>

<pre><code>npm install
npm run dev
</code></pre>

<p>El backend queda escuchando en <code>http://localhost:3000</code>.</p>

<h3>7️⃣ Levantar frontend</h3>

<pre><code>cd ../FrontEnd-Venta-de-Entradas
npm install
npm run dev
</code></pre>

<p>
  FrontEnd disponible en <strong>http://localhost:5173</strong>.
</p>

<hr/>

<h2>🔑 Credenciales de prueba</h2>

<table>
  <thead>
    <tr>
      <th>Rol</th>
      <th>Email</th>
      <th>Contraseña</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Usuario</td>
      <td><code>gian@hotmail.com</code></td>
      <td><code>gian</code></td>
    </tr>
    <tr>
      <td>Administrador</td>
      <td><code>peppi@gmail.com</code></td>
      <td><code>peppi</code></td>
    </tr>
    <tr>
      <td>Organizador</td>
      <td><code>sbrolla@gmail.com</code></td>
      <td><code>peppi</code></td>
    </tr>
    <tr>
      <td>Admin Sistema</td>
      <td><code>ticketapp15@gmail.com</code></td>
      <td><code>ticket</code></td>
    </tr>
  </tbody>
</table>

<hr/>

<h2>🧪 Estrategia de tests</h2>

<ul>
  <li><strong>Backend – Jest</strong>
    <ul>
      <li><code>npm run test:unit</code> – tests unitarios de servicios y controladores.</li>
      <li><code>npm run test:integration</code> – pruebas de endpoints reales contra una DB de prueba.</li>
    </ul>
  </li>
  <li><strong>Frontend – Vitest</strong>
    <ul>
      <li><code>npm run test:unit</code> – tests de componentes, páginas y hooks.</li>
    </ul>
  </li>
  <li><strong>E2E – Playwright</strong>
    <ul>
      <li><code>npm run test:e2e</code> – flujo completo: búsqueda de evento → selección → compra → ver tickets.</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>🎥 Video demostrativo</h2>
  <a href="https://youtu.be/UICpO64qw9c" target="_blank">
    <img src="https://img.shields.io/badge/🎥%20Ver%20Video%20Demo-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Video Demo"/>
  </a>

<hr/>

<h2>👥 Equipo</h2>

<ul>
  <li><strong>Agustín Santinelli</strong> –
    <a href="https://github.com/agussantinelli" target="_blank">@agussantinelli</a>
  </li>
  <li><strong>Martín Ratti</strong> –
    <a href="https://github.com/martin-ratti" target="_blank">@martin-ratti</a>
  </li>
  <li><strong>Gianlucas Zabaleta</strong> –
    <a href="https://github.com/gianzaba" target="_blank">@gianzaba</a>
  </li>
  <li><strong>Valentín Peppino</strong> –
    <a href="https://github.com/valenpeppi" target="_blank">@valenpeppi</a>
  </li>
</ul>

<p>
  Proyecto académico desarrollado para <strong>UTN FRRO – cátedra Desarrollo de Software (DSW) 2025</strong>.
</p>

<hr/>

<h2>🤝 Contribuir</h2>

<ol>
  <li>Hacer <strong>fork</strong> del repositorio.</li>
  <li>Crear rama <code>feature/...</code> o <code>fix/...</code>.</li>
  <li>Aplicar cambios siguiendo la arquitectura (pages, components, contexts).</li>
  <li>Agregar tests cuando corresponda.</li>
  <li>Abrir un <strong>Pull Request</strong> descriptivo.</li>
</ol>

<hr/>

<h2>⚖️ Licencia</h2>

<p>
  La licencia del proyecto se detalla en el archivo <code>LICENSE</code> de este repositorio (si corresponde).
</p>

<p>
  <em>TicketApp – FrontEnd de Venta de Entradas para el TP de Desarrollo de Software 2025.</em>
</p>
