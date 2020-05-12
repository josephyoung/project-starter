export default {
  ids: [
    'frontend_directory',
    'backend_directory',
    'svn_home',
    'maven_home',
    'JRE_HOME',
    'CATALINA_BASE',
    'CATALINA_HOME',
    'CATALINA_TMPDIR',
    'CLASSPATH',
  ],
  defaultValues: {
    frontend_directory: '',
    backend_directory: '',
    svn_home: '',
    maven_home: '',
    JRE_HOME: 'd:\\program files\\java\\jdk1.8.0_121',
    CATALINA_BASE:
      'c:\\users\\administrator\\.intellijidea2017.3\\system\\tomcat\\unnamed_qbxxpt_3',
    CATALINA_HOME: 'd:\\apache-tomcat-8.5.39',
    CATALINA_TMPDIR: 'd:\\apache-tomcat-8.5.39\\temp',
    CLASSPATH:
      'd:\\apache-tomcat-8.5.39\\bin\\bootstrap.jar;d:\\apache-tomcat-8.5.39\\bin\\tomcat-juli.jar',
  },
  required: [
    'frontend_directory',
    'backend_directory',
    'CATALINA_TMPDIR',
    'CATALINA_BASE',
    'CATALINA_HOME',
    'CATALINA_TMPDIR',
    'JRE_HOME',
    'CLASSPATH',
  ],
  openDir: [
    'frontend_directory',
    'backend_directory',
    'svn_home',
    'maven_home',
    'JRE_HOME',
  ],
  scripts: ['frontend-script', 'backend-script'],
};
