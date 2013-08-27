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
    name: 'asambleistas',
    server: 'localhost',
    defaults: {
      limit: 20
    }
  },

  /**
   * Site Configuration
   */
  site: {
    urlPrefix: '/',
  },

  /**
   * Session Configuration
   */
  session: {
    timeout: 60*60*24*7,
    domain: 'local.host',
    secret: 'Listen, do you wanna know a secret?'
  },

  /**
   * Application keys for autherization services (tw, fb, g, etc)
   */
  auth: {
    facebook: {
      appId: '111565172259433',
      appSecret: '85f7e0a0cc804886180b887c1f04a3c1'
    },
    twitter: {
      consumerKey: 'JLCGyLzuOK1BjnKPKGyQ',
      consumerSecret: 'GNqKfPqtzOcsCtFbGTMqinoATHvBcy1nzCTimeA9M0'
    },
  },

  /**
   * User Configuration
   */
  user: {
    admin_role: "admin",
    politician_role: "politician"
  },

  /**
   * nodemailer Configuration
   */
  nodemailer: {
    transport: {
      method: 'SMTP',
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