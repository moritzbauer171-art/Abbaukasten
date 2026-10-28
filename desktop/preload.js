'use strict';
// Kleine Brücke zwischen Seite und App. Die Seite prüft window.abDesktop und nutzt sonst die Browserwege.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('abDesktop', {
  save: (name, bytes) => ipcRenderer.invoke('ab:save', name, bytes),
  pdf: info => ipcRenderer.invoke('ab:pdf', info),
  print: info => ipcRenderer.invoke('ab:print', info),
  open: p => ipcRenderer.invoke('ab:open', p),
  reveal: p => ipcRenderer.invoke('ab:reveal', p)
});
