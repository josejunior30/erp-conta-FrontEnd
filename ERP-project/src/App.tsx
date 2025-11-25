import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/login";
import ConnectPluggy from "./pages/Pluggy";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransacoesExibir from "./pages/transacoesExibir";
import Banco from "./pages/banco";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/connect-pluggy" element={<ConnectPluggy />} />
        <Route path="/transaçoes" element={<Banco />} />
        <Route path="/transacoes/:itemId" element={<TransacoesExibir />} />
      </Routes>
    </Router>
  );
}

export default App;
