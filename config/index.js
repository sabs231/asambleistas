var config = {
  /**
   * Server Configuration
   */
  server: {
    port: 3000,
    hostname: 'local.host',
    protocol: 'http',
    getHomeUrl: function() {
      return config.server.protocol + '://' + config.server.hostname + ':' + config.server.port;
    }
  },

  /**
   * Database Configuration
   */
  db: {
    name: 'node-asambleistas',
    server: 'localhost',
    defaults: {
      limit: 10
    }
  },

  /**
   * Site Configuration
   */
  site: {
    urlPrefix: '/',
    name: 'Asamblea Nacional del Ecuador ' + new Date().getFullYear(),
    author: 'Sergio Báez, Diego Luces',
    lang: 'es',
    description: 'Información sobre las propuestas de leyes y votaciones de la Asamblea Nacional del Ecuador 2013 ' + new Date().getFullYear(),
    copyright: '© ' + new Date().getFullYear() + '. All rights reserved.',
    analytics: false,
  },

  /**
   * Session Configuration
   */
  session: {
    timeout: 60*60*24,
    domain: 'local.host',
    secret: 'MySecretKey'
  },

  /**
   * Application keys for autherization services (tw, fb, g, etc)
   */
  auth: {
    afterLogin: '/',
    afterSignup: '/',
    facebook: {
      appId: '',
      appSecret: ''
    },
    twitter: {
      consumerKey: '',
      consumerSecret: ''
    },
    password: {
      getLoginPath: '/login',
      postLoginPath: '/login',
      loginView: 'user/login',
      getRegisterPath: '/register',
      postRegisterPath: '/register',
      registerView: 'user/register',
      loginLocals: {
        title: 'Login'
      },
      registerLocals: {
        title: 'Registrarse'
      },
      extraParams: {
        name: {
          first: String,
          last: String
        },
        email: { type: String, lowercase: true, trim: true, unique: true }
      }
    }
  },

  /**
   * User Configuration
   */
  user: {
    admin_role: "admin",
    politician_role: "politician"
  },

  /**
   * i18n Configuration
   */
  i18n: {
    langs: ['es','en'],
    defaultLocale: 'es',
    cookie: 'lang',
    extension: '.js'
  },

  /**
   * nodemailer Configuration
   */
  nodemailer: {
    transport: {
      method: 'SMTP',
      //host: null,
      //port: null,
      //secureConnection: null,
      //name: null,
      //ignoreTLS: null,
      //debug: true,
      //maxConnections: null,
      service: 'Gmail',
      auth: {
        user: '',
        pass: ''
      }
    },

    mail: {
      from: '"Equipo" <noreply@local.host>',
      cc: null,
      bcc: null,
      replyTo : null,
      subject: null,
      generateTextFromHTML: true,
      headers: {
      },
      encoding: 'quoted-printable',
    }
  },
};

exports = module.exports = config;