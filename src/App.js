import logo from './logo.svg';
import './App.css';
import { Dashboard } from './pages/dashboard';
import { Route, Routes } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route exact path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
