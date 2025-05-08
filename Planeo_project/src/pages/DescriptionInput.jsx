
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Loader2 } from "lucide-react";

export default function DescriptionInputPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const currentPreferences = JSON.parse(localStorage.getItem("travelPreferences") || "{}");
      const currentActivePreferences = JSON.parse(localStorage.getItem("travelPreferencesActive") || "{}");
      
      // Create the prompt for the LLM
      const prompt = `
        You are a travel preference analyzer. I'll give you a user's current preferences and their description of their ideal destination. 
        Analyze the description and suggest how to modify their preferences to better match their desires.

        Current preferences (1-5 scale):
        ${Object.entries(currentPreferences)
          .map(([key, value]) => `- ${key}: ${value}${currentActivePreferences[key] ? '' : ' (inactive)'}`)
          .join('\n')}

        User's description: "${description}"

        Based on this description, suggest modifications to these preferences:
        - safety (1-5): how important is safety and security
        - nightlife (1-5): importance of evening entertainment and social scene
        - nature (1-5): desire for natural beauty and outdoor experiences
        - culture (1-5): interest in local traditions and cultural experiences
        - weather (1-5): preference for warm/sunny (5) vs cold/cool (1) weather
        - beaches (1-5): importance of coastal areas and beach access

        For each preference:
        1. Only modify if the description clearly indicates a different preference level
        2. If a preference isn't mentioned or implied, keep it unchanged
        3. Provide a brief explanation of why you changed each preference

        Return in JSON format with two fields:
        1. "preferences": object with the modified preference values
        2. "explanation": string explaining the significant changes made
      `;
      
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            preferences: {
              type: "object",
              properties: {
                safety: { type: "integer", minimum: 1, maximum: 5 },
                nightlife: { type: "integer", minimum: 1, maximum: 5 },
                nature: { type: "integer", minimum: 1, maximum: 5 },
                culture: { type: "integer", minimum: 1, maximum: 5 },
                weather: { type: "integer", minimum: 1, maximum: 5 },
                beaches: { type: "integer", minimum: 1, maximum: 5 }
              }
            },
            explanation: {
              type: "string",
              description: "Explanation of the significant changes made to preferences"
            }
          }
        }
      });
      
      // Update preferences based on AI analysis
      const newPreferences = { ...currentPreferences };
      const newActivePreferences = { ...currentActivePreferences };
      
      // Update preferences that were modified by the AI
      Object.entries(response.preferences).forEach(([key, value]) => {
        if (value !== currentPreferences[key]) {
          newPreferences[key] = value;
          newActivePreferences[key] = true; // Activate preference if it was modified
        }
      });
      
      // Save updated preferences
      localStorage.setItem("travelPreferences", JSON.stringify(newPreferences));
      localStorage.setItem("travelPreferencesActive", JSON.stringify(newActivePreferences));
      localStorage.setItem("aiRecommendations", JSON.stringify({
        explanation: response.explanation
      }));
      
      // Navigate to results
      navigate(createPageUrl("Results"));
    } catch (err) {
      console.error("Error processing destination description:", err);
      setError("Something went wrong analyzing your description. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EC] py-12 px-4 relative">
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
          <h1 className="text-5xl font-bold text-neutral-800 mb-6 font-serif">
            Describe Your Dream Destination
          </h1>
          <p className="text-xl text-neutral-600 font-light max-w-2xl mx-auto">
            Tell us more about the place you're looking for
          </p>
        </motion.div>

        <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0 rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="text-neutral-700 mb-2 block">
                  What's your ideal destination like? Be as detailed as possible.
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="I'm looking for a place with beautiful beaches and warm weather. I want to experience local culture and enjoy the nightlife..."
                  className="h-48 text-lg resize-none"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  onClick={() => navigate(createPageUrl("Preferences"))}
                  variant="outline"
                  className="border-neutral-300 text-neutral-700"
                >
                  Back to Preferences
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!description.trim() || isProcessing}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-6 text-lg disabled:opacity-50 group"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Update My Preferences
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="mt-6 text-center text-sm text-neutral-500">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Our AI will analyze your description to refine your preferences</span>
          </div>
        </div>
      </div>
    </div>
  );
}
