# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
# PREFERRED: Full development mode with frontend + backend
npm run dev:full

# Frontend only (development mode with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Start backend server only
npm run start:server
```

**Default Development Rule**: Always use `npm run dev:full` for development unless specifically working on frontend-only features. This ensures both the React frontend (port 5173) and Express backend (port 3003) are running simultaneously.

### Important: Process Management
When restarting the application, always clean up remaining processes first:
```bash
# Kill processes on Windows
taskkill //F //IM node.exe

# Kill processes on Unix/Linux/Mac
killall node
```

This prevents port conflicts and ensures a clean restart, especially when the application runs on ports 5173 (frontend) and 3003 (backend).

### Testing
```bash
# Run individual test files
node test-units.js
node test_api.js
node test_validation.js

# Currency Manager unit tests (example test structure)
# Tests are in src/lib/__tests__/ directory
# Framework: Jest with describe/test syntax
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 with TypeScript, Vite as build tool
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hook Form, Zustand (implied), React Query for server state
- **PDF Generation**: @react-pdf/renderer for client-side PDF generation
- **Backend**: Express.js with PostgreSQL database
- **Routing**: React Router v7

### Project Structure

#### Key Directories
- `src/components/` - React components including UI components and feature components
- `src/components/ui/` - Reusable UI components (shadcn/ui based)
- `src/lib/` - Core business logic and utilities
- `src/lib/pdf/` - PDF generation system with templates
- `src/hooks/` - Custom React hooks
- `src/context/` - React context providers (Auth, Language)
- `src/types/` - TypeScript type definitions

### Core Features

#### Invoice System Modes
The application operates in two distinct modes:
1. **MM (Material Management)** - Full supply chain documentation with order/delivery tracking
2. **FI (Financial Invoice)** - Streamlined financial documentation focused on accounting

#### PDF Template System
Located in `src/lib/pdf/templates/`, the system supports multiple templates:
- `businessstandard` - DIN 5008 compliant
- `classic` - Traditional with signature fields
- `professional` - Modern with blue accents
- `businessgreen` - Eco-friendly styling
- `allrauer2` - Custom branded template

Templates are registered in `src/lib/pdf/templates.ts` and must implement the `PDFTemplate` interface.

#### Multi-language Support
The system supports German and English through the `LanguageContext`. Translation keys are used throughout components via the `useLanguage` hook.

#### API Architecture
- Frontend API client: `src/lib/api.ts` and `src/lib/apiClient.ts`
- Backend server: `server.js` runs on port 3003
- Vite proxy configuration forwards `/api/*` requests to backend

### Key Configuration Files

#### Vite Configuration
- Path aliases: `@/` maps to `./src/`
- Proxy setup for API calls to `http://localhost:3003`
- SPA configuration for client-side routing

#### TypeScript Configuration
- Composite project with separate configs for app and node
- Path mapping for `@/*` imports

#### Environment Variables
Create `.env` file with:
```
VITE_API_URL=http://localhost:3000
VITE_DATABASE_URL=your_database_url
VITE_PDF_WORKER_URL=/js/pdf.worker.min.js
```

### Important Patterns

#### Form Management
The main invoice form uses React Hook Form with a complex nested structure. Key files:
- `src/components/InvoiceForm.tsx` - Main form component
- `src/hooks/useInvoiceForm.ts` - Form logic hook
- `src/hooks/useInvoiceFormData.ts` - Form data management

#### PDF Generation Flow
1. User fills invoice form
2. Data validation via `validatePDFData` in `src/lib/dataTransforms.ts`
3. PDF generation via `generatePDF` in `src/lib/pdf/index.ts`
4. Template selection from `src/lib/pdf/templates/`

#### State Management Pattern
- Form state: React Hook Form
- Server state: React Query
- Auth state: AuthContext
- Language state: LanguageContext

### Database Integration
The backend uses PostgreSQL with a connection pool. Database operations are handled through the Express API endpoints. Environment variables for database connection:
- `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`

### Currency Management
Multi-currency support (EUR, GBP, CHF, USD) is handled by `src/lib/currencyManager.ts` with proper formatting for each locale.

**Company-Currency Mapping**:
- Company 1000 → EUR (Eurozone)
- Company 2000 → GBP (UK)
- Company 3000 → CHF (Switzerland)

### AI Integration
The system includes AI-powered features:
- **Demo Data Generation**: `src/lib/aiDataGenerator.ts` uses AI for realistic data
- **Logo Generation**: `src/lib/logoTemplates.ts` with AI-based logo creation
- **Transformers.js**: @xenova/transformers integration for client-side AI capabilities

### Critical Development Notes

#### Process Management
Always kill existing Node.js processes before restarting to avoid port conflicts:
```bash
# Windows
taskkill //F //IM node.exe

# Unix/Linux/Mac
killall node
```

#### API Proxy Configuration
The Vite dev server proxies `/api/*` requests to `http://localhost:3003`. Ensure the backend is running when developing features that require API access.

#### PDF Worker Configuration
PDF generation requires the worker file at `/js/pdf.worker.min.js`. This is served from the public directory and must be accessible for PDF features to work.

### Common Development Workflows

#### Adding a New PDF Template
1. Create template file in `src/lib/pdf/templates/[template-name]/index.tsx`
2. Implement the `PDFTemplate` interface
3. Register in `src/lib/pdf/templates.ts`
4. Test with different invoice types (MM/FI modes)

#### Adding New Language Support
1. Add language to `LanguageContext`
2. Update all translation objects throughout components
3. Test UI elements and PDF generation in new language

#### Implementing New Features
1. Check mode compatibility (MM vs FI)
2. Update form validation in `useInvoiceForm`
3. Ensure currency handling respects company context
4. Test with demo data generator