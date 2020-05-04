import './index.css';
import func from './function';
import term from './term';
import cfg from './config';
import defaultScript from './defaultScript.json';

// 初始化并生成terminal
term.getXterm1();
term.getXterm2();

// 读取localstorage存储, 赋值input, 并用dirs保存
// 默认值
const dirs = cfg.defaultValues;
let flagAllSet = true;
const form = document.getElementById('project-settings');
const buttonWrapper = document.getElementById('button-wrapper');
cfg.ids.forEach(id => {
  const formItem = document.createElement('div');
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.className = 'settings-label';
  label.textContent = id;
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', id);
  input.setAttribute('name', id);
  input.setAttribute('required', true);
  input.className = 'settings-input';
  formItem.appendChild(label);
  formItem.appendChild(input);
  form.insertBefore(formItem, buttonWrapper);
  const value = localStorage.getItem(id);
  if (value) {
    input.value = value;
    dirs[id] = value;
  } else if (dirs[id]) {
    input.value = dirs[id];
  } else if (cfg.required.includes(id)) {
    flagAllSet = false;
  }
});
window.postMessage({ type: 'project-settings-save', key: dirs });

cfg.openDir.forEach(id => func.addInputListener(id));

/* 脚本处理 */
// 默认值
const scripts = defaultScript;

cfg.scripts.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    scripts[key] = value;
  }
  document.getElementById(key).value = scripts[key];
});
window.postMessage({ type: 'script-save', key: scripts });

document.getElementById('script-submit').addEventListener('click', e => {
  e.stopPropagation();
  e.preventDefault();
  cfg.scripts.forEach(key => {
    const value = document.getElementById(key).value;
    localStorage.setItem(key, value);
    scripts[key] = value;
  });
  window.postMessage({ type: 'script-submit', key: scripts });
});

document.getElementById('script-setting').addEventListener('click', () => {
  const classList = document.getElementById('script-setting-wrapper').classList;
  if (location.hash === '#x2') {
    func.goToHash('#x1');
    if (classList.contains('vh')) {
      classList.remove('vh');
    }
  } else {
    classList.toggle('vh');
  }
});
/* **** */

document.getElementById('settings').addEventListener('click', func.settings);

document
  .getElementById('start-terminal')
  .addEventListener('click', () => func.startTerminal());

document.getElementById('exit').addEventListener('click', func.exit);

document
  .getElementById('restart-frontend')
  .addEventListener('click', func.restartFrontend);

document
  .getElementById('restart-backend')
  .addEventListener('click', func.restartBackend);

document
  .getElementById('update-frontend')
  .addEventListener('click', func.updateFrontend);

document
  .getElementById('update-backend')
  .addEventListener('click', func.updateBackend);

document.getElementById('about').addEventListener('click', func.about);

document
  .getElementById('project-settings-submit')
  .addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    cfg.ids.forEach(id => {
      const value = document.getElementById(id).value;
      localStorage.setItem(id, value);
      dirs[id] = value;
    });
    window.postMessage({ type: 'project-settings-submit', key: dirs });
  });

if (flagAllSet) {
  func.startTerminal();
}
