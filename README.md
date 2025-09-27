# iOS Time Tracker App

A simple and intuitive iOS app for tracking daily activities with visual pie chart representation.

## Features

- 📊 **Visual Time Tracking**: See your day as a beautiful pie chart
- ⚡ **One-Tap Tracking**: Switch between activities instantly
- 🎨 **Customizable Activities**: Add, edit, and organize your activity buttons
- 📱 **iOS Native Feel**: Haptic feedback and smooth animations
- 💾 **Persistent Storage**: Your data is automatically saved
- 🌙 **Dark Mode Support**: Seamless integration with iOS theme

## Tech Stack

- **React Native 0.81.4** with **Expo SDK 54**
- **TypeScript** for type safety
- **Zustand** for state management
- **React Native SVG** for chart visualization
- **Expo Haptics** for iOS Taptic Engine feedback

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your iOS device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/time-tracker.git
cd time-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Scan the QR code with Expo Go on your iOS device

## Usage

1. **Start Tracking**: Tap any activity button to begin tracking
2. **Add Custom Activities**: Use the "+" button to create new activities
3. **Edit Activities**: Long-press any button to edit or delete
4. **View Statistics**: The pie chart shows your time distribution for the day
5. **Available Activities**: Swipe through preset activities and tap to add them

## Project Structure

```
src/
├── components/      # React components
├── constants/       # App constants and configurations
├── hooks/          # Custom React hooks
├── services/       # Business logic services
├── store/          # Zustand state management
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Development

The app is built with Expo for easy development and testing. Key features include:

- Hot reloading for instant preview of changes
- Type checking with TypeScript
- Linting with ESLint
- Code formatting with Prettier

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.