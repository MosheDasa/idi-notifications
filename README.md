# IDI Notifications

A desktop application for displaying notifications using Electron and React.

## Features

- Real-time notifications via WebSocket
- Multiple notification types:
  - Info notifications
  - Error notifications
  - Coins notifications
  - Free HTML notifications
  - URL HTML notifications
- Customizable notification display time
- Sound effects for different notification types
- Always-on-top notification window
- Automatic reconnection to WebSocket server
- Power management integration
- Comprehensive logging system

## Project Structure

```
src/
├── assets/           # Static assets (images, sounds)
├── components/       # React components
│   ├── coins/       # Coins notification component
│   ├── error/       # Error notification component
│   ├── free-html/   # Free HTML notification component
│   ├── info/        # Info notification component
│   ├── url-html/    # URL HTML notification component
│   └── common/      # Shared styles and utilities
├── utils/           # Application utilities
│   ├── config-manager.ts  # Configuration management
│   ├── logger.ts          # Logging system
│   ├── power-manager.ts   # Power management
│   ├── socket-manager.ts  # WebSocket management
│   ├── sound.ts           # Sound management
│   └── window-manager.ts  # Window management
├── index.tsx        # Main renderer process
├── main.ts          # Main process
├── preload.ts       # Preload script
└── index.html       # Main HTML file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd idi-notifications
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
USER_ID=your_user_id
```

## Development

To start the application in development mode:

```bash
npm run dev
# or
yarn dev
```

## Building

To build the application for production:

```bash
npm run build
# or
yarn build
```

## Configuration

The application can be configured through environment variables:

- `USER_ID`: Required. The user ID for WebSocket connection.

## Logging

The application maintains detailed logs in the following location:

- Windows: `%APPDATA%/IDI/logs/[USER_ID]/app.log`
- macOS: `~/Library/Logs/IDI/[USER_ID]/app.log`
- Linux: `~/.config/IDI/logs/[USER_ID]/app.log`

## WebSocket Server

The application expects a WebSocket server running on `ws://localhost:3001`. The server should:

1. Accept connections with a `userId` query parameter
2. Send notifications in the following format:

```typescript
interface Notification {
  id: string;
  type: "INFO" | "ERROR" | "COINS" | "FREE_HTML" | "URL_HTML";
  message: string;
  isPermanent?: boolean;
  displayTime?: number;
  amount?: number;
}
```

## License

[Your License Here]
