// English is the source of truth: every key defined here must also exist in
// the other languages (enforced by `satisfies TranslationShape<…>` there).
export const common = {
  appName: 'Travel App',
  loading: 'Loading…',
  nav: {
    label: 'Main navigation',
    trips: 'Trips',
    newTrip: 'New trip',
    logout: 'Sign out',
    signedInAs: 'Signed in as {{email}}',
  },
  theme: {
    toggle: 'Toggle light/dark theme',
    current: 'Theme: {{theme}}',
    names: {
      light: 'light',
      dark: 'dark',
      system: 'system',
    },
  },
  language: {
    label: 'Language',
    // Language names are shown in their own language in every locale.
    names: {
      en: 'English',
      it: 'Italiano',
    },
  },
  notFound: {
    title: 'Page not found',
    description: "The address you opened doesn't exist.",
    backHome: 'Back to home',
  },
} as const
