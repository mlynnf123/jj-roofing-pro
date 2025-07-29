# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Deployment to Google Cloud Run
```bash
./deploy.sh      # Build and deploy to Cloud Run (requires gcloud CLI)
```

## Architecture Overview

### Application Type
Full-stack Next.js 14 application using App Router with TypeScript and Tailwind CSS for a roofing lead management system.

### Core Architecture Pattern
- **Frontend**: React components with local state management using hooks
- **Backend**: Next.js API routes for server-side operations
- **Data Flow**: Optimistic UI updates → API calls → Firebase persistence
- **Fallback**: Local storage when Firebase is unavailable (development mode)

### Key Architectural Components

1. **Lead Pipeline System**
   - Kanban board with drag-and-drop (components/KanbanBoard.tsx)
   - Six stages: NEW_LEAD → CONTACTED → INSPECTION_SCHEDULED → PROPOSAL_SENT → CLOSED_WON/LOST
   - Stage transitions tracked with timestamps

2. **AI Integration**
   - Claude API for parsing unstructured text into leads (services/claudeService.ts)
   - Fallback to Google Gemini API (services/geminiService.ts)
   - Extracts: firstName, lastName, address, time, claimInfo
   - API keys stored server-side only

3. **Data Persistence**
   - Primary: Firebase Firestore (lib/firebase.ts, lib/data.ts)
   - Fallback: Local storage (lib/data-local.ts)
   - Collection: "jj-pros" with documents ordered by timestamp

4. **External Integrations**
   - GroupMe webhook for automatic lead intake (api/groupme-webhook/route.ts)
   - Optional Google Calendar integration (requires additional env vars)

### API Route Pattern
All API routes follow RESTful conventions:
- `/api/leads` - CRUD operations for leads
- `/api/parse-lead` - AI text parsing
- `/api/groupme-webhook` - Webhook handler
- `/api/groupme-setup` - Bot configuration

### State Management Strategy
- Component-level state with React hooks
- Optimistic updates for immediate UI feedback
- Server validation with error rollback
- No global state management library (intentional design choice)

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to project root
- ES2018 target for modern JavaScript features

## Environment Variables

### Required for Core Functionality
```env
# Claude AI (recommended - server-side only)
ANTHROPIC_API_KEY=your_claude_api_key

# Gemini AI (fallback - server-side only) 
API_KEY=your_gemini_api_key

# Firebase Configuration (client-side accessible)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Optional Features
```env
# GroupMe Integration
GROUPME_ACCESS_TOKEN=

# Google Calendar Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_API_KEY=
```

## Key Implementation Details

### Lead Processing Flow
1. Input sources: Manual entry, GroupMe webhook, or text parsing
2. AI parsing via Gemini API extracts structured data
3. Lead created with auto-generated ID and timestamp
4. Optimistic UI update shows lead immediately
5. Async Firebase write with error handling

### Contract System Architecture
- Multi-page contract generation (components/ContractModal.tsx)
- Printable view (components/PrintableContract.tsx)
- Complex nested data structure (see types.ts: ContractDetails)
- Line items, payment schedules, and signature placeholders

### Error Handling Pattern
```typescript
try {
  // Optimistic update
  setLocalState(newValue);
  // Server operation
  await apiCall();
} catch (error) {
  // Rollback on failure
  setLocalState(previousValue);
  // User feedback
  alert('Operation failed');
}
```

### Security Considerations
- API keys never exposed to client
- Firebase rules should be configured (not in codebase)
- GroupMe webhook should validate sender
- No authentication system currently implemented

## Development Workflow

### Adding New Features
1. Define types in `types.ts`
2. Create UI components in `components/`
3. Add API route in `app/api/`
4. Update data operations in `lib/data.ts`
5. Test with local storage fallback first

### Modifying Lead Pipeline
- Stages defined in `types.ts` (LeadStage enum)
- Column configuration in `constants.ts`
- Drag-drop logic in `components/KanbanBoard.tsx`

### Working with Firebase
- Development can use local storage fallback
- Production requires valid Firebase config
- Firestore indexes may need manual creation for complex queries

## Performance Considerations
- Images optimized via Next.js Image component
- Component-level code splitting automatic
- Firestore queries ordered by timestamp (indexed)
- Memoization used for expensive operations