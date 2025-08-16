import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/footer/Footer';
import NavBar from './components/navbar/NavBar';
import HomePage from './pages/HomePage';
import { LoginProvider } from './contexts/LoginContext';
import LoginPopup from './components/ui/LoginPopup';
import { SignupProvider } from './contexts/SignupContext';
import RegistrationPopup from './components/registration/RegistrationPopup';
import DeedsPage from './pages/DeedsPage';
import AboutPage from './pages/AboutPage';
import MarketPage from './pages/MarketPage';

function App() {
  return (
    <BrowserRouter>
      <LoginProvider>
        <SignupProvider>
          <div className="flex flex-col min-h-screen font-spectral text-white bg-black">
            <div className='w-full'>
              <NavBar />
            </div>
            <LoginPopup />
            <RegistrationPopup/>
            <div className="flex-grow bg-white">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/deeds" element={<DeedsPage />} />
                <Route path="/about" element={<AboutPage/>} />
                <Route path="/market" element={<MarketPage />} />
              </Routes>
            </div>
            <div className='w-full'>
              <Footer />
            </div>
          </div>
        </SignupProvider>
      </LoginProvider>
    </BrowserRouter>
  );
}

export default App
