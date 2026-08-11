import React from 'react';
import Admin from './components/Admin';
import Header from './components/Header';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import CustomRequest from './components/CustomRequest';
import About from './components/About';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProductPage from './components/ProductPage';
import CaseStudies from './components/CaseStudies';
import ThankYou from './components/ThankYou';
import PrivacyPolicy from './components/PrivacyPolicy';
import NotFound from './components/NotFound';
import StickyMobileCTA from './components/StickyMobileCTA';
import { Toaster } from './components/ui/sonner';
import './App.css';
import { RouterProvider, useRouter } from './lib/router';
import { useDocumentHead } from './lib/seo';

const HomePage = () => {
  useDocumentHead({
    title: 'ART By Hannaah | Custom Canvas Paintings & Portrait Commissions',
    description: 'Hand-painted custom canvas art, portraits, and sketches made just for you. Browse the gallery or commission a one-of-a-kind piece — based in Multan, shipped nationwide.',
    path: '/',
  });

  return (
    <>
      <Hero />
      <Gallery />
      <CustomRequest />
      <About />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
};

// Known top-level static routes (in addition to the dynamic /art/:id and /admin).
const KNOWN_ROUTES = ['/', '/case-studies', '/thank-you', '/privacy-policy'];

const AppRoutes = () => {
  const { path } = useRouter();

  if (path.startsWith('/admin')) {
    return <Admin />;
  }

  const pathOnly = path.split('?')[0].split('#')[0];
  const productMatch = pathOnly.match(/^\/art\/([^/]+)/);
  const normalizedPath = pathOnly.replace(/\/$/, '') || '/';
  const isKnownRoute = productMatch || KNOWN_ROUTES.includes(normalizedPath);

  let content;
  if (productMatch) {
    content = <ProductPage id={decodeURIComponent(productMatch[1])} />;
  } else if (normalizedPath === '/case-studies') {
    content = <CaseStudies />;
  } else if (normalizedPath === '/thank-you') {
    content = <ThankYou />;
  } else if (normalizedPath === '/privacy-policy') {
    content = <PrivacyPolicy />;
  } else if (normalizedPath === '/') {
    content = <HomePage />;
  } else {
    content = <NotFound />;
  }

  return (
    <div className="App pb-20 md:pb-0">
      <Header />
      <main>{content}</main>
      <Footer />
      <Toaster position="bottom-right" />
      {isKnownRoute && <StickyMobileCTA />}
    </div>
  );
};

function App() {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}

export default App;
