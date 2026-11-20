// Nur für das Fenster „Bei YouTube anmelden“: Passkeys (WebAuthn) ausblenden.
// Electron hat unter Windows keine Passkey-Abfrage; Google bietet dann von selbst Passwort,
// Bestätigung auf dem Handy oder Code an.
const { contextBridge } = require('electron');
try {
  contextBridge.executeInMainWorld({ func: () => {
    const no = () => Promise.reject(new DOMException('Passkeys sind in LehrWerk nicht verfügbar.', 'NotAllowedError'));
    try { Object.defineProperty(window, 'PublicKeyCredential', { value: undefined, configurable: true, writable: true }); } catch {}
    try { if (navigator.credentials) { navigator.credentials.get = no; navigator.credentials.create = no; } } catch {}
  } });
} catch {}
