import { useState, useCallback } from 'react';


type ClipboardStatus = 'idle' | 'copied' | 'error';

/**
 * A custom React hook for copying text to the clipboard.
 * It supports both the modern navigator.clipboard API and the older document.execCommand fallback.
 * @returns A tuple containing [copy, status].
 * - `copy`: (text: string) => Promise<void> - A function to trigger the copy operation.
 * - `status`: 'idle' | 'copied' | 'error' - The current copy status.
 */
export const useClipboard = (): [(text: string) => Promise<void>, ClipboardStatus] => {
  const [status, setStatus] = useState<ClipboardStatus>('idle');

  // useCallback to memorize the function
  const copy = useCallback(async (text: string) => {

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
        // Reset status after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (err) {
        console.error('Failed to copy text using navigator.clipboard: ', err);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } else {
        // For older browsers, use older function
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Move the textarea off-screen
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (err) {
        console.error('Failed to copy text using execCommand: ', err);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    }
  }, []); // Create once only

  return [copy, status];
};