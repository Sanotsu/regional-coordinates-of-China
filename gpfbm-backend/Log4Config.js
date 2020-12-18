const log4js = require('log4js');

// 配置日志
log4js.configure({
    appenders: {
        console: { type: 'console' },//配置命令行日誌
        normal: {
            type: 'dateFile',// 配置基本日誌文件輸出
            filename: 'logs/logs.log',
            pattern: '.yyyy-MM-dd',
            compress: true
        },
        http: {
            type: 'dateFile',// 配置HTTP訪問日誌輸出
            filename: 'logs/access/access.log',
            pattern: '.yyyy-MM-dd',
            compress: true
        },
        job: {
            type: 'dateFile',// 配置定時任務日誌輸出
            filename: 'logs/job/job.log',
            pattern: '.yyyy-MM-dd',
            compress: true
        }
    },
    categories: {// 配置不同日誌輸出方式
        default: { appenders: ['console', 'normal'], level: 'debug' },
        // schedule: { appenders: ['job'], level: 'debug' },
        // access: { appenders: ['http'], level: 'debug' }
    },
    replaceConsole: true
})

module.exports = log4js.getLogger('default');
// module.exports.schedule = log4js.getLogger('schedule');
// module.exports.access = log4js.getLogger('access');