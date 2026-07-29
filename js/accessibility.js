// Accessibility enhancements
const accessibility = (() => {
    // Announce to screen readers
    function announce(message, priority = 'polite') {
        let announcer = document.getElementById('announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'announcer';
            announcer.className = 'sr-only';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = message;
        announcer.setAttribute('aria-live', priority);
    }

    // Handle focus trap
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    // Skip to main content functionality
    function setupSkipLink() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#main-content');
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // Check for accessibility features in browser
    function checkAccessibilityFeatures() {
        const features = {
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            prefersContrast: window.matchMedia('(prefers-contrast: more)').matches,
            prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
            forcedColors: window.matchMedia('(forced-colors: active)').matches
        };
        return features;
    }

    // Test screen reader announcement
    function announceAccessibilityInfo() {
        const message = i18n.translate('accessibility-info');
        console.log('Accessibility Info:', message);
    }

    // Keyboard shortcut help
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + H for help
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                const helpText = `
                    Keyboard Shortcuts:
                    - Arrow keys: Navigate the game board
                    - Enter or Space: Reveal a card
                    - Tab: Move to next focusable element
                    - Shift + Tab: Move to previous focusable element
                `;
                announce(helpText.trim(), 'assertive');
            }
            
            // Alt + R for reset
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                game.reset();
            }
        });
    }

    // Ensure minimum touch target size
    function ensureTouchTargets() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                card.style.padding = '8px';
            }
        });
    }

    // Monitor for dynamic content changes
    function observeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    ensureTouchTargets();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize all accessibility features
    function init() {
        setupSkipLink();
        setupKeyboardShortcuts();
        announceAccessibilityInfo();
        checkAccessibilityFeatures();
        ensureTouchTargets();
        observeChanges();

        // Log accessibility features
        const features = checkAccessibilityFeatures();
        console.log('Accessibility Features:', features);
    }

    return {
        announce,
        init,
        checkAccessibilityFeatures
    };
})();

// Initialize accessibility when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        accessibility.init();
    });
} else {
    accessibility.init();
}