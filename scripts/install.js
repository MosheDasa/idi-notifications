const fs = require('fs');
const path = require('path');

// Default configuration
const defaultConfig = {
  API_URL: 'http://localhost:3001/notifications/check',
  API_POLLING_INTERVAL: 10000,
  LOG: true,
  userId: '97254'
};

function createConfig() {
  try {
    // Create config directory
    const configDir = path.join(
      process.env.USERPROFILE || '',
      'idi-notifications-config'
    );
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Create config file
    const configPath = path.join(configDir, 'config.json');
    
    // If config doesn't exist, create it with default values
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('Configuration file created successfully at:', configPath);
    } else {
      console.log('Configuration file already exists at:', configPath);
    }
  } catch (error) {
    console.error('Error creating configuration:', error);
    process.exit(1);
  }
}

// Run the installation
createConfig(); 