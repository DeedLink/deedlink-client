import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './User/HomePage';
import Footer from './components/footer/Footer';
import NavBar from './components/navbar/NavBar';
import StepProgressBar from './components/step-progress-bar/StepProgressBar';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen font-spectral text-white bg-black">
        <div className='max-w-boundary mx-auto w-full'>
          <NavBar />
        </div>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/element-test-env" element={<StepProgressBar />} />
          </Routes>
        </div>
        <div className='max-w-boundary mx-auto w-full'>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App
