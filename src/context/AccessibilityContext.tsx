import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large';

interface AccessibilitySettings {
  textToSpeech: boolean;
  highContrast: boolean;
  fontSize: FontSize;
  simpleNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('sala_accessibility');
    return saved ? JSON.parse(saved) : {
      textToSpeech: false,
      highContrast: false,
      fontSize: 'medium',
      simpleNavigation: false
    };
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('sala_accessibility', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Apply High Contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply Font Size
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${settings.fontSize}`);

    // Apply Simple Navigation
    if (settings.simpleNavigation) {
      document.documentElement.classList.add('simple-nav');
    } else {
      document.documentElement.classList.remove('simple-nav');
    }
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within an AccessibilityProvider');
  return context;
};
