import React from 'react';
import AppMenu from '../../components/Home/PageMenu';
import AppContent from '../../components/Home/PageContent';
import AppFooter from '../../components/Home/PageFooter';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col ">
      <AppMenu />

      <div className="flex-1 flex items-start justify-center">
        <AppContent />
      </div>

      <AppFooter />
    </div>
  );
};

export default HomePage;
