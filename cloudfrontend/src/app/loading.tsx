import React from 'react';
import Loader from '@/component/common/Loader';

// This is a global loading component for Next.js App Router
// It will be used for all routes unless overridden
export default function Loading() {
    // We can dynamically determine if we're in a full-screen context
    // but for now using a consistent loading UI
    return <Loader size="large" />;
}
