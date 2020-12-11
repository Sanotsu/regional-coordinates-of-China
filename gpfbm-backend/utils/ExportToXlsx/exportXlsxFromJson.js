const fs = require("fs");
const xl = require('excel4node');

const wb = new xl.Workbook();
const ws = wb.addWorksheet('pcas-code-with-coordinates');

exportXlsxFromJson = (saveExcelName = 'default.xlsx', filePath) => {

    console.log('正在转换为xlsx...')
    console.time("转换耗时")

    try {

        console.log('行政地址数据json文件地址: ', filePath)
        let data = fs.readFileSync(filePath).toString('utf8')
        // console.log(data)
        data = JSON.parse(data)

        const headingColumnNames = [
            "name",
            "code",
            "level",
            "mergeName",
            "lng",
            "lat",
            "info"
        ];

        try {
            //Write Column Title in Excel file
            // 把栏位标题写入Excel表格中第一行
            let headingColumnIndex = 1;
            headingColumnNames.forEach(heading => {
                ws.cell(1, headingColumnIndex++)
                    .string(heading)
            });

            //Write Data in Excel file
            // 从表格第二行开始,写入数据
            let rowIndex = 2;
            data.forEach(record => {
                let columnIndex = 1;
                Object.keys(record).forEach(columnName => {
                    ws.cell(rowIndex, columnIndex++)
                        .string(record[columnName] + '') // 有些栏位可能是number之类的,要改为字符串
                });
                rowIndex++;
            });

            wb.write(saveExcelName);

            console.log('xlsx转换完成')
            console.timeEnd("转换耗时")
        } catch (error) {
            console.error('把json写入xlsx文件失败 ', error)

        }
    } catch (error) {
        console.error('转换成xlsx时读取json文件失败 ', error)
    }
}

module.exports = {
    exportXlsxFromJson
}


let fileName = '../../../pcas-data/pcas-code-with-coordinates.xlsx'
let filePath = `../../../pcas-data/pcas-code-with-coordinates.json`

console.time('start')
exportXlsxFromJson(fileName, filePath)
console.timeEnd('start')