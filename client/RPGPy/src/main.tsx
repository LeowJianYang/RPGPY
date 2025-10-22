import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './css/index.css'
import './css/themes.css'
import App from './App.tsx'
import LoginPage from './page/Login.tsx';
import '@ant-design/v5-patch-for-react-19';
import DashboardPage from './page/dashboard.tsx';
import Game from './page/GameUI.tsx';
import Lobby from './page/Lobby.tsx';
import NotFoundPage from './page/NotFound.tsx';
import MultiPage from './page/MultiPage.tsx';
import DocumentationPage from './page/Documentation.tsx';
import Docs from './page/Docs.tsx';
import { Toast } from './components/Toast.tsx';
import JoinMiddlePage from './page/joinMiddle.tsx';
import Settings from './page/Settings.tsx';
import { initializeTheme } from './utils/themeManager.ts';
import './css/intro.css';
import ShopPage from './page/Shop.tsx';

// Initialize theme on app startup
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toast>
         <Routes>
          <Route path="/" element={<App/>} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage/>} />
          <Route path='/Game' element={<Game Mode="Game"/>} />
          <Route path='/Game/tutorial' element={<Game Mode="Tutorial"/>} />
        <Route path='/Lobby' element={<Lobby/>} />
        <Route path="*" element={<NotFoundPage/>} />
        <Route path="/Multi" element={<MultiPage/>} />
        <Route path='/Documentation' element={<DocumentationPage/>} />
        <Route path='/Docs' element={<Docs/>} />
        <Route path='/v0/auth/join' element={<JoinMiddlePage/>} />
        <Route path='/settings' element={<Settings/>} />
        <Route path='/shop' element={<ShopPage/>} />
        </Routes>
      </Toast>
       
    </BrowserRouter>
  </StrictMode>,  
)
