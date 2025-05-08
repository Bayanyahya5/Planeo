
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign } from "lucide-react";

export default function BudgetPage() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(""); // Empty string to start
  const [affordabilityScore, setAffordabilityScore] = useState(null);

  const calculateAffordabilityScore = (budget) => {
    // Convert budget to affordability score (1-5)
    // Higher budget = lower affordability score
    const numBudget = parseFloat(budget);
    if (numBudget >= 150) return 1;
    if (numBudget >= 100) return 2;
    if (numBudget >= 70) return 3;
    if (numBudget >= 40) return 4;
    return 5;
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setBudget(value);
      if (value) {
        setAffordabilityScore(calculateAffordabilityScore(value));
      } else {
        setAffordabilityScore(null);
      }
    }
  };

  const handleContinue = () => {
    if (!budget || isNaN(parseFloat(budget))) return;

    const score = calculateAffordabilityScore(budget);
    
    // Save the affordability preference
    const preferences = JSON.parse(localStorage.getItem("travelPreferences") || "{}");
    const activePreferences = JSON.parse(localStorage.getItem("travelPreferencesActive") || "{}");
    
    preferences.affordability = score;
    activePreferences.affordability = true;
    
    localStorage.setItem("travelPreferences", JSON.stringify(preferences));
    localStorage.setItem("travelPreferencesActive", JSON.stringify(activePreferences));
    
    navigate(createPageUrl("Preferences"));
  };


  return (
    <div className="min-h-screen bg-[#F8F5EC] py-12 px-4 relative text-indigo-900">
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80" 
          className="w-full h-full object-cover"
          alt="Background pattern"
        />
      </div>
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-indigo-900 mb-6 font-serif">
            What's Your Daily Budget?
          </h1>
          <p className="text-xl font-light max-w-2xl mx-auto">
            Enter your expected daily spending (excluding accommodation)
          </p>
        </motion.div>

        <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0 rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  type="text"
                  value={budget}
                  onChange={handleBudgetChange}
                  placeholder="Enter amount"
                  className="pl-10 text-lg h-14"
                />
              </div>
              
              {/* Removed the affordability level feedback */}

              <div className="text-sm">
                <p>Suggested spending includes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Daily meals and drinks</li>
                  <li>Local transportation</li>
                  <li>Activities and attractions</li>
                  <li>Shopping and souvenirs</li>
                </ul>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-end"
              >
                <Button
                  onClick={handleContinue}
                  disabled={!budget || isNaN(parseFloat(budget))}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-6 text-lg disabled:opacity-50 group"
                >
                  Continue to Preferences
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
