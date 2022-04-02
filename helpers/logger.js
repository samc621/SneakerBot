const winston = require('winston');
const path = require('path');
const fs = require('fs');

const { format } = winston;

class Logger {
  constructor() {
    this.logDir = path.resolve('logs');
  }

  startTaskLogger(taskId) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }

    return winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(this.logDir, `/${Date.now()}-taskId=${taskId}.log`) })
      ],
      format: format.combine(
        format.errors({ stack: true }),
        format.printf((info) => {
          return info.level === 'info' ? `[${new Date().toLocaleString()}] - ${info.message}` : `[${new Date().toLocaleString()}] - ${info.stack}`;
        })
      )
    });
  }
}

module.exports = Logger;
