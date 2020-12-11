const fs = require('fs')

let handleJsonDirectory = (fileName, jsonDirectoryPath) => {

    try {
        // 遍历指定文件夹的文件
        let files = fs.readdirSync(jsonDirectoryPath);

        // 只把首层的文件当做设备的json,内部还有嵌套更多的文件夹则忽略
        files.forEach(f => {
            // 如果是文件,且文件名不含中文(简单根据"-"数量来判断)
            if (fs.lstatSync(`${jsonDirectoryPath}/${f}`).isFile() && f.split('-').length <= 5) {

                let tempJsonText = fs.readFileSync(`${jsonDirectoryPath}/${f}`).toString('utf8')
                fs.appendFileSync(fileName, tempJsonText, 'utf-8')
            }
        })

        // 是append的数据,结果就是[...][...][...],但json应该是[... , ... , ...],所以把 ][ 替换成逗号
        let tempJson = fs.readFileSync(fileName).toString('utf8')
        let newTemp = tempJson.replace(/\]\[/g, ",")
        fs.writeFileSync(fileName, newTemp, 'utf-8')

    } catch (err) {
        console.error(`文件的合并时出现了一些问题`, err)
    }
}

handleJsonDirectory('./pcas-code-with-location.json', '../pcas-code-with-location');