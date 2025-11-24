

import { useEffect, useState } from 'react'
import './App.css'
import Login from './pages/login'
import ConnectPluggy from './pages/Pluggy'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Transacoes from './pages/transaçoes'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/connect-pluggy" element={<ConnectPluggy />} />
        <Route path="/transaçoes" element={<Transacoes />} />
      </Routes>
    </Router>
  )
}

export default App