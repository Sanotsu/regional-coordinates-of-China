import { Component, OnInit } from '@angular/core';
import { LoadJsonService } from './service/load-json.service';

declare var BMap: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'gpfbm-angular';

  // 百度地图实例
  map: any;
  // 页面地图显示中间点
  point: any;

  // BMap.Geocoder()实例,专用来通过名称获取经纬度
  pointGeo: any;

  // // BMap.Geocoder()实例,专用来通过经纬度查询具体位置
  // locationGeo: any;


  // 通过名称无法查询到经纬度的
  resultNoLngLatArr = [];
  // 能够正常通过名称查询经纬度,又能经纬度反查名称的
  resultAreaArr = [];
  // 每个pcas-code-provence*.json文件处理完之后.存储的查询结果
  resultObj = {};

  constructor(private ljs: LoadJsonService) { }

  ngOnInit(): void {
    // 创建地图实例
    this.map = new BMap.Map('map-container');
    // 初始化地图，设置中心点坐标和地图级别
    this.point = new BMap.Point(116.4133836971231, 39.91092462465681);
    this.map.centerAndZoom(this.point, 15);
    // 鼠标滑轮缩放地图
    this.map.enableScrollWheelZoom(true);

    // 初始化两个Geocoder
    this.pointGeo = new BMap.Geocoder();
    // // 创建地理编码实例, 并配置参数获取乡镇级数据
    // this.locationGeo = new BMap.Geocoder({ extensions_town: true });
  }

  /**
   * 指定父级区域下指定行政地区 查询经纬度
   * @param areaName 需要查询经纬度的行政区域名称
   * @param parentArea  需要查询经纬度的行政区域的上一级区域名称
   * @param mergeParent 是当前指定查询行政地区的所有上级地区拼接的字符串,
   *            如果在 parentName 内查不到结果,那就用此拼接的值按照某种切割,使用 parentName上级范围去查
   * @param areaCode 需要查询经纬读的行政区域在pcas-code.json文件的code,不做操作,仅仅最后拼接所用
   * @param level 当前数据是第几层,也就是行政级别的第几层(省为1,市为2 ...),不做操作,仅仅最后拼接所用
   */
  getPoint(areaName, parentArea, mergeParent, areaCode, level): any {
    return new Promise((resolve, reject) => {

      // 预设好返回百度地图js API返回手动拼接的数据结构
      let areaObj = {
        name: areaName,
        code: areaCode,
        level,
        mergeName: parentArea + areaName,
        lng: 0,
        lat: 0,
        info: ''
      };

      // 查询指定父级区域内指定区域的经纬度 
      this.pointGeo.getPoint(areaName, (point) => {
        if (point) {
          const address = new BMap.Point(point.lng, point.lat);

          // 能够直接查到经纬度的结果
          areaObj.lng = address.lng;
          areaObj.lat = address.lat;
          areaObj.info = '直接查询获得';

          resolve({ area: areaObj });
        } else {
          /**
           * 如果某个地区(例如镇)在指定的上一级(例如区)内查不到,则直接指定最顶级(省)内去查询,提高查询命中率
           */
          let tempArr = mergeParent.split(",");
          if (tempArr.length > 1) {
            this.pointGeo.getPoint(areaName, (p) => {
              if (p) {
                const addr = new BMap.Point(p.lng, p.lat);

                // 将父级区域提升到省级查到的结果
                areaObj.lng = addr.lng;
                areaObj.lat = addr.lat;
                areaObj.info = '第二次通过省份查询成功';

                resolve({ area: areaObj });
              } else {
                // 没查到经纬度的区域也要记录(20201211 实测父级到省了都查得到)
                areaObj.info = '根据地址名称两次查询都查不到经纬度';
                resolve({ noLngLat: areaObj });
              }
            }, (tempArr.slice(0, 1)).join(''))
          }
        }
      }, parentArea);
    });
  }

  /**
   * 逐层递归调用获取指定 区域的经纬度函数
   * @param data json数据源中的数据及其子数组
   * @param level 当前数据是第几层,也就是行政级别的第几层(省为1,市为2 ...)
   * @param mergeParent 是当前指定查询行政地区的所有上级地区拼接的字符串,
   *            如果在 parentName 内查不到结果,那就用此拼接的值按照某种切割,使用 parentName上级范围去查
   * @param parentName 当前查询 行政名称A 的上一级名称B(从B中找A,避免A在不同大的省市区中有重名)
   */
  async getChilds(data, level, mergeParent = '', parentName = ''): Promise<any> {

    if (Array.isArray(data)) {

      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < data.length; index++) {
        const e = data[index];

        // 万一害怕百度地图API服务器显示,每个地址请求之后,间隔一点时间(不建议,几万个每个都间隔一点,猴年马月能查完啊)
        // this.sleep(1000);
        let rst;
        if (!parentName) {
          rst = await this.getPoint(e.name, e.name, e.name, e.code, level);
        } else {
          rst = await this.getPoint(e.name, parentName, mergeParent, e.code, level);
        }

        // 不同结果存入不同内容
        if (rst.noLngLat) {
          this.resultNoLngLatArr.push(rst.noLngLat);
          // 为了保持数据完整,即便没有查询到经纬度,也把该行政区域放进去,只不过经纬度为0而已
          this.resultAreaArr.push(rst.area);
        }
        if (rst.area) {
          this.resultAreaArr.push(rst.area);
        }

        if (e.children) {
          if (e.children.length > 0) {
            /**
             * 这个地方是因为,pcas-code.json文件 有些市级和区级是一样名称的地区,如果拼接到一起,百度地图的API无法识别
             * 例如 横沥镇 东坑镇 在广东省(省)东莞市(市)东莞市(区) 下,调用百度地图API寻找 广东省东莞市东莞市是找不到那两个镇的,在广东省东莞市 下可以
             * 又如  东华门街道 景山街道 在北京市(省)市辖区(市)东城区(区)下,调用百度地图API寻找 北京市市辖区东城区 下也找不到,在北京市东城区 下可以
             */
            let newParent = '';
            let newMergeParent = '';

            if (parentName.includes(e.name) || e.name === '市辖区') {
              newParent = parentName;
              newMergeParent = mergeParent;
            } else {
              newParent = parentName + e.name;
              newMergeParent = mergeParent ? mergeParent + ',' + e.name : e.name;
            }

            await this.getChilds(e.children, level + 1, newMergeParent, newParent);
          }
        }
      }
    }
    return;
  }

  // 获取经纬度并传给后台处理 
  async handlePcas(): Promise<any> {

    // tslint:disable-next-line: no-console
    console.time('total');
    // 这个31,其实就是拆分的小pcas-code-*.json文件的数量,31个省,但最好不要一次性就遍历处理31个,崩溃啊,溢出啊,挺麻烦的
    // 三五个一次吧,改动这个for循环就好
    for (let n = 1; n <= 2; n++) {

      try {
        const res = await this.ljs.loadpcas(n).toPromise();
        if (!res) {
          break;
        }
        // console.log(res);
        // tslint:disable-next-line: no-console
        console.time(`start${n}`);
        console.log(`开始查询...${n}`);
        await this.getChilds(res, 1);
        // tslint:disable-next-line: no-console
        console.timeEnd(`start${n}`);

        const data = {
          area: this.resultAreaArr, // 成功查到经纬度的结果
          noLngLat: this.resultNoLngLatArr.length > 0 ? this.resultNoLngLatArr : '', // // 查不到经纬度的结果,如果为空,给后台传空
          name: `pcas-code-provence${n}-with-coordinates` // 后台保存文件的名称
        };
        try {
          const writeRst = await this.ljs.pushDataToServer(data).toPromise();
          // 每个省份的文件处理完,把结果数组清空(2选一的写法,都写上示意)
          this.resultAreaArr.length = 0;
          this.resultAreaArr = [];
          this.resultNoLngLatArr.length = 0;
          this.resultNoLngLatArr = [];

          if (writeRst.code !== 20000) {
            break;
          }
        } catch (error) {
          console.log('等待后台写入文件失败');

        }

      } catch (error) {
        console.log(`加载pacs-code-provence${n}.json文件失败`);
      }
    }
    // tslint:disable-next-line: no-console
    console.timeEnd('total');

  }


  // 模拟线程阻塞
  sleep(milliSeconds): void {
    const startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds) { }
  }
}
