const goToHash = id => {
  const text = {
    '#x1': '终端',
    '#x2': '设置',
  };
  location.href = id;
  document.getElementById('settings').textContent = text[id];
};

const settings = () => {
  if (location.hash === '#x2') {
    goToHash('#x1');
  } else {
    goToHash('#x2');
  }
};

const startTerminal = () => {
  window.postMessage({
    type: 'project-start',
  });
  window.api.receive('project-start', () => goToHash('#x2'));
};

const restartFrontend = () => window.postMessage({ type: 'restart-frontend' });

const restartBackend = () => window.postMessage({ type: 'restart-backend' });

const updateFrontend = () => window.postMessage({ type: 'update-frontend' });

const updateBackend = () => window.postMessage({ type: 'update-backend' });

const exit = () => {
  window.postMessage({
    type: 'exit',
  });
};

const about = () => {
  window.postMessage({
    type: 'about',
  });
};

const addInputListener = id => {
  document.getElementById(id).addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    window.postMessage({
      type: id,
    });
  });

  window.api.receive(id, path => {
    document.getElementById(id).value = path;
  });
};

export default {
  goToHash,
  startTerminal,
  settings,
  exit,
  addInputListener,
  restartFrontend,
  restartBackend,
  updateFrontend,
  updateBackend,
  about,
};
