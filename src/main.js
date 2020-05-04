const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  shell: electronShell,
} = require('electron');
const os = require('os');
const pty = require('node-pty');
const cfg = require('./config');

const info = [
  `Name: ${process.env.npm_package_productName}`,
  `Version: ${process.env.npm_config_init_version}`,
  `Author: ${process.env.npm_package_author_name}`,
  `Email: ${process.env.npm_package_author_email}`,
  `License: ${process.env.npm_config_init_license}`,
  'Date: May 1, 2020',
];

// set CATALINA_BASE=$CATALINA_BASE\nset CATALINA_HOME=$CATALINA_HOME\nset JRE_HOME=$JRE_HOME\nset MAVEN_HOME=$maven_home\nset SVN_HOME=$svn_home\nset CATALINA_TMPDIR=$CATALINA_HOME\\temp\nset JAVA_HOME=%JRE_HOME\nset CLASSPATH=$CLASSPATH\n

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    icon: __dirname + '/favicon.ico',
    // show: false,
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  // eslint-disable-next-line no-undef
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  Menu.setApplicationMenu(null);
  const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';

  const cwd = process.env.Home;
  const ptyGen = id => {
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 78,
      rows: 34,
      env: process.env,
      cwd,
    });

    ipcMain.on(id, (_, key) => {
      ptyProcess.write(key);
    });

    ptyProcess.on('data', data => {
      mainWindow.webContents.send(id, data);
    });

    return ptyProcess;
  };

  // 窗口最大化
  // mainWindow.maximize();
  // mainWindow.show();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  const frontend = 'frontend_directory';
  const backend = 'backend_directory';
  const pty1 = ptyGen('terminal1');
  const pty2 = ptyGen('terminal2');
  const terminals = {
    [frontend]: pty1,
    [backend]: pty2,
  };
  let scripts = {};
  let dirs = {};

  const startFrontend = () => {
    const frontendScripts = scripts['frontend-script'].split('\n');
    frontendScripts.forEach(command =>
      terminals[frontend].write(`${command}\r`)
    );
  };

  const startBackend = () => {
    const backendScripts = (() => {
      const commands = scripts['backend-script'].split('\n');
      return commands.map(command => {
        let cmd = command;
        for (const variable of cfg.default.ids) {
          const reg = new RegExp('\\$' + variable, 'g');
          cmd = cmd.replace(reg, dirs[variable]);
        }
        return cmd;
      });
    })();
    const setEnv = require('./setEnvironment').default;
    setEnv(dirs, terminals[backend]);
    backendScripts.forEach(command => terminals[backend].write(`${command}\r`));
  };

  ipcMain.on('project-start', () => {
    if (cfg.default.required.some(key => !dirs[key])) {
      return dialog.showErrorBox(
        '参数不全',
        '路径参数不全,请点击"设置"填写完整的参数,并点击保存'
      );
    }

    // 通知renderer进程跳转到terminal界面
    mainWindow.webContents.send('project-start');

    const changePath = key => {
      const match = dirs[key].match(/^[A-Z]:/);
      const terminal = terminals[key];
      if (Array.isArray(match)) {
        terminal.write(`${match[0]}\r`);
      }
      terminal.write(`cd ${dirs[key]}\r`);
    };

    changePath(frontend);
    startFrontend();

    changePath(backend);
    startBackend();
  });

  const stopTask = key => {
    const ctrlC = '\u0003';
    const terminal = terminals[key];
    terminal.write(ctrlC);
    return new Promise(resolve => {
      setTimeout(() => {
        terminal.write('Y');
        terminal.write('\r');
        resolve(key);
      }, 1000);
    });
  };

  ipcMain.on('restart-frontend', () => {
    stopTask(frontend).then(() => setTimeout(startFrontend, 1000));
  });

  ipcMain.on('restart-backend', () => {
    stopTask(backend).then(() => setTimeout(startBackend, 1000));
  });

  const sendUpdate = key => () => {
    stopTask(key).then(() =>
      setTimeout(() => {
        if (dirs['svn_home']) {
          terminals[key].write(dirs['svn_home'] + '\\svn.exe update\r');
        } else {
          terminals[key].write('svn update\r');
        }
      }, 1000)
    );
  };
  ipcMain.on('update-frontend', sendUpdate(frontend));
  ipcMain.on('update-backend', sendUpdate(backend));

  ipcMain.on('exit', () => {
    dialog
      .showMessageBox(mainWindow, {
        type: 'warning',
        title: '退出',
        message: '是否退出程序',
        buttons: ['取消', '确定'],
      })
      .then(({ response }) => {
        if (response) {
          mainWindow.close();
        }
      });
  });

  ipcMain.on('about', () => {
    const message = info.join('\n');
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '程序信息',
      message,
    });
  });

  ipcMain.on('project-settings-save', (_, data) => {
    dirs = data;
  });
  ipcMain.on('project-settings-submit', (_, data) => {
    dirs = data;
    dialog.showMessageBox(mainWindow, {
      title: '保存',
      message: '参数保存成功',
      buttons: ['确定'],
    });
  });

  ipcMain.on('script-save', (_, data) => {
    scripts = data;
  });
  ipcMain.on('script-submit', (_, data) => {
    scripts = data;
    dialog.showMessageBox(mainWindow, {
      title: '保存脚本',
      message: '脚本保存成功',
      buttons: ['确定'],
    });
  });

  // input打开路径选择对话框
  const selectDir = id => {
    ipcMain.on(id, async () => {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });
      const path = result.filePaths;

      if (path.length) {
        mainWindow.webContents.send(id, path[0]);
      }
    });
  };
  cfg.default.openDir.forEach(selectDir);

  ipcMain.on('open-url', (_, url) => electronShell.openExternal(url));

  ipcMain.on('resize', (_, { cols, rows }) => {
    for (const key in terminals) {
      if (terminals.hasOwnProperty(key)) {
        const terminal = terminals[key];
        terminal.resize(cols, rows);
      }
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
