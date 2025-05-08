/**
 * Local implementation of Base44 integrations
 * Uses OpenAI for descriptions if VITE_OPENAI_API_KEY is set
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function InvokeLLM({ prompt, response_json_schema }) {
  // Extract current preferences from prompt if present
  const prefsMatch = prompt.match(/Current preferences .*?\n([\s\S]*?)\n\n/);
  const currentPrefs = prefsMatch ? prefsMatch[1]
    .split('\n')
    .reduce((obj, line) => {
      const [key, valueStr] = line.slice(2).split(':');
      const value = Number(valueStr.split(' ')[0]);
      if (key && !isNaN(value)) {
        obj[key.trim()] = value;
      }
      return obj;
    }, {}) : {};

  // Extract country name from prompt
  const countryMatch = prompt.match(/for (.*?)\./);
  const countryName = countryMatch ? countryMatch[1] : "this destination";

  // If no OpenAI key, return basic response
  if (!OPENAI_KEY) {
    return {
      preferences: currentPrefs,
      explanation: "Add VITE_OPENAI_API_KEY to .env to enable AI-powered descriptions",
      description: `${countryName}'s perfect weather and rich cultural heritage make it an excellent destination that aligns with your travel preferences.`
    };
  }

  try {
    // Call OpenAI API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ 
          role: "user", 
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 60
      })
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      throw new Error("No description generated");
    }

    return {
      preferences: currentPrefs,
      explanation: "AI-generated description based on your preferences",
      description
    };

  } catch (error) {
    console.error("Error calling OpenAI:", error);
    // Fallback to basic response on error
    return {
      preferences: currentPrefs,
      explanation: `Error: ${error.message}. Using fallback description.`,
      description: `${countryName}'s perfect weather and rich cultural heritage make it an excellent destination that aligns with your travel preferences.`
    };
  }
}

// Other integrations return mock responses
export const SendEmail = async () => {
  console.log("SendEmail called in local mode - no email will be sent");
  return { success: true };
};

export const UploadFile = async () => {
  console.log("UploadFile called in local mode - no file will be uploaded");
  return { url: "local-only-mock-url" };
};

export const GenerateImage = async () => {
  console.log("GenerateImage called in local mode - no image will be generated");
  return { url: "https://placehold.co/600x400?text=Local+Mode:+No+Image+Generation" };
};

export const ExtractDataFromUploadedFile = async () => {
  console.log("ExtractDataFromUploadedFile called in local mode - no data will be extracted");
  return { data: {} };
};
