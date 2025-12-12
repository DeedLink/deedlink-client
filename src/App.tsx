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
import QRDeedViewPage from './pages/QRDeedViewPage';
import { QRProvider } from './contexts/QRContext';
import { AlertProvider } from './contexts/AlertContext';
import { FloatingNotifyProvider } from './contexts/FloatingNotifyContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import BuyerEscrowNotification from './components/adeed/ui/BuyerEscrowNotification';
import RextroVideo from './pages/Rextro-video';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  const { language } = useLanguage();
  const fontClass = language === 'si' ? 'font-noto-serif-sinhala' : 'font-spectral';

  return (
    <div className={`flex flex-col min-h-screen ${fontClass} text-white bg-black`}>
      <div className='w-full'>
        <NavBar />
      </div>
      <LoginPopup />
      <RegistrationPopup/>
      <LoaderProvider>
        <BuyerEscrowNotification />
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
            <Route path="/qr/deed/:qrId" element={<QRDeedViewPage />} />
            <Route path="/rextro" element={<RextroVideo />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </LoaderProvider>
      <div className='w-full'>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AlertProvider>
          <ToastProvider>
            <LoginProvider>
              <WalletProvider>
                <SignupProvider>
                  <QRProvider>
                    <FloatingNotifyProvider>
                      <AppContent />
                    </FloatingNotifyProvider>
                  </QRProvider>
                </SignupProvider>
              </WalletProvider>
            </LoginProvider>
          </ToastProvider>
        </AlertProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
