import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/home/HeroSlider";
import MissionVisionValues from "@/components/home/MissionVisionValues";
import AboutSection from "@/components/home/AboutSection";
import NewsEventsSection from "@/components/home/NewsEventsSection";
import CTASection from "@/components/home/CTASection";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "Hoş Geldiniz!",
    description: "SPOLDER Spor Politikaları Derneği'ne hoş geldiniz. Türkiye'de spor politikalarının geliştirilmesi için çalışıyoruz.",
    feature1: "500+ üye ile spor camiasının güçlü sesi",
    feature2: "Araştırmalar, etkinlikler ve politika önerileri",
    feature3: "15+ yıllık deneyim ve uzmanlık",
    buttonText: "Keşfetmeye Başla",
  });

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("hasVisitedSpolder");
    if (!hasVisited) {
      setShowWelcomeModal(true);
      localStorage.setItem("hasVisitedSpolder", "true");
    }
    
    // Load modal content from localStorage
    const stored = localStorage.getItem('spolder_welcome_modal');
    if (stored) {
      setModalContent(JSON.parse(stored));
    }
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <MissionVisionValues />
        <AboutSection />
        <NewsEventsSection />
        <CTASection />
      </main>
      <Footer />
      
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60" onClick={closeWelcomeModal} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md z-[101] animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {modalContent.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  {modalContent.description}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground/80">{modalContent.feature1}</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground/80">{modalContent.feature2}</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground/80">{modalContent.feature3}</p>
                </div>
              </div>

              <Button 
                onClick={closeWelcomeModal}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              >
                {modalContent.buttonText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
