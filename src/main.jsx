import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initDB } from './db/db.js'

initDB().then(() => {
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
})