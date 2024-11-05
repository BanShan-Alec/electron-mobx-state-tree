import { useEffect, useState } from 'react'
import logoVite from './assets/logo-vite.svg'
import logoElectron from './assets/logo-electron.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  }, [])

  const handleCreateWindow = (e: any) => {
    e.preventDefault();
    window.electronAPI.createWindow()
  }

  return (
    <div className='App'>
      <div className='logo-box'>
        <a href='' onClick={handleCreateWindow}>
          <img src={logoVite} className='logo vite' alt='Electron + Vite logo' />
          <img src={logoElectron} className='logo electron' alt='Electron + Vite logo' />
        </a>
      </div>
      <h1>Electron + Mobx State Tree</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Electron + Vite logo to <b>`New Another Window`</b>
      </p>

    </div>
  )
}

export default App