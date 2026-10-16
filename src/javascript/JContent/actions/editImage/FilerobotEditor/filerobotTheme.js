/*
 * Moonstone-themed palette for react-filerobot-image-editor.
 *
 * Filerobot's `theme` prop is deep-merged over its defaults, and its ThemeProvider
 * (@scaleflex/ui) shallow-merges these `palette` keys over the Scaleflex default
 * palette. Any CSS color string is accepted, so we point each key at the matching
 * Moonstone `--moon-color-*` custom property. Those live on `:root`, so they resolve
 * everywhere in the modal — and referencing them (rather than hardcoding hex) keeps
 * the editor in sync with Moonstone and with the active light/dark theme.
 *
 * Palette keys come from @scaleflex/ui `utils/types/palette` (Color enum). Only the
 * keys with real visual impact in the tabs we expose are overridden; everything else
 * falls back to Filerobot's defaults.
 *
 * Fallbacks in each var() are the literal Moonstone values, so the editor still looks
 * right in the unlikely case it renders detached from the Moonstone stylesheet.
 */

// Moonstone semantic tokens, referenced with their literal value as fallback.
const accent = 'var(--moon-color-accent, #00a0e3)';
const accentDark = 'var(--moon-color-accent_dark, #0072b1)';
const accentTint = 'var(--moon-color-accent20, #00a0e333)'; // 20% accent — subtle fills
const grayDark = 'var(--moon-color-gray_dark, #293136)'; // Primary text
const gray = 'var(--moon-color-gray, #7a7f88)'; // Secondary text / icons
const grayLight = 'var(--moon-color-gray_light, #dadada)'; // Borders
const grayLight40 = 'var(--moon-color-gray_light40, #dadada66)'; // Faint borders
const danger = 'var(--moon-color-danger, #f44053)';
const success = 'var(--moon-color-success, #6abb6d)';
const warning = 'var(--moon-color-warning, #ffbb00)';

export const filerobotTheme = {
    palette: {
        // Accent — the editor's primary blue (sliders, selected tools, focus rings).
        'accent-primary': accent,
        'accent-primary-hover': accentDark,
        'accent-primary-active': accentDark,
        'accent-stateless': accent,
        'border-active-bottom': accent,
        'link-pressed': accent,

        // Selected / hovered surfaces (e.g. the active tab and tool chips).
        'bg-primary-active': accentTint,
        'active-secondary-hover': accentTint,

        // Text.
        'txt-primary': grayDark,
        'txt-secondary': gray,

        // Icons.
        'icon-primary': gray,
        'icons-secondary': gray,
        'icons-primary-hover': grayDark,

        // Borders / dividers.
        'borders-primary': grayLight,
        'borders-secondary': grayLight40,
        'borders-strong': gray,

        // State colours.
        error: danger,
        'error-hover': danger,
        success: success,
        warning: warning
    },
    typography: {
        fontFamily: 'var(--moon-font-family, \'Nunito Sans Variable\', sans-serif)'
    }
};
