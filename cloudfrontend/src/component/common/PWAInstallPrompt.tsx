'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone ||
            document.referrer.includes('android-app://');

        setIsInstalled(isAppInstalled);

        if (!isAppInstalled) {
            // Listen for the beforeinstallprompt event
            const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
                // Prevent the mini-infobar from appearing on mobile
                e.preventDefault();
                // Save the event so it can be triggered later
                setDeferredPrompt(e);
                setShowInstallBanner(true);
            };

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

            // Listen for the app installed event
            window.addEventListener('appinstalled', () => {
                setIsInstalled(true);
                setShowInstallBanner(false);
                setDeferredPrompt(null);
            });

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowInstallBanner(false);
    };

    const handleDismiss = () => {
        setShowInstallBanner(false);
        // Store dismissal in localStorage to avoid showing again soon
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Don't show if already installed or dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissal < 7) { // Don't show for 7 days after dismissal
                setShowInstallBanner(false);
            }
        }
    }, []);

    // Don't render anything if app is installed or banner shouldn't show
    if (isInstalled || !showInstallBanner || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[#18b26f] rounded-lg flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-6 h-6 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                            Install CloudNest AI
                        </h3>
                        <p className="text-sm text-gray-600">
                            Add CloudNest AI to your home screen for quick access to your files anywhere.
                        </p>
                        <div className="flex space-x-2 mt-3">
                            <button
                                onClick={handleInstallClick}
                                className="px-3 py-1.5 bg-[#18b26f] text-white text-sm font-medium rounded hover:bg-[#149d5f] transition-colors"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-4 h-4 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;