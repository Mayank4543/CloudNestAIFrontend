'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

interface GoogleAuthProviderProps {
    children: React.ReactNode;
}

// You'll need to get your Google Client ID from Google Cloud Console
// For now, using a placeholder - replace with your actual client ID
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id-here';

export default function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
}
