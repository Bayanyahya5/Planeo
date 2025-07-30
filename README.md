# Planeo - Travel Destination Finder

An interactive app that helps you find your perfect travel destination based on your preferences.

## Features

- Rate your travel preferences (weather, culture, nature, etc.)
- Get personalized destination recommendations
- View AI-generated descriptions for each match
- Compare different countries based on your criteria

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up OpenAI integration (optional):
   - Create an account at https://platform.openai.com/
   - Generate an API key at https://platform.openai.com/api-keys
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to `.env`:
     ```
     VITE_OPENAI_API_KEY=your-key-here
     ```
   Note: The app works without an API key, but will use basic descriptions instead of AI-generated ones.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Local Data

The app uses local JSON data for country information, making it fast and reliable without external dependencies. You can find and modify the country data in `src/data/countries.json`.

## Contributing

Feel free to open issues and pull requests!
