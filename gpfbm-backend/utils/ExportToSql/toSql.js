const fs = require('fs')

let exportToSql = (fileName, jsonPath) => {

    // 建表语句
    let createTableStatement = `
-- ----------------------------
-- Created Time : ${new Date()}
-- ----------------------------

-- ----------------------------
-- Table structure for china_area
-- ----------------------------
DROP TABLE IF EXISTS \`china_area\`;
CREATE TABLE \`china_area\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
    \`name\` varchar(100) DEFAULT NULL COMMENT '名称',
    \`code\` varchar(100) DEFAULT NULL COMMENT '编码',
    \`level\` tinyint(4) DEFAULT NULL COMMENT '1、2、3、4，对应 省、市、区、镇',
    \`merge_name\` varchar(255) DEFAULT NULL COMMENT '全称',
    \`lng\` varchar(100) DEFAULT NULL COMMENT '经度',
    \`lat\` varchar(100) DEFAULT NULL COMMENT '纬度',
    \`info\` varchar(100) DEFAULT NULL COMMENT '简略说明',
    PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8; 


-- ----------------------------
-- Records of china_area
-- ----------------------------
`;

    try {
        // 先写建表语句
        fs.writeFileSync(fileName, createTableStatement, 'utf-8');

        // 再存插入语句
        let tempJson = fs.readFileSync(jsonPath).toString('utf8')

        let newTemp = JSON.parse(tempJson);

        for (let i = 0; i < newTemp.length; i++) {
            const e = newTemp[i];
            let insert = `INSERT INTO \`china_area\` VALUES ('${i + 1}','${e.name}','${e.code}','${e.level}','${e.mergeName}','${e.lng}','${e.lat}','${e.info}');\n`
            fs.appendFileSync(fileName, insert, 'utf-8');
        }

    } catch (err) {
        console.error(`文件的合并时出现了一些问题`, err)
    }
}


module.exports = {
    exportToSql
}

let fileName = '../../../pcas-data/pcas-code-with-coordinates.sql';
let jsonPath = '../../../pcas-data/pcas-code-with-coordinates.json';
exportToSql(fileName, jsonPath);