# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI4AgriWeather is a comprehensive smart agricultural platform designed for African farmers, particularly those in Tanzania and East Africa. It provides multilingual weather intelligence, crop management tools, and AI-powered agricultural insights.

## Development Commands

### Local Development
```bash
npm install                 # Install dependencies
npm run dev                 # Start development server (port 8080)
npm run build              # Build for production
npm run preview            # Preview production build locally
npm run start              # Start production server
npm run lint               # Run ESLint
```

### Environment Setup
Create a `.env.local` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18.3 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom agricultural theme
- **State Management**: React Query (TanStack Query)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Internationalization**: i18next (Korean, English, Swahili, French, Nepali, Uzbek)
- **Backend Functions**: Supabase Edge Functions
- **Automation**: n8n workflows for document processing and AI integration

### Project Structure
```
insights-lm-public/
├── src/
│   ├── components/
│   │   ├── farm/          # Agricultural features (Dashboard, Weather, Crops, Chat)
│   │   ├── auth/          # Authentication components
│   │   ├── ui/            # Reusable UI components (shadcn/ui)
│   │   └── ...
│   ├── contexts/          # React contexts (AuthContext)
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization config and translations
│   ├── integrations/      # External service integrations (Supabase)
│   └── pages/             # Route-level components
├── supabase/
│   ├── functions/         # Edge functions for backend logic
│   └── migrations/        # Database schema migrations
└── n8n/                   # Workflow automation files
```

### Key Features & Components

1. **Weather Intelligence** (`WeatherCenter.tsx`)
   - 24-hour, 7-day, and seasonal forecasts
   - Agricultural metrics (evapotranspiration, soil moisture, UV index)
   - Weather-based farming recommendations

2. **Crop Management** (`CropManagement.tsx`)
   - 22 local crop varieties management
   - Planting calendar for Masika and Vuli seasons
   - Market price tracking

3. **AI Agricultural Assistant** (`AgriChat.tsx`)
   - Multilingual chat support
   - Integration with LLM via n8n workflows
   - Context-aware farming advice

4. **Knowledge Base** (`KnowledgeBase.tsx`, `KnowledgeEntry.tsx`)
   - Agricultural documentation and best practices
   - Document processing and vector search capabilities
   - Support for multiple file types (PDF, TXT, DOC)

### Database Schema
Key tables in Supabase:
- `profiles`: User profiles with agricultural preferences
- `notebooks`: Agricultural knowledge entries
- `sources`: Document sources and file uploads
- `n8n_chat_histories`: AI chat conversation history
- `documents`: Vector embeddings for semantic search

### Authentication Flow
- Uses Supabase Auth with email/password
- Protected routes via `ProtectedRoute` component
- Auth state managed by `AuthContext`
- Row Level Security (RLS) policies protect user data

### Deployment
- Primary deployment on Railway
- Docker support included
- Static file serving via Express.js
- Environment variables required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Development Guidelines

### Path Aliases
- Use `@/` for imports from the `src/` directory
- Example: `import { Button } from '@/components/ui/button'`

### TypeScript Configuration
- Non-strict mode enabled (see tsconfig.json)
- Type checking is lenient for rapid development
- ESLint configured with React hooks and refresh plugins

### Styling Approach
- Tailwind CSS with custom agricultural theme (`agriculture-theme.css`)
- Component classes use `cn()` utility for conditional styling
- Responsive design with mobile-first approach

### State Management
- React Query for server state (data fetching, caching)
- Local state with React hooks
- Auth state via Context API

### Error Handling
- Toast notifications via Sonner (`useToast` hook)
- Form validation with react-hook-form and Zod
- Graceful fallbacks for missing environment variables

### n8n Workflow Integration
The project uses n8n workflows for:
- Document text extraction
- AI chat message processing
- Notebook content generation
- Vector store updates

Workflows are defined in the `n8n/` directory and must be imported into your n8n instance.

## Security Considerations

### Environment Variables
- **Required**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set
- **Webhook Secrets**: `DOCUMENT_WEBHOOK_SECRET` and `AUDIO_WEBHOOK_SECRET` for Edge Functions
- The application will fail to start if required environment variables are missing

### Authentication & Authorization
- Supabase Row Level Security (RLS) policies protect all user data
- Enhanced `documents` table security with metadata validation triggers
- JWT verification required for most Edge Functions
- Webhook callbacks use HMAC-SHA256 signature verification

### XSS Protection
- `MarkdownRenderer` component uses DOMPurify for HTML sanitization
- Strict allowlist for HTML tags and attributes
- All user-generated content is sanitized before rendering

### Database Security
- RLS policies prevent unauthorized access to user data
- Server-side validation of `notebook_id` in document metadata
- Constraints and triggers ensure data integrity
- Use `insert_document_with_validation()` function for safe document inserts

### Deployment Security
- GitHub Actions uses minimal permissions and environment protection
- Supabase CLI authentication instead of direct database credentials
- Webhook endpoints require proper authentication headers

## Header Components Usage

### ✅ Unified Header Component

**UnifiedHeader** (`/src/components/layout/UnifiedHeader.tsx`)
- Single header component for all pages
- Props:
  - `variant`: 'full' (with navigation) | 'minimal' (without navigation)
  - `showNavigation`: Control navigation visibility
  - `title`, `subtitle`: Custom page titles
  - `showBackButton`, `onBackClick`: Back navigation
- Features: 
  - Language selector (6 languages: EN, KO, SW, FR, NE, UZ)
  - Navigation menu (in 'full' variant)
  - User profile menu
  - Mobile responsive

**Usage Examples:**
```typescript
// Most pages (with navigation)
<UnifiedHeader variant="full" />

// Dashboard page (without navigation)
<UnifiedHeader variant="minimal" showNavigation={false} />
```

**Note**: Legacy AppHeader and DashboardHeader components are deprecated. All new development should use UnifiedHeader.

## Important Notes

1. **Environment Variables**: All sensitive configuration must use environment variables. Never commit credentials to the repository.

2. **Multilingual Support**: All user-facing text should use i18n translation keys. Translations are in `src/i18n/locales/`.

3. **Agricultural Focus**: Features should align with farming needs in East Africa, considering local crops, seasons, and practices.

4. **Mobile Optimization**: The platform is designed for mobile-first usage, considering limited internet connectivity in rural areas.

5. **No Test Suite**: Currently, there are no automated tests. Manual testing is required for all changes.

## Security Checklist for New Features

- [ ] Input sanitization and validation
- [ ] RLS policies for new database tables
- [ ] Environment variables for sensitive configuration
- [ ] XSS protection for user-generated content
- [ ] Authentication required for sensitive operations
- [ ] Webhook signature verification for external callbacks