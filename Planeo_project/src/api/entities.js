import countries from "@/data/countries.json";

/**
 * Local implementation of Country entity
 * Provides the same interface as Base44's Country entity but uses local JSON data
 */
export const Country = {
  async list() {
    return countries;
  },
  
  async getByName(name) {
    return countries.find(country => 
      country.name.toLowerCase() === name.toLowerCase()
    );
  }
};

// No auth implementation needed in local mode
export const User = {
  async getCurrent() {
    return null;
  }
};
