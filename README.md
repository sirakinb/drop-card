# DropCard - AI-Powered Business Card App

DropCard is a modern React Native app that allows users to create, share, and manage digital business cards with AI-powered features.

## Features

- **Digital Business Cards**: Create beautiful, customizable digital business cards
- **QR Code Sharing**: Generate QR codes for easy card sharing
- **Contact Management**: Store and organize contacts you meet
- **AI Follow-Up**: Generate smart follow-up messages using AI
- **Voice Notes**: Add voice notes to contacts for better context
- **Multiple Sharing Options**: Share via QR code, link, AirDrop, or social media

## Screenshots

The app includes the following screens:
- Onboarding flow
- Card creation and editing
- Card preview with QR code
- Contact management
- AI-powered follow-up messages
- Scanning functionality
- Settings and preferences

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DropCard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go app on your mobile device

### Running on Different Platforms

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web**: Press `w` in the terminal

## Project Structure

```
DropCard/
├── App.js                 # Main app component with navigation
├── src/
│   ├── screens/          # All screen components
│   │   ├── OnboardingScreen.js
│   │   ├── CreateCardScreen.js
│   │   ├── CardPreviewScreen.js
│   │   ├── ContactsScreen.js
│   │   ├── AddContactScreen.js
│   │   ├── AIFollowUpScreen.js
│   │   ├── ShareScreen.js
│   │   ├── ScanScreen.js
│   │   └── SettingsScreen.js
│   ├── components/       # Reusable components
│   └── utils/           # Utility functions
├── assets/              # Images and icons
└── package.json
```

## Key Dependencies

- **React Navigation**: For navigation between screens
- **Expo Image Picker**: For photo selection
- **Expo Vector Icons**: For consistent iconography
- **React Native Safe Area Context**: For safe area handling

## Features Implementation

### 1. Onboarding
- Simple name input to get started
- Clean, modern UI design

### 2. Card Creation
- Form-based card creation
- Photo upload functionality
- Real-time preview

### 3. Contact Management
- Add contacts manually or via scanning
- Voice note support
- Contact list with search

### 4. AI Follow-Up
- Generate contextual follow-up messages
- Copy, edit, or schedule messages
- Multiple message variations

### 5. Sharing
- QR code generation
- Multiple sharing methods
- Social media integration

## Future Enhancements

- Real QR code scanning with camera
- Actual AI integration for follow-up messages
- Cloud sync and backup
- Advanced card templates
- Analytics and insights
- Team collaboration features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository. 