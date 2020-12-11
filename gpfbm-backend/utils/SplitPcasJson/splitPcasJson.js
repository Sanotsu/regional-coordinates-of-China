const fs = require('fs')

let getTownInProvince = async () => {
    let path = './pcas-code.json'
    try {
        let data = fs.readFileSync(path)

        let temp = JSON.parse(data.toString('utf-8'))

        let jsonFileSavePath = `./provenceJson`

        if (!fs.existsSync(jsonFileSavePath)) {
            fs.mkdirSync(jsonFileSavePath)
        }

        temp.forEach((e, i) => {
            let tempData = JSON.stringify([e])
            fs.writeFileSync(`${jsonFileSavePath}/pcas-code-provence${i + 1}.json`, tempData, 'utf-8');
        });

    } catch (error) {
        console.log('读取行政区域pcas-code.json文件或创建文件夹或写入文件失败', error)
    }
}

getTownInProvince()