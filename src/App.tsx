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
import { ToastProvider } from './contexts/ToastContext';
import ADeedPage from './pages/ADeedPage';
import { QRProvider } from './contexts/QRContext';
import { AlertProvider } from './contexts/AlertContext';

function App() {
  return (
    <BrowserRouter>
      <AlertProvider>
        <ToastProvider>
          <LoginProvider>
            <WalletProvider>
              <SignupProvider>
                <QRProvider>
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
                          <Route path="/deed/:deedNumber" element={
                            <ProtectedRoute>
                              <ADeedPage/>
                            </ProtectedRoute>
                            } />
                        </Routes>
                      </div>
                    </LoaderProvider>
                    <div className='w-full'>
                      <Footer />
                    </div>
                  </div>
                </QRProvider>
              </SignupProvider>
            </WalletProvider>
          </LoginProvider>
        </ToastProvider>
      </AlertProvider>
    </BrowserRouter>
  );
}

export default App
