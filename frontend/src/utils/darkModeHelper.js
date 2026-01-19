/** @format */

// Apply dark mode classes to common components automatically
export const applyDarkModeClasses = () => {
  if (typeof document === 'undefined') return;

  // Add dark mode classes to all white backgrounds
  const whiteElements = document.querySelectorAll('.bg-white:not(.dark-mode-applied)');
  whiteElements.forEach(el => {
    el.classList.add('dark:bg-gray-800', 'dark-mode-applied', 'transition-colors');
  });

  // Add dark mode classes to all gray backgrounds
  const grayElements = document.querySelectorAll('.bg-gray-50:not(.dark-mode-applied), .bg-gray-100:not(.dark-mode-applied)');
  grayElements.forEach(el => {
    el.classList.add('dark:bg-gray-900', 'dark-mode-applied', 'transition-colors');
  });

  // Add dark mode classes to all text elements
  const textElements = document.querySelectorAll('.text-gray-900:not(.dark-mode-applied)');
  textElements.forEach(el => {
    el.classList.add('dark:text-white', 'dark-mode-applied');
  });

  const mutedTextElements = document.querySelectorAll('.text-gray-600:not(.dark-mode-applied), .text-gray-500:not(.dark-mode-applied)');
  mutedTextElements.forEach(el => {
    el.classList.add('dark:text-gray-400', 'dark-mode-applied');
  });

  // Add dark mode classes to borders
  const borderElements = document.querySelectorAll('.border-gray-200:not(.dark-mode-applied)');
  borderElements.forEach(el => {
    el.classList.add('dark:border-gray-700', 'dark-mode-applied', 'transition-colors');
  });
};

// Watch for DOM changes and apply dark mode classes
export const watchForDarkMode = () => {
  if (typeof window === 'undefined') return;

  // Initial application
  setTimeout(applyDarkModeClasses, 100);

  // Watch for new elements
  const observer = new MutationObserver(() => {
    applyDarkModeClasses();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
