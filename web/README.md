# ElderShield - Frontend Application

Production-grade web application for elderly users providing comprehensive elderly care, social connections, and emergency support.

## Overview

This is a **frontend-only** React application with mock API services. The architecture is designed to easily connect to a real backend without rewriting UI logic.

## Key Features

- **Extremely accessible**: Large fonts (18px minimum), high contrast mode, text-to-speech support
- **Low cognitive load**: Simple navigation, no hidden gestures, clear confirmations
- **Progressive Web App**: Installable, works offline with service worker
- **Voice-first**: Persistent microphone button with voice assistant UI
- **Complete flows**: Authentication, activity matching, messaging, ordering, scheduling

## Technology Stack

- **React 18** with TypeScript
- **Vite** for bundling and dev server
- **React Router** for navigation
- **Zustand** for state management
- **CSS Modules** for styling (accessibility-first)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AccessibilityControls.tsx
│   ├── ErrorBoundary.tsx
│   ├── VoiceMicButton.tsx
│   └── VoiceOverlay.tsx
├── pages/              # Page components
│   ├── AuthPhonePage.tsx
│   ├── AuthOtpPage.tsx
│   ├── HomePage.tsx
│   ├── ActivitySelectionPage.tsx
│   ├── MatchResultsPage.tsx
│   ├── ChatPage.tsx
│   ├── SchedulePage.tsx
│   ├── OrderCategoryPage.tsx
│   ├── OrderItemsPage.tsx
│   ├── OrderSummaryPage.tsx
│   └── HelpPage.tsx
├── layouts/            # Layout components
│   └── AppLayout.tsx
├── services/           # Mock API services
│   └── mockApi.ts
├── state/              # Zustand store
│   └── store.ts
├── hooks/              # Custom React hooks
│   └── useTextToSpeech.ts
├── styles/             # Global and component styles
│   ├── global.css
│   └── components.css
└── App.tsx             # Main app with routing
```

## Design Principles

1. **Large typography**: Base font size 18px, scalable to 26px
2. **Large touch targets**: Minimum 56px height for all interactive elements
3. **High contrast**: WCAG AA compliant, toggle available
4. **No dense layouts**: Single column, generous spacing
5. **No hidden gestures**: All actions are explicit buttons
6. **No hover dependencies**: All functionality works without hover
7. **Plain language**: No technical jargon, clear error messages

## Accessibility Features

- **Font size toggle**: Three presets (normal, large, extra-large)
- **High contrast mode**: Toggle in header
- **Text-to-speech**: Read messages aloud (when enabled)
- **Keyboard navigation**: Fully keyboard accessible
- **Screen reader support**: Proper ARIA labels and semantic HTML
- **Focus indicators**: Clear 4px outline on all focusable elements

## Mock Services

All backend interactions are mocked in `src/services/mockApi.ts`. To connect to a real backend:

1. Replace `mockApi` calls with real API client
2. Update API endpoints in service methods
3. Handle authentication tokens properly
4. Update error handling for network failures

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Authentication

- Phone number: Any valid format (e.g., +1234567890)
- OTP code: **123456** (hardcoded for testing)

## PWA Configuration

- Service worker: `public/service-worker.js`
- Manifest: `public/manifest.webmanifest`
- Icons: Place 192x192 and 512x512 PNG icons in `public/`

## State Management

Zustand store (`src/state/store.ts`) manages:
- User session (user, token, isAuthenticated)
- Accessibility preferences (fontSize, highContrast, textToSpeech)

All state is persisted to localStorage automatically.

## Routing

Protected routes require authentication. Unauthenticated users are redirected to `/auth/phone`.

Routes:
- `/auth/phone` - Phone number input
- `/auth/otp` - OTP verification
- `/home` - Home dashboard
- `/activities` - Activity selection
- `/matches` - Match results
- `/messages` - Chat interface
- `/schedule` - Scheduled activities
- `/order` - Order category selection
- `/order/items` - Item selection
- `/order/summary` - Order confirmation
- `/help` - Help and emergency

## Production Readiness

- ✅ Error boundaries on all pages
- ✅ Loading states for async operations
- ✅ Plain language error messages
- ✅ PWA support with service worker
- ✅ Responsive design (tablet-first)
- ✅ Accessibility compliance (WCAG AA)
- ✅ TypeScript for type safety
- ✅ Clean, documented code structure

## Future Backend Integration

When connecting to a real backend:

1. Create `src/services/api.ts` with real HTTP client
2. Replace `mockApi` imports with `api` imports
3. Update authentication flow to use real tokens
4. Add proper error handling for network issues
5. Implement WebSocket for real-time messaging
6. Add proper voice recognition API integration

The UI logic is completely decoupled from the API layer, making this transition straightforward.
