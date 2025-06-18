import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div>
        <button className="btn btn-primary">Guardar</button>
        <button className="btn btn-secondary">Cancelar</button>
        <button className="btn btn-danger">Eliminar</button>
        <button className="btn btn-primary btn-lg">Grande</button>
        <button className="btn btn-secondary btn-sm" disabled>Deshabilitado</button>
      </div>
      </>
  )
}


export default App
