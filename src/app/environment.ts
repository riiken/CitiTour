// Development configuration. Production values live in environment.prod.ts and
// replace this file at build time (angular.json fileReplacements).
export const environment = {
  production: false,
  apiURL: 'http://localhost:5000/api/ai/',
  apiUrl: 'http://localhost:5000/api',
  authURL: 'http://localhost:5000/api/auth/',
  emailURL: 'sendEmail',
  // Google AdSense publisher id for web ads; empty disables web ads
  adsenseClient: '',
  adsenseSlot: ''
};
