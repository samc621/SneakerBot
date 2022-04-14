import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

const { format } = winston;

class Logger {
  constructor() {
    this.logDir = path.resolve('logs');
  }

  async startTaskLogger(taskId) {
    if (!(await exists(this.logDir))) {
      await mkdir(this.logDir);
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

export default Logger;
