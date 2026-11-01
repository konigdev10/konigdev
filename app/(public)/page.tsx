import Hero from "@/components/Hero";
import TechTicker from "@/components/TechTicker";
import Services from "@/components/Services";
import PortfolioProject from "@/components/PortfolioProject";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Hero />
        <TechTicker />
        <Services />
        <PortfolioProject />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
