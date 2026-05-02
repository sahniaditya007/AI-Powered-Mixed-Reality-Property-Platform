# HoloStay — AI-Powered Mixed Reality Property Platform

HoloStay is a mobile application that allows you to explore, inspect, and manage properties directly from your phone. It leverages lightweight Mixed Reality (MR) and AI to provide an immersive property management experience without requiring heavy VR headsets or complex infrastructure.

## 📱 Core Features

### 1. Mobile Control Dashboard
A central hub for managing all your properties.
- **Clean UI**: A modern, dark-themed interface utilizing glassmorphism aesthetics.
- **AI Insights**: A dynamic top banner alerting you to risks, such as high probability of guest complaints.
- **Property Overview**: Grid view displaying occupancy status, active issue counts, and quick access to property details.

### 2. Mobile VR Guest Experience
A 360° property walkthrough running natively on your phone.
- **No Headset Needed**: Swipe to explore a full 360° view of a property using an embedded, lightweight viewer.
- **Smart Simulation**: Toggle between "Day" and "Night" lighting conditions to see the environment in different states.
- **AI Narration**: Context-aware AI insights about the property (e.g., sunlight patterns or evening street noise levels).

### 3. AR Issue Reporter
An AI-powered camera scanner to detect and report property issues.
- **Real-time Scanning**: Open the camera and point it at an issue (e.g., a water leak).
- **AR Overlay**: Simulates an AI vision model identifying the problem with an interactive bounding box, severity label, and cost estimate.
- **Instant Task Assignment**: A single "Assign Vendor" action to instantly dispatch help and update the dashboard.

## ⚙️ Tech Stack
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack)
- **Icons**: Lucide React Native
- **VR Engine**: React Native WebView rendering lightweight A-Frame / Three.js scenes
- **Camera/AR**: Expo Camera

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed, and download the **Expo Go** app on your iOS or Android device for quick testing.

### Installation

1. Clone the repository and navigate to the project folder:
   ```bash
   git clone <your-repo-url>
   cd AI-Powered-Mixed-Reality-Property-Platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Running on your phone
- **iOS**: Open your phone's Camera app and scan the QR code displayed in your terminal. This will open the project in Expo Go.
- **Android**: Open the Expo Go app and use its built-in scanner to scan the QR code.

## 🎬 Demo Flow
To experience the primary user journey:
1. Open the app to view the **Dashboard** and note the AI warnings.
2. Tap on **"Seaview Villa"** to launch the **VR Walkthrough**. Toggle Day/Night mode and trigger the AI Narration.
3. Return to the Dashboard and tap the **Floating Camera Icon** to open the **AR Scanner**.
4. Tap **Scan**, wait for the AI to identify the leak, and click **Assign Vendor** to complete the workflow!
