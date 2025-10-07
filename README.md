# Voicelink Custom

A React application for connecting with CRM platforms, starting with Pipedrive integration.

## Features

- **Pipedrive OAuth Integration**: Secure authentication with Pipedrive CRM
- **Supabase Backend**: User management and session handling
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- **Edge Function Support**: Server-side OAuth token exchange

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Pipedrive OAuth Configuration
VITE_PIPEDRIVE_CLIENT_ID=your_pipedrive_client_id_here
VITE_PIPEDRIVE_CLIENT_SECRET=your_pipedrive_client_secret_here
```

### Edge Function Configuration

For the server-side edge function (`pipedrive-auth`), you'll need these environment variables:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
PASSWORD_GENERATION_SECRET=your_password_generation_secret_here
VITE_PIPEDRIVE_CLIENT_ID=your_pipedrive_client_id_here
VITE_PIPEDRIVE_CLIENT_SECRET=your_pipedrive_client_secret_here
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

## Authentication Flow

1. User clicks "Verbinden" on the Pipedrive card
2. Redirects to Pipedrive OAuth authorization
3. After authorization, redirects to `/auth/pipedrive/callback`
4. Callback handler exchanges code for tokens via edge function
5. User is authenticated and redirected to dashboard

## Project Structure

```
src/
├── components/
│   ├── PipedriveCallback.tsx  # OAuth callback handler
│   └── Dashboard.tsx          # Post-authentication dashboard
├── hooks/
│   └── useAuth.ts            # Authentication state management
├── services/
│   └── auth.service.ts       # OAuth initiation logic
├── lib/
│   └── supabase.ts          # Supabase client configuration
└── App.tsx                  # Main application with routing
```

## Technologies Used

- **React 18** with TypeScript
- **React Router** for navigation
- **Supabase** for authentication and database
- **Tailwind CSS** for styling
- **Lucide React** for icons
