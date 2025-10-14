import { Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

function App() {

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
