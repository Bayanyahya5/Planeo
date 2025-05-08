import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Country } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import COUNTRIES from "@/data/countries.json";

// Create dynamic learning pairs based on user preferences
function generateLearningPairs(currentPreferences = {}, activePreferences = {}, countries = []) {
  // Define learning dimensions we want to test
  const dimensions = [
    // Nature vs Nightlife
    {
      axis: ["nature", "nightlife"],
      highNatureCountries: countries.filter(c => c.nature >= 8 && c.nightlife <= 5),
      highNightlifeCountries: countries.filter(c => c.nightlife >= 8 && c.nature <= 7)
    },
    // Culture vs Beaches
    {
      axis: ["culture", "beaches"],
      highCultureCountries: countries.filter(c => c.culture >= 8 && c.beaches <= 5),
      highBeachCountries: countries.filter(c => c.beaches >= 8 && c.culture <= 7)
    },
    // Safety vs Adventure (combination of nature + nightlife)
    {
      // axis: ["safety", "nature"], ///// bayan m7ahn
      // highSafetyCountries: countries.filter(c => c.safety >= 8 && c.nightlife <= 5),
      // highAdventureCountries: countries.filter(c => c.safety <= 6 && c.nature >= 8) ///////// lhon

      axis: ["safety", "weather"], ///// bayan zadha
      highSafetyCountries: countries.filter(c => c.safety >= 8 && c.weather <= 6),
      highAdventureCountries: countries.filter(c => c.safety <= 6 && c.weather >= 8)
    } ///// lhon
  ];
  
  const pairs = [];
  
  // Generate a pair for each dimension
  dimensions.forEach(dimension => {
    // For first group (e.g. nature focused countries)
    let group1 = dimension[Object.keys(dimension)[1]]; // e.g. highNatureCountries
    
    // For second group (e.g. nightlife focused countries)
    let group2 = dimension[Object.keys(dimension)[2]]; // e.g. highNightlifeCountries
    
    // If we don't have enough countries in either group, skip this dimension
    if (group1.length === 0 || group2.length === 0) {
      return;
    }
    
    // Pick a random country from each group
    const country1 = group1[Math.floor(Math.random() * group1.length)];
    const country2 = group2[Math.floor(Math.random() * group2.length)];
    
    // Create the pair
    const pair = {
      axis: dimension.axis,
      pair: [
        {
          name: country1.name,
          image: country1.image_url || `https://source.unsplash.com/800x400/?${country1.name},landmark`,
          highlights: [
            `Strong in ${dimension.axis[0]}`,
            country1.safety > 7 ? "Safe environment" : "Adventure-oriented",
            country1.culture > 7 ? "Rich cultural experiences" : "Modern atmosphere"
          ],
          strong: { [dimension.axis[0]]: country1[dimension.axis[0]] },
          weak: { [dimension.axis[1]]: country1[dimension.axis[1]] }
        },
        {
          name: country2.name,
          image: country2.image_url || `https://source.unsplash.com/800x400/?${country2.name},landmark`,
          highlights: [
            `Strong in ${dimension.axis[1]}`,
            country2.weather > 7 ? "Great weather" : "Seasonal climate",
            country2.beaches > 7 ? "Beautiful beaches" : "Urban experiences"
          ],
          strong: { [dimension.axis[1]]: country2[dimension.axis[1]] },
          weak: { [dimension.axis[0]]: country2[dimension.axis[0]] }
        }
      ],
      learning: dimension.axis
    };
    
    pairs.push(pair);
  });
  
  return pairs;
}

export default function CountryComparisonPage() {
  const navigate = useNavigate();
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [preferences, setPreferences] = useState({});
  const [activePreferences, setActivePreferences] = useState({});
  const [learningPairs, setLearningPairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        // Use all available countries for comparison
        const countries = COUNTRIES;
        
        // Load existing preferences
        const savedPrefs = JSON.parse(localStorage.getItem("travelPreferences") || "{}");
        const savedActivePrefs = JSON.parse(localStorage.getItem("travelPreferencesActive") || "{}");
        setPreferences(savedPrefs);
        setActivePreferences(savedActivePrefs);
        
        // Generate learning pairs based on actual country data
        const pairs = generateLearningPairs(savedPrefs, savedActivePrefs, countries);
        setLearningPairs(pairs);
        setLoading(false);
      } catch (error) {
        console.error("Error loading countries:", error);
        setLoading(false);
      }
    };
    
    loadCountries();
  }, []);

  const updatePreferences = (countryIndex) => {
    if (learningPairs.length === 0 || currentPairIndex >= learningPairs.length) {
      return;
    }

    const pair = learningPairs[currentPairIndex];
    const selectedCountry = pair.pair[countryIndex];
    const otherCountry = pair.pair[countryIndex === 0 ? 1 : 0];
    
    // Update preferences based on what was chosen
    const newPreferences = { ...preferences };
    const newActivePreferences = { ...activePreferences };
    
    // For each learning dimension in this pair
    pair.axis.forEach(dimension => {
      // If selected country is strong in this dimension, increase preference
      if (selectedCountry.strong[dimension]) {
        // Calculate the weight of preference change (reduced to 25% of original)
        // const strength = (selectedCountry.strong[dimension] - (otherCountry.weak[dimension] || 5)) / 10; //// mn hon lt7t m7aha bayan (3mlha a5dr msh m7aha)
        
        // // Apply only 25% weight to comparison choices (instead of full weight)
        // const adjustedStrength = strength * 0.25 / 0.25; /////////// /0.25 ktbha bayan, nnt2kd mnha
        
        // const currentValue = (newPreferences[dimension] / 2) || 3; /////////////// /2 ktbha bayan, nnt2kd mnha
        
        // // Adjust preference, bounded between 1-5
        // newPreferences[dimension] = Math.max(1, Math.min(5, currentValue + adjustedStrength)); ///////////// lhon

        const currentValue = newPreferences[dimension] ?? 3; //// mn hon bayan zad
        const otherStrongFeature = Object.keys(otherCountry.strong)[0];
        const otherCurrentValue = newPreferences[otherStrongFeature] ?? 3;
        let selectedIncrease = 0;
        let otherIncrease = 0;
        
        if (currentValue === 0){
          if(otherCurrentValue >= 3){
            otherIncrease = -1;
            selectedIncrease = 2;
            newActivePreferences[dimension] = true;
          }
        }
        else if (currentValue == 1){
          if(otherCurrentValue > 1){
            otherIncrease = -1;
          }
          selectedIncrease = 1;
        }
        else if (currentValue == 2){
          if(otherCurrentValue > 2){
            otherIncrease = -1;
          }
          selectedIncrease = 1;
        } 
        else if (currentValue == 3){
          if(otherCurrentValue >= 3){
            otherIncrease = -0.5;
            selectedIncrease = 0.5;
          }
        } 
        else if (currentValue == 4){
          if(otherCurrentValue >= 4){
            otherIncrease = -0.5; //// ymkn n4yrha
            selectedIncrease = 0.5;
          }
        }
        // if it's 5 or not matched, increase stays 0
        newPreferences[dimension] = Math.min(5, currentValue + selectedIncrease); 
        if(otherCurrentValue + otherIncrease != 0){
          newPreferences[otherStrongFeature] = Math.max(1, otherCurrentValue + otherIncrease); /////// lhon
        }
      }
    });
    
    // Save updated preferences
    localStorage.setItem("travelPreferences", JSON.stringify(newPreferences));
    localStorage.setItem("travelPreferencesActive", JSON.stringify(newActivePreferences));
    setPreferences(newPreferences);
    setActivePreferences(newActivePreferences);
    
    // Move to next pair or finish
    if (currentPairIndex < learningPairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      navigate(createPageUrl("Results"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EC] text-indigo-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-900">Finding destinations to compare...</p>
        </div>
      </div>
    );
  }

  if (learningPairs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EC] p-4 text-indigo-900">
        <div className="text-center max-w-md">
          <p className="text-indigo-900 text-lg mb-4">
            Not enough country data available for comparison. Please try again later.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Results"))}
            className="bg-indigo-700 hover:bg-indigo-800 text-white"
          >
            Skip to Results
          </Button>
        </div>
      </div>
    );
  }

  const currentPair = learningPairs[currentPairIndex];

  return (
    <div className="min-h-screen bg-[#F8F5EC] py-12 px-4 relative text-indigo-900">
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover"
          alt="Background pattern"
        />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-indigo-900 mb-6 font-serif">
            Which Destination Appeals More?
          </h1>
          <p className="text-xl font-light text-indigo-900 max-w-2xl mx-auto">
            Choose between these destinations to help us understand your preferences better
          </p>
          <p className="text-indigo-700 mt-2">
            Choice {currentPairIndex + 1} of {learningPairs.length}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <AnimatePresence mode="wait">
            {currentPair.pair.map((country, idx) => (
              <motion.div
                key={`${currentPairIndex}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className="overflow-hidden h-full bg-white/80 backdrop-blur-md border-0 shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
                  onClick={() => updatePreferences(idx)}
                >
                  <div className="relative h-64">
                    <img
                      src={country.image}
                      alt={country.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h2 className="text-2xl font-bold text-white mb-2">{country.name}</h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      <h3 className="font-medium text-lg text-indigo-900">Highlights:</h3>
                      <ul className="space-y-2">
                        {country.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-300 mt-1.5">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
