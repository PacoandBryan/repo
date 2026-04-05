import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './components/Catalog/CatalogPage';
import PursesPage from './pages/PursesPage';
import SweetTablePage from './pages/SweetTablePage';
import CoursesPage from './pages/CoursesPage';
import ContactPage from './pages/ContactPage';
import LoadingScreen from './components/LoadingScreen';
import StitchedTeddiesPage from './pages/StitchedTeddiesPage';
import SweetsPage from './pages/SweetsPage';
import ChocolateDelicePage from './pages/ChocolateDelicePage';
import TricotinPage from './pages/TricotinPage';
import TejidoPage from './pages/TejidoPage';
import CobijasPage from './pages/CobijasPage';
import DeveloperPage from './pages/DeveloperPage';

// Admin imports
import { AdminProvider, ProtectedAdminRoute } from './contexts/AdminContext';
import FlaskLoginPage from './pages/admin/FlaskLoginPage';
import FlaskCategoriesPage from './pages/admin/FlaskCategoriesPage';
import FlaskProductsPage from './pages/admin/FlaskProductsPage';
import FlaskDashboardPage from './pages/admin/FlaskDashboardPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import CherryBlossomChatbot from './components/CherryBlossomChatbot';

// Layout Components
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 200))
    ]).then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AdminProvider>
      <Router>
        <div className="min-h-screen bg-[#FDF8F6]">
          <Routes>
            {/* Public Routes with Layout */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="purses" element={<PursesPage />} />
              <Route path="sweet-table" element={<SweetTablePage />} />
              <Route path="sweets" element={<SweetsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="stitched-teddies" element={<StitchedTeddiesPage />} />
              <Route path="chocolate-delice" element={<ChocolateDelicePage />} />
              <Route path="tricotin" element={<TricotinPage />} />
              <Route path="tejido" element={<TejidoPage />} />
              <Route path="cobijas" element={<CobijasPage />} />
              <Route path="developer" element={<DeveloperPage />} />
            </Route>

            {/* Admin Routes with Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="login" element={<FlaskLoginPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedAdminRoute>
                    <FlaskDashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="products"
                element={
                  <ProtectedAdminRoute>
                    <FlaskProductsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedAdminRoute>
                    <FlaskCategoriesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="promotions"
                element={
                  <ProtectedAdminRoute>
                    <PromotionsPage />
                  </ProtectedAdminRoute>
                }
              />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CherryBlossomChatbot />
        </div>
      </Router>
    </AdminProvider>
  );
}

export default App