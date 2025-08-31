import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './css/index.css'
import App from './App.tsx'
import LoginPage from './page/Login.tsx';
import '@ant-design/v5-patch-for-react-19';
import DashboardPage from './page/dashboard.tsx';
import Game from './page/GameUI.tsx';
import Lobby from './page/Lobby.tsx';
import NotFoundPage from './page/NotFound.tsx';
import MultiPage from './page/MultiPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage/>} />
        <Route path='/Game' element={<Game/>} />
        <Route path='/Lobby' element={<Lobby/>} />
        <Route path="*" element={<NotFoundPage/>} />
        <Route path="/Multi" element={<MultiPage/>} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>,  
)
