const setEnv = (dirs, pty) => {
  const { frontend_directory, backend_directory, ...rest } = dirs;
  for (const key in rest) {
    if (rest.hasOwnProperty(key)) {
      const value = rest[key];
      pty.write(`set ${key}=${value}\r`);
    }
  }
};

export default setEnv;
