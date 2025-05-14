/**
 * Environment Configuration Loader
 * 
 * This script loads environment-specific configuration based on NODE_ENV
 * Supports: development, staging, production
 */
const fs = require('fs');
const path = require('path');

function loadEnvironmentConfig() {
  // Default to development if not specified
  const environment = process.env.NODE_ENV || 'development';
  
  // Valid environments
  const validEnvironments = ['development', 'staging', 'production'];
  
  if (!validEnvironments.includes(environment)) {
    console.warn(`Warning: Unknown environment "${environment}". Using development config.`);
    return require('./env.development.js');
  }
  
  try {
    const config = require(`./env.${environment}.js`);
    console.log(`Loaded ${environment} environment configuration`);
    
    // Apply the config to process.env
    Object.keys(config).forEach(key => {
      process.env[key] = config[key];
    });
    
    return config;
  } catch (error) {
    console.error(`Error loading ${environment} config:`, error);
    console.warn('Falling back to development config');
    return require('./env.development.js');
  }
}

module.exports = loadEnvironmentConfig(); 