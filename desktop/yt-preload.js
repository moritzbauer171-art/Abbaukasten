// Nur für das Fenster „Bei YouTube anmelden“.
// Google soll nicht zuerst einen Passkey anbieten (Electron hat unter Windows keine Passkey-Abfrage).
// Wichtig: WebAuthn selbst bleibt vorhanden – fehlt es ganz, hält Google das Fenster für einen
// „unsicheren Browser“ und lehnt die Anmeldung ab. Wir melden nur, dass kein Gerät-Passkey da ist.
const { contextBridge } = require('electron');
try {
  contextBridge.executeInMainWorld({ func: () => {
    // Wie Firefox: keine Chromium-Markenangaben
    try { Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => undefined, configurable: true }); } catch {}
    try {
      const P = window.PublicKeyCredential; if (!P) return;
      Object.defineProperty(P, 'isUserVerifyingPlatformAuthenticatorAvailable', { value: () => Promise.resolve(false), configurable: true });
      Object.defineProperty(P, 'isConditionalMediationAvailable', { value: () => Promise.resolve(false), configurable: true });
    } catch {}
  } });
} catch {}
