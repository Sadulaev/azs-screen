import { Navigate, Route, Routes } from 'react-router-dom';
import DisplayPage from './pages/DisplayPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DisplayPage />} />
      <Route path="/display" element={<DisplayPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
