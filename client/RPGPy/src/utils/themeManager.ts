// Global theme management hook
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

// Custom hook for global theme management
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');

  // Load theme from localStorage on initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  // Function to apply theme to document
  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    if (selectedTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', selectedTheme);
    }
  };

  // Function to change theme
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    applyTheme(newTheme);
  };

  return { theme, changeTheme, applyTheme };
};

// Initialize theme on app startup
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme-preference') as Theme || 'system';
  const root = document.documentElement;
  
  if (savedTheme === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', savedTheme);
  }
};
