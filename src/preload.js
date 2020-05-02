const { ipcRenderer, contextBridge } = require('electron');
const cfg = require('./config');

process.once('loaded', () => {
  window.addEventListener('message', e => {
    ipcRenderer.send(e.data.type, e.data.key);
  });
});

contextBridge.exposeInMainWorld('api', {
  receive: (channel, func) => {
    const validChannels = [
      ...cfg.default.ids,
      ...cfg.default.scripts,
      'terminal1',
      'terminal2',
      'exit',
      'project-start',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },
});
