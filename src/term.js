/* eslint-disable no-console */
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { throttle } from './util';
import func from './function';

const postRows = (cols, rows) =>
  window.postMessage({
    type: 'resize',
    key: { cols, rows },
  });

function xtermGen(channel) {
  const xterm = new Terminal();
  const fitAddon = new FitAddon();
  xterm.loadAddon(fitAddon);
  xterm.loadAddon(
    new WebLinksAddon((e, url) => {
      if (e.type === 'click') {
        window.postMessage({
          type: 'open-url',
          key: url,
        });
      }
    })
  );
  xterm.open(document.getElementById(channel));
  const changSize = () => {
    fitAddon.fit();
    postRows(xterm.cols, xterm.rows);
    if (location.hash) {
      func.goToHash(location.hash);
    }
  };
  changSize();
  window.addEventListener('resize', throttle(changSize, 500));
  xterm.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
  xterm.onData(data => {
    window.postMessage({
      type: channel,
      key: data,
    });
  });

  window.api.receive(channel, msg => {
    xterm.write(msg);
  });

  return xterm;
}

function getXterm1() {
  return xtermGen('terminal1');
}

function getXterm2() {
  return xtermGen('terminal2');
}

export default {
  getXterm1,
  getXterm2,
};
