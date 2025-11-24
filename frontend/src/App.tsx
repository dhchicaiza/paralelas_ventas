import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewSale } from './pages/NewSale';
import { SaleDetails } from './pages/SaleDetails';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nueva-venta" element={<NewSale />} />
          <Route path="/ventas/:id" element={<SaleDetails />} />
          <Route path="/reportes" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Reportes</h2><p className="text-gray-600 mt-2">Próximamente...</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
