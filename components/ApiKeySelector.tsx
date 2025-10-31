import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';

// Fix: The global type for `window.aistudio` was using an inline type, which
// caused a conflict with another declaration. Using a named `AIStudio` interface
// resolves the type mismatch error.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        // FIX: Made aistudio optional to match other potential declarations and prevent modifier conflicts.
        aistudio?: AIStudio;
    }
}

const ApiKeySelector: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);

    const checkApiKey = useCallback(async () => {
        if(window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // If aistudio is not available, assume key is set via env for local dev
            setApiKeySelected(true);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        if(window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race conditions and immediately show the component.
            // If the API call fails later, the user will be prompted again.
            setApiKeySelected(true);
        }
    };
    
    // This allows child components to trigger a re-check if an API call fails due to auth.
    const resetKeySelection = useCallback(() => {
        setApiKeySelected(false);
    }, []);
    
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { resetKeySelection });
        }
        return child;
    });

    if (apiKeySelected === null) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Checking API key status...</p>
            </div>
        );
    }

    if (!apiKeySelected) {
        return (
            <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Info className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 font-heading">API Key Required for Video Generation</h2>
                <p className="text-gray-600 mb-6">
                    To use the Veo video generation model, you must select an API key. This feature may incur costs.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    For more information, please review the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-500">billing documentation</a>.
                </p>
                <button 
                    onClick={handleSelectKey}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                >
                    Select API Key
                </button>
            </div>
        );
    }

    return <>{childrenWithProps}</>;
};

export default ApiKeySelector;
