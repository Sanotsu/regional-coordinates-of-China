const Koa = require('koa')
const app = new Koa()

const Router = require('koa-router')
const fs = require('fs')

const koaBody = require('koa-body');
app.use(koaBody());

const cors = require('koa2-cors');
app.use(cors())

// 子路由
let page = new Router()
page.get('/hello', async (ctx) => {

    try {
        // pcas-data文件夹下要手动新建一个 pcas-code-with-coordinates 文件夹,否则出错(为了方便不做检查和代码创建)
        let jsonFileSavePath = `./pcas-data/pcas-code-with-coordinates`

        if (!fs.existsSync(jsonFileSavePath)) {
            fs.mkdirSync(jsonFileSavePath)
        }
    } catch (error) {
        console.log(error)
    }

    ctx.body = 'hello page!'
})

page.post('/area', async (ctx) => {
    let body = ctx.request.body;
    let { area, noArea, noLngLat, name } = body;

    try {
        // pcas-data文件夹下要手动新建一个 pcas-code-with-coordinates 文件夹,否则出错(为了方便不做检查和代码创建)
        let jsonFileSavePath = `../pcas-data/pcas-code-with-coordinates`

        if (!fs.existsSync(jsonFileSavePath)) {
            fs.mkdirSync(jsonFileSavePath)
        }
        if (area) {
            fs.writeFileSync(`${jsonFileSavePath}/${name}.json`, JSON.stringify(area), 'utf-8');
        }
        if (noArea) {
            // 如果前端没有反查地址,那这个文件里面必然只是空数组
            fs.writeFileSync(`${jsonFileSavePath}/${name}-经纬度反查不了地址.json`, JSON.stringify(noArea), 'utf-8');
        }
        if (noLngLat) {
            fs.writeFileSync(`${jsonFileSavePath}/${name}-指定区域地址查不了经纬度.json`, JSON.stringify(noLngLat), 'utf-8');
        }

        ctx.response.type = 'json';
        ctx.response.body = { code: 20000, info: 'done' };
    } catch (error) {
        console.error(error);
        ctx.response.type = 'json';
        ctx.response.body = { code: 20001, info: 'fail', msg: error };
    }
})

// 装载所有子路由
let router = new Router()
router.use('', page.routes(), page.allowedMethods())

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods())

app.on('error', (err, ctx) => {
    log.error('server error', err, ctx)
});

app.listen(3000, () => {
    console.log('koa server is running at port 3000')
})