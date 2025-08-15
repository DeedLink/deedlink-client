import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/footer/Footer';
import NavBar from './components/navbar/NavBar';
import StepProgressBar from './components/step-progress-bar/StepProgressBar';
import HomePage from './pages/HomePage';
import { LoginProvider } from './contexts/LoginContext';
import LoginPopup from './components/ui/LoginPopup';

function App() {
  return (
    <BrowserRouter>
      <LoginProvider>
        <div className="flex flex-col min-h-screen font-spectral text-white bg-black">
          <div className='w-full'>
            <NavBar />
          </div>
          <LoginPopup />
          <div className="flex-grow bg-white">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/element-test-env" element={<StepProgressBar />} />
            </Routes>
          </div>
          <div className='w-full'>
            <Footer />
          </div>
        </div>
      </LoginProvider>
    </BrowserRouter>
  );
}

export default App
