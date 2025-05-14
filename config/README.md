# Environment Configuration

This directory contains environment-specific configuration files for the IDI Notifications application.

## Available Environments

The application supports three environments:

1. **Development** (default): Local development environment
2. **Staging**: Testing environment with staging APIs
3. **Production**: Production environment with live APIs

## Configuration Files

Each environment has its own configuration file:

- `env.development.js` - Development environment settings
- `env.staging.js` - Staging environment settings
- `env.production.js` - Production environment settings

## Usage

### Running the Application

To run the application with a specific environment:

```bash
# Development environment (default)
npm run dev

# Staging environment
npm run dev:staging

# Production environment
npm run dev:prod
```

### Building the Application

To build the application for a specific environment:

```bash
# Development environment
npm run build:dev

# Staging environment
npm run build:staging

# Production environment
npm run build:prod
```

### Creating Distributables

To create a distributable for a specific environment:

```bash
# Development environment
npm run dist:win:dev

# Staging environment
npm run dist:win:staging

# Production environment
npm run dist:win:prod
```

## Adding or Modifying Environment Variables

To add or modify an environment variable:

1. Add the variable to all environment files (`env.development.js`, `env.staging.js`, `env.production.js`) with appropriate values
2. If the variable needs to be accessed in TypeScript, add it to the `ImportMetaEnv` interface in `src/env.d.ts`
3. Use the variable in your code by accessing `process.env.VARIABLE_NAME`

## SSL Certificate Validation

- In the development environment, SSL certificate validation is disabled by setting `NODE_TLS_REJECT_UNAUTHORIZED="0"`
- In staging and production environments, SSL certificate validation is enabled by setting `NODE_TLS_REJECT_UNAUTHORIZED="1"`

## WebSocket Configuration

The WebSocket connection endpoint is configured through the `VITE_API_NOTIFICATIONS_ENDPOINT` environment variable. This variable is accessible through the config object as `config.API_NOTIFICATIONS_ENDPOINT`. 