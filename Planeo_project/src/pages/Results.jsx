import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import COUNTRIES from "@/data/countries.json";

// Number of top destinations to show
const TOP_N = 3;

// Features that can be set in preferences
const PREFERENCE_FEATURES = [
  'safety',
  'nightlife',
  'nature',
  'culture',
  'weather',
  'beaches'
];

async function generateCountryDescription(country, preferences, activePreferences) {
  try {
    const { InvokeLLM } = await import("@/api/integrations");
    
    const prompt = `You are a travel expert. Write an extremely concise, 1-2 sentence recommendation for ${country.name}.
    
    The traveler specifically values weather and culture in their travel destinations.
    
    Your response must:
    1. Be no more than 2 short sentences total (max 25 words)
    2. Mention that ${country.name} is a great match because of its preferences that i gave you why it suits my prefernces
    3. Be warm and personal but extremely brief
    4. Do NOT include any ratings or numbers
    5. Focus only on weather and culture aspects`;

    const response = await InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "Ultra-concise recommendation focusing on weather and culture (max 25 words)"
          }
        }
      }
    });

    return response.description;
  } catch (error) {
    console.error("Error generating description:", error);
    return `${country.name}'s perfect weather and rich cultural heritage align beautifully with what you value most in travel. A perfect match for your preferences.`;
  }
}

function calculateCosineSimilarity(preferences, country, activePreferences) {
 // Affordability check: if country is more expensive than user prefers → return 0 similarity //////////// bayan zadha
 if (
 (country["affordability"] / 2) < preferences["affordability"]
) {
  return 0;
} ////////////// l7d hon

  // Only consider features that are active in preferences AND are part of our preference set
  const activeFeatures = Object.entries(activePreferences)
    .filter(([feature, isActive]) => isActive && PREFERENCE_FEATURES.includes(feature) &&
    feature !== "affordability" // <— explicitly exclude affordability
    ) ///////// bayan zad hay : && feature !== "affordability" // <— explicitly exclude affordability
    .map(([feature]) => feature);

  if (activeFeatures.length === 0) {
    return 0; // No active preferences
  }

  // Calculate dot product and magnitudes using only valid features
  let dotProduct = 0;
  let prefMagnitude = 0;
  let countryMagnitude = 0;

  activeFeatures.forEach(feature => {
    const prefValue = preferences[feature] || 0;
    const countryValue = (country[feature] / 2) || 0; /////////////// /2 ktbha bayan, nnt2kd mnha

    // 🚫 Skip this feature if either value is 0 , bayan ktbo bde at2kd mno
    if (prefValue === 0 || countryValue === 0) return;
    
    dotProduct += prefValue * countryValue;
    prefMagnitude += prefValue * prefValue;
    countryMagnitude += countryValue * countryValue;
  });

  // Avoid division by zero
  if (prefMagnitude === 0 || countryMagnitude === 0) {
    return 0;
  }

  // Compute cosine similarity
  const similarity = dotProduct / (Math.sqrt(prefMagnitude) * Math.sqrt(countryMagnitude));
  
  return isNaN(similarity) ? 0 : similarity;
}

function getCountryImage(country) {
  return country.image_url || `https://source.unsplash.com/800x400/?${country.name},landmark`;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allDontCare, setAllDontCare] = useState(false);
  const [descriptions, setDescriptions] = useState({});

  useEffect(() => {
    const findMatches = async () => {
      try {
        const preferences = JSON.parse(localStorage.getItem("travelPreferences") || "{}");

        const activePreferences = JSON.parse(localStorage.getItem("travelPreferencesActive") || "{}");
        
        const hasActivePrefs = Object.keys(activePreferences).some(key => activePreferences[key]);
        setAllDontCare(!hasActivePrefs);
        
        // Calculate similarity scores for all countries
        const scoredCountries = COUNTRIES.map(country => ({
          ...country,
          similarity: calculateCosineSimilarity(preferences, country, activePreferences)
        }));
        
        // Sort by similarity (descending - higher similarity = better match)
        scoredCountries.sort((a, b) => b.similarity - a.similarity);
        
        // Take top N countries
        const topCountries = scoredCountries.slice(0, TOP_N);
        setRecommendations(topCountries);

        // Generate descriptions for each country
        const descriptionPromises = topCountries.map(async country => {
          const description = await generateCountryDescription(country, preferences, activePreferences);
          return [country.name, description];
        });

        const newDescriptions = Object.fromEntries(await Promise.all(descriptionPromises));
        setDescriptions(newDescriptions);
        setLoading(false);
      } catch (err) {
        console.error("Error finding matches:", err);
        setError("Error processing your preferences. Please try again.");
        setLoading(false);
      }
    };

    findMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-900">Finding your perfect destinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EC] p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Button
            onClick={() => navigate(createPageUrl("Preferences"))}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Back to Preferences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EC] py-16 px-4 relative text-indigo-900">
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover"
          alt="Background pattern"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-indigo-900 mb-6 font-serif">
            Your Perfect Destinations
          </h1>
          <p className="text-xl font-light max-w-2xl mx-auto">
            {allDontCare 
              ? "Carefully curated destinations awaiting your discovery" 
              : "Destinations most closely matching your preferences"}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10 mb-16">
          {recommendations.map((country, index) => (
            <motion.div
              key={country.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group"
            >
              <Card className="overflow-hidden bg-white shadow-xl h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0">
                <div className="relative">
                  <img
                    src={getCountryImage(country)}
                    alt={country.name}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=400&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent" />
                  
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 backdrop-blur-sm text-neutral-800 font-medium px-3 py-1.5 shadow-lg">
                      Match #{index + 1}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={`https://flagcdn.com/w80/${country.code?.toLowerCase() || 'xx'}.png`}
                        alt={`${country.name} flag`}
                        className="h-8 rounded shadow-lg"
                      />
                      <h2 className="text-3xl font-bold text-white">{country.name}</h2>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                      {descriptions[country.name] || "Loading description..."}
                    </p>
                  </div>
                  
                  {/* Show similarity score percentage */}
                  <div className="mt-4 text-sm text-neutral-600">
                    Similarity: {Math.round(country.similarity * 100)}%
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Button
            onClick={() => navigate(createPageUrl("Preferences"))}
            className="bg-neutral-800 hover:bg-neutral-700 text-white"
          >
            Try Different Preferences
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// JSON.parse(localStorage.getItem("travelPreferences"))