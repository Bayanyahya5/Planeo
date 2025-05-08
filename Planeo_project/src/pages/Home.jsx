
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Stunning destination backgrounds with dark overlay to ensure text visibility
const backgroundImages = [
  {
    url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80",
    location: "Santorini, Greece"
  },
  {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80",
    location: "Swiss Alps"
  },
  {
    url: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80",
    location: "Kyoto, Japan"
  },
  {
    url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80",
    location: "Switzerland Mountains"
  },
  {
    url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80",
    location: "Amalfi Coast, Italy"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 1000);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background */}
      <AnimatePresence>
        {backgroundImages.map((image, index) => (
          index === currentImageIndex && (
            <motion.div
              key={image.url}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: isTransitioning ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <div className="absolute inset-0 bg-black/60" />
              <img 
                src={image.url} 
                className="absolute inset-0 w-full h-full object-cover" 
                alt={image.location}
              />
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif mb-2 leading-tight" style={{ color: '#f5ebdd' }}>
            Planeo
          </h1>

          <p className="text-xl md:text-3xl text-cream-200/80 mb-4 font-light">
            Your journey to the perfect destination begins here
          </p>
          
          <p className="text-md md:text-2xl text-cream-200/60 mb-12 font-light">
            Discovering your perfect destination from 100+ countries
          </p>
          
          <Button
            onClick={() => navigate(createPageUrl("Budget"))}
            className="bg-cream-100/20 hover:bg-cream-100/30 text-cream-100 border border-cream-100/40 backdrop-blur-sm px-8 py-6 text-lg rounded-none"
          >
            Start Your Journey
          </Button>
        </motion.div>

        {/* Current Location Badge */}
        <div className="absolute bottom-8 right-8 text-cream-100/60 text-sm bg-black/30 px-3 py-1 backdrop-blur-sm">
          {backgroundImages[currentImageIndex].location}
        </div>
      </div>
    </div>
  );
}
