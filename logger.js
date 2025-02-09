const {createLogger, format, transports} = require("winston");
const { combine, timestamp, json, errors } = format;

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({stack: true}), json()),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console({format: format.simple()})
    ],
});

module.exports = logger;
