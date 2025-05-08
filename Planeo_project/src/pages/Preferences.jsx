
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const PREFERENCES = [
  { id: "safety", label: "Safety", icon: "🛡️", description: "Personal security and overall safety" },
  { id: "nightlife", label: "Nightlife", icon: "🌙", description: "Entertainment and evening activities" },
  { id: "nature", label: "Natural Beauty", icon: "🌿", description: "Landscapes and outdoor experiences" },
  { id: "culture", label: "Cultural Experience", icon: "🎭", description: "Local traditions and customs" },
  { id: "weather", label: "Weather", icon: "☀️", description: "Climate and seasonal conditions" },
  { id: "beaches", label: "Beaches", icon: "🏖️", description: "Coastal areas and beach quality" }
];

export default function PreferencesPage() {
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState(() => {
    return PREFERENCES.reduce((acc, pref) => ({ ...acc, [pref.id]: 1 }), {});
  });
  
  const [activePreferences, setActivePreferences] = useState(() => {
    return PREFERENCES.reduce((acc, pref) => ({ ...acc, [pref.id]: true }), {});
  });

  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const prevPrefs = JSON.parse(localStorage.getItem("travelPreferences") || "{}"); //////////// bayan ktbhn
    const prevActive = JSON.parse(localStorage.getItem("travelPreferencesActive") || "{}");
  
    // const mergedPrefs = { ...prevPrefs, ...preferences };
    const { affordability } = prevPrefs;
    const mergedPrefs = { ...preferences, ...(affordability !== undefined && { affordability }) };

    const mergedActive = { ...prevActive, ...activePreferences }; 
    
    localStorage.setItem("travelPreferences", JSON.stringify(mergedPrefs));
    localStorage.setItem("travelPreferencesActive", JSON.stringify(mergedActive));
  }, [preferences, activePreferences]);////////////// lhon

  //   localStorage.setItem("travelPreferences", JSON.stringify(preferences));
  //   localStorage.setItem("travelPreferencesActive", JSON.stringify(activePreferences));
  // }, [preferences, activePreferences]);

  const handleSliderChange = (prefId, value) => {
    setPreferences(prev => ({ ...prev, [prefId]: value[0] }));
    
    if (!activePreferences[prefId]) {
      setActivePreferences(prev => ({...prev, [prefId]: true}));
    }
  };
  
  // const togglePreferenceActive = (prefId) => { ////// bayan m7aha
  //   setActivePreferences(prev => ({
  //     ...prev, 
  //     [prefId]: !prev[prefId]
  //   }));
  // }; ///// lhon

  const togglePreferenceActive = (prefId) => { ///// bayan zadha
    setActivePreferences(prev => {
      const newActive = { ...prev, [prefId]: !prev[prefId] };
      
      // If user turned it OFF, set preference to 0
      if (!newActive[prefId]) {
        setPreferences(prevPrefs => ({
          ...prevPrefs,
          [prefId]: 0
        }));
      }
  
      return newActive;
    });
  }; //// lhon
  

  const handleSubmit = () => {
    navigate(createPageUrl("CountryComparison")); // Changed to go to country comparison instead
  };

  const handleReset = () => {
    setPreferences(PREFERENCES.reduce((acc, pref) => ({ ...acc, [pref.id]: 1 }), {}));
    setActivePreferences(PREFERENCES.reduce((acc, pref) => ({ ...acc, [pref.id]: true }), {}));
  };

  const hasPreferences = Object.keys(activePreferences).some(key => activePreferences[key] === true);

  return (
    <div className="min-h-screen bg-[#F8F5EC] py-12 px-4 relative text-indigo-900">
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover"
          alt="Background pattern"
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-indigo-900 mb-6 font-serif">
            Craft Your Perfect Journey
          </h1>
          <p className="text-xl font-light max-w-2xl mx-auto">
            Rate what matters to you, from 1 to 5, or mark as "Not Interesting"
          </p>
        </motion.div>

        <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0 rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-neutral-800">Your Preferences</h2>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="border-neutral-300 text-neutral-600 hover:bg-neutral-100"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>

            <div className="space-y-6">
              {PREFERENCES.map((pref, index) => (
                <motion.div
                  key={pref.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white border border-neutral-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                    activeCategory === pref.id ? 'ring-2 ring-neutral-400' : ''
                  } ${!activePreferences[pref.id] ? 'opacity-60' : ''} transform hover:-translate-y-1`}
                  onClick={() => setActiveCategory(pref.id)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl p-2 bg-neutral-100 rounded-lg">
                          {pref.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <label className="text-xl font-medium text-neutral-800">{pref.label}</label>
                            {!activePreferences[pref.id] && (
                              <Badge variant="outline" className="text-neutral-600 border-neutral-300">
                                Not Interesting
                              </Badge>
                            )}
                          </div>
                          <p className="text-neutral-600">{pref.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="mr-2 text-sm text-neutral-500">Consider this</span>
                        <Switch 
                          checked={activePreferences[pref.id]} 
                          onCheckedChange={() => togglePreferenceActive(pref.id)}
                        />
                      </div>
                    </div>

                    {activePreferences[pref.id] && (
                      <div className="flex items-center gap-4 mt-4 mb-6">
                        <span className="text-sm font-medium w-16">1</span>
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <Slider
                            value={[preferences[pref.id]]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(value) => handleSliderChange(pref.id, value)}
                          />
                          <div className="mt-3">
                            <span className="text-lg font-semibold bg-white px-3 py-1 rounded-md shadow-sm">
                              {preferences[pref.id]}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">5</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex justify-end"
            >
              <Button
                onClick={handleSubmit}
                disabled={!hasPreferences}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-6 text-lg disabled:opacity-50 group"
              >
                Find My Perfect Match
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  );
}
