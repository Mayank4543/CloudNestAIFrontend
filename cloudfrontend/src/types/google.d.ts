// Google Identity Services type declarations

interface GoogleAccounts {
    id: {
        initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
        }) => void;
        renderButton: (
            element: HTMLElement | null,
            config: {
                theme?: 'outline' | 'filled_blue' | 'filled_black';
                size?: 'large' | 'medium' | 'small';
                width?: string | number;
                text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            }
        ) => void;
        prompt: () => void;
        disableAutoSelect: () => void;
    };
}

declare global {
    interface Window {
        google: {
            accounts: GoogleAccounts;
        };
    }
}

export { };
