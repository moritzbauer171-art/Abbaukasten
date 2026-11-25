'use strict';
// Kleine Brücke zwischen Seite und App. Die Seite prüft window.abDesktop und nutzt sonst die Browserwege.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('abDesktop', {
  save: (name, bytes) => ipcRenderer.invoke('ab:save', name, bytes),
  pdf: info => ipcRenderer.invoke('ab:pdf', info),
  pdfData: info => ipcRenderer.invoke('ab:pdfdata', info),
  saveFolder: (name, files) => ipcRenderer.invoke('ab:savefolder', name, files),
  print: info => ipcRenderer.invoke('ab:print', info),
  open: p => ipcRenderer.invoke('ab:open', p),
  reveal: p => ipcRenderer.invoke('ab:reveal', p),
  json: url => ipcRenderer.invoke('ab:json', url),
  // Referentenansicht wie in PowerPoint
  win32: process.platform === 'win32',
  displays: () => ipcRenderer.invoke('lw:displays'),
  audPlace: () => ipcRenderer.invoke('lw:aud-place'),
  audSwap: () => ipcRenderer.invoke('lw:aud-swap'),
  extend: () => ipcRenderer.invoke('lw:extend'),
  restore: () => ipcRenderer.invoke('lw:restore'),
  fullscreen: on => ipcRenderer.invoke('lw:fullscreen', on),
  // Direktverbindung zum iPad über den Hotspot des Laptops
  lan: on => ipcRenderer.invoke('lw:lan', on),
  hotspot: () => ipcRenderer.invoke('lw:hotspot'),
  onDisplays: cb => { const f = (e, n) => cb(n); ipcRenderer.on('lw:displays', f); return () => ipcRenderer.removeListener('lw:displays', f); }
});
