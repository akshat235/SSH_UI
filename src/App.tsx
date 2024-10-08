import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar'; 
import HomePage from './pages/Homepage/Homepage';
import Toaster from './components/Toaster';
import Signup from './pages/SignUp/Signup';
import PortfolioPage from './pages/Portfolio/Portfolio';
import StockDetailsPage from './pages/StockDetails/StockDetails';

// Lazy-loaded components
const Login = React.lazy(() => import('./pages/Login/Login'));

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 },
};

const AnimatedSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimatePresence mode="wait">
    <m.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-auto"
    >
      {children}
    </m.div>
  </AnimatePresence>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin"></div>
  </div>
);

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token'); 
  return !!token; 
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>; 
};

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated() && location.pathname === '/') {
      <Navigate to="/login" />;
    }
  }, [location]);

  return (
    <div className="relative w-[100vw] min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className='flex-1 flex items-center justify-center'>
        <div className="px-4">
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    isAuthenticated() ? (
                      <AnimatedSuspense>
                        <HomePage />
                      </AnimatedSuspense>
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />

                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AnimatedSuspense>
                        <Login />
                      </AnimatedSuspense>
                    </Suspense>
                  }
                />

                <Route
                  path="/signup"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AnimatedSuspense>
                        <Signup />
                      </AnimatedSuspense>
                    </Suspense>
                  }
                />

                {/* Protect the Portfolio route */}
                <Route
                  path="/portfolio"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnimatedSuspense>
                          <PortfolioPage />
                        </AnimatedSuspense>
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/stock/:symbol"
                  element={
                    <AnimatedSuspense>
                      <StockDetailsPage />
                    </AnimatedSuspense>
                  }
                />
              </Routes>
            </AnimatePresence>
          </LazyMotion>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

const WrappedApp: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
