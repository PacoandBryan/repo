import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../NavBar';
import Footer from '../Footer';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDF8F6]">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
