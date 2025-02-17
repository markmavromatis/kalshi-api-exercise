import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger, format, transports } from "winston";
const { combine, timestamp, json, errors } = format;

const logDir = 'logs';
if ( !existsSync( logDir ) ) {
  // Create the directory if it does not exist
  mkdirSync( logDir );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({stack: true}), json()),
  transports: [
    new transports.File({ filename: join(logDir, '/error.log'), level: 'error' }),
    new transports.File({ filename: join(logDir,'/combined.log') }),
    new transports.Console({format: format.simple()})
    ],
});

export default logger;
