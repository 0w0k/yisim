import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import './index.css';
import App from './App.jsx';
import Game from './Game.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/game' element={<Game />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
