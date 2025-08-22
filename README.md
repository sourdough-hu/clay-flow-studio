# Pottery Tracker

A mobile-first pottery studio companion to track pieces, stages, reminders, and inspirations.

## Project Info

**URL**: https://lovable.dev/projects/a5ba3b3a-6fb9-4e59-bb28-92b0f9bf15e9

## Getting Started

### Use Lovable

Simply visit the [Lovable Project](https://lovable.dev/projects/a5ba3b3a-6fb9-4e59-bb28-92b0f9bf15e9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

### Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Edit a file directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### Use GitHub Codespaces

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Capacitor iOS Wrap

This project is configured for iOS wrapping using Capacitor. The app works as a static web bundle with no Node server required at runtime.

### Prerequisites

Install Capacitor dependencies:
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/camera
```

### iOS Setup

1. **Initialize Capacitor** (if not already done):
```bash
npx cap init pottery-tracker com.yourname.potterytracker
```

2. **Build and deploy to iOS**:
```bash
# Build the web app
npm run build:ios

# Add iOS platform (first time only)
npx cap add ios

# Copy web assets to native project
npx cap copy

# Sync native dependencies
npx cap sync

# Open in Xcode for testing/deployment
npx cap open ios
```

### Development Workflow

For ongoing development:
1. Make changes to your code
2. Run `npm run build:ios && npx cap copy && npx cap sync`
3. Test in Xcode simulator or device

### Features

- **Static Web Bundle**: Built with Vite, fully static output
- **PWA Manifest**: Complete with app icons and metadata
- **iOS Meta Tags**: Optimized for iOS home screen installation
- **Native Camera**: Uses Capacitor Camera API on mobile, web fallback
- **Offline Support**: Skeleton screens prevent white flashes
- **System Fonts**: Safe typography for iOS devices

## Technologies Used

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Supabase (database, auth, storage)
- **Mobile**: Capacitor for iOS/Android wrapping
- **Deployment**: Lovable.dev platform

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a5ba3b3a-6fb9-4e59-bb28-92b0f9bf15e9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for iOS deployment
npm run build:ios

# Preview production build
npm run preview
```

## Architecture

- **Design System**: Centralized CSS variables for theming
- **Photo Service**: Unified interface for web/native camera access  
- **Client-side Routing**: React Router for seamless navigation
- **Responsive**: Mobile-first design with tablet/desktop support
- **PWA Ready**: Manifest and service worker for installation