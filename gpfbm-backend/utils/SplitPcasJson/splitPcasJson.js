const fs = require('fs')

let splitPcasJson = async (jsonFilePath, jsonFileSavePath) => {

    try {
        let data = fs.readFileSync(jsonFilePath)

        let temp = JSON.parse(data.toString('utf-8'))

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


module.exports = {
    splitPcasJson
}

let jsonFilePath = '../../../pcas-data/pcas-code.json'
let jsonFileSavePath = '../../../pcas-data/provenceJson'

splitPcasJson(jsonFilePath, jsonFileSavePath)