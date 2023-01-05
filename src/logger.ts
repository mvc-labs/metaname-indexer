const winston = require('winston') 
//const config = require('../config')
const { combine, timestamp, label, printf, splat} = winston.format;
const DailyRotateFile = require('winston-daily-rotate-file');

//const dateFormat = new Date().toLocaleString('YYYY-MM-DD hh:mm:ss.SSS A', {
//  timeZone: 'Asia/Shanghai'
//})
const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS ZZ'
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
    
let logger = winston.createLogger({
  level: 'debug',
  format: combine(
    label({ label: 'unittest' }),
    timestamp({format: dateFormat}),
    splat(),
    myFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});

export function initLogger(config) {
  const prefix = config.path + config.label
  const transport = new winston.transports.DailyRotateFile({
    filename: prefix + '-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    frequency: '24h',
    //maxSize: '200m',
    maxFiles: config.maxFiles || '90d'
  });
  logger = winston.createLogger({
    level: config.level,
    //format: winston.format.json(),
    format: combine(
      label({ label: config.label }),
      timestamp({format: dateFormat}),
      splat(),
      myFormat
    ),
    //defaultMeta: { service: 'oracledb' },
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      transport,
      //new winston.transports.File({ filename: prefix + '-error.log', level: 'error' }),
      //new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console());
  }

}


//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
/*if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}*/

export {logger}