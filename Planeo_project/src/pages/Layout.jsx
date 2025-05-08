
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className={`min-h-screen ${currentPageName === "Home" ? 'bg-black text-cream-100' : 'bg-[#F8F5EC] text-neutral-800'}`}>
      {/* Navigation bar always in light mode with dark text */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-neutral-800" />
              <span className="font-serif text-neutral-800 font-medium">Planeo</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="pt-16">
        {children}
      </main>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap');
        
        body {
          background: ${currentPageName === "Home" ? '#000' : '#F8F5EC'};
          color: ${currentPageName === "Home" ? '#F5E6D3' : '#1A1A1A'};
          font-family: 'Cormorant Garamond', serif;
        }
        
        .text-cream-100 {
          color: #F5E6D3;
        }
        
        .text-cream-200 {
          color: #E6D5C1;
        }
        
        .bg-cream-100 {
          background-color: #F5E6D3;
        }
      `}</style>
    </div>
  );
}
