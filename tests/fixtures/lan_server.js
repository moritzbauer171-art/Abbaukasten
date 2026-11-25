// Testserver: der echte Direktverbindungs-Server der Windows-App, liefert die Testseite als index.html aus
const fs = require('fs'); const path = require('path');
const { createLan, typeOf } = require(path.join(__dirname, '..', '..', 'desktop', 'lan.js'));
const page = process.argv[2], token = process.argv[3];
const lan = createLan({ token, getFile: async p => (p === 'index.html' ? { buf: fs.readFileSync(page), type: typeOf(p) } : null) });
lan.start(47911).then(port => { console.log('PORT ' + port); });
setInterval(() => {}, 1 << 30);
