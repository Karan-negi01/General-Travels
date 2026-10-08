// Demo mode turns on the one-click demo accounts on /login and dev fallbacks
// for the session secret and admin password. It is always on in development.
// On a deployed preview for the client, set DEMO_MODE=true; remove it before
// real users sign up, because anyone can then sign in as admin.
export const DEMO_MODE = process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true";
