import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>CarbonScope AI</title>
        <meta name="description" content="Visualisation de l'empreinte carbone des modèles d'IA générative" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;
