module.exports = {
  VITE_API_URL: "http://localhost:8080/api",
  VITE_API_NOTIFICATIONS_ENDPOINT: "http://localhost:8083/idiwebsocket",
  VITE_API_POLLING_INTERVAL: "30000",
  VITE_NOTIFICATION_TIMEOUT_DEFAULT: "10000",
  VITE_NOTIFICATION_TIMEOUT_URL_HTML: "20000",
  VITE_NOTIFICATION_TIMEOUT_COINS: "15000",
  VITE_NOTIFICATION_TIMEOUT_ERROR: "15000",
  VITE_NOTIFICATION_WIDTH: "400",
  VITE_NOTIFICATION_POSITION_BOTTOM: "10",
  VITE_NOTIFICATION_POSITION_RIGHT: "10",
  VITE_NOTIFICATION_GAP: "10",
  VITE_WINDOW_WIDTH: "420",
  VITE_WINDOW_HEIGHT: "600",
  VITE_WINDOW_MARGIN: "20",
  VITE_LOG: "true",
  VITE_OPEN_DEV_TOOLS: "true",
  NODE_TLS_REJECT_UNAUTHORIZED: "0" // Disable SSL certificate validation in development
}; 