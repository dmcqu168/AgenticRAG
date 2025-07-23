// Default configuration
const config = {
  // Default API URL (will be overridden by environment variables)
  API_URL: 'http://localhost:8000',
};

// Override with environment variables if they exist
const env = process.env;

if (env.API_URL) {
  config.API_URL = env.API_URL;
}

export default config;
