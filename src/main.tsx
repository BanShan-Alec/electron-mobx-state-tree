import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'
console.time("React render");


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.timeEnd("React render");

// postMessage({ payload: 'removeLoading' }, '*')
