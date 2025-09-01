import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/footer/Footer';
import NavBar from './components/navbar/NavBar';
import HomePage from './pages/HomePage';
import { LoginProvider } from './contexts/LoginContext';
import { SignupProvider } from './contexts/SignupContext';
import RegistrationPopup from './components/registration/RegistrationPopup';
import DeedsPage from './pages/DeedsPage';
import AboutPage from './pages/AboutPage';
import MarketPage from './pages/MarketPage';
import { LoaderProvider } from './contexts/LoaderContext';
import { WalletProvider } from './contexts/WalletContext';
import LoginPopup from './components/signin/LoginPopup';
import DeedRegistrationPage from './pages/DeedRegistrationPage';
import ProtectedRoute from './contexts/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <LoginProvider>
        <WalletProvider>
          <SignupProvider>
            <div className="flex flex-col min-h-screen font-spectral text-white bg-black">
              <div className='w-full'>
                <NavBar />
              </div>
              <LoginPopup />
              <RegistrationPopup/>
              <LoaderProvider>
                <div className="flex-grow bg-white">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/deeds" element={
                      <ProtectedRoute>
                        <DeedsPage />
                      </ProtectedRoute>
                      } />
                    <Route path="/about" element={<AboutPage/>} />
                    <Route path="/market" element={
                      <ProtectedRoute>
                        <MarketPage />
                      </ProtectedRoute>
                      } />
                    <Route path="/deeds-registration" element={
                      <ProtectedRoute>
                        <DeedRegistrationPage/>
                      </ProtectedRoute>
                      } />
                  </Routes>
                </div>
              </LoaderProvider>
              <div className='w-full'>
                <Footer />
              </div>
            </div>
          </SignupProvider>
        </WalletProvider>
      </LoginProvider>
    </BrowserRouter>
  );
}

export default App
