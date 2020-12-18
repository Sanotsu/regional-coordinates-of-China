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
        mergeName: mergeParent + ',' + areaName,
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

  async testLocalSearch() {
    // let a = await this.LocalSearch('牌楼街道', '重庆市市辖区万州区', '重庆市,市辖区,万州区', 500101018, 4)
    // let a = await this.localSearch('海南省黎母山林场（海南黎母山省级自然保护区管理站）',
    //   '海南省省直辖县级行政区划琼中黎族苗族自治县',
    //   '海南省,省直辖县级行政区划,琼中黎族苗族自治县', '469030500', '4')

    let a = await this.localSearch('顺化瑶族乡',
      '贵州省黔东南苗族侗族自治州黎平县',
      '贵州省,黔东南苗族侗族自治州,黎平县', '469030500', '4')

    console.log(a)
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
  localSearch(areaName, parentArea, mergeParent, areaCode, level): any {
    return new Promise((resolve, reject) => {

      // // 预设好返回百度地图js API返回手动拼接的数据结构
      // areaName, parentArea, mergeParent, areaCode, level
      let areaObj = {
        name: areaName,
        code: areaCode,
        level,
        mergeName: mergeParent + ',' + areaName,
        lng: 0,
        lat: 0,
        info: '',
        tag: ''
      };
      try {
        const options = {
          onSearchComplete: async (result) => {
            /*
            StatusCode
            此常量用于描述对象当前状态。
            常量	描述
            BMAP_STATUS_SUCCESS	检索成功。对应数值 0 
            BMAP_STATUS_CITY_LIST	城市列表。对应数值 1 
            BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值 2 
            BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值 3 
            BMAP_STATUS_INVALID_KEY	非法密钥。对应数值 4 
            BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值 5 
            BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值 6 
            BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值 7 
            BMAP_STATUS_TIMEOUT	超时。对应数值 8 
            */

            // 判断状态是否正确
            if (local.getStatus() == '0') {
              // 检索POI数据是设定了显示数量的,不管设的多少,此处都预设认为第一个是最符合结果的,也是我们最后存入文件的哪一个
              // for (var i = 0; i < result.getCurrentNumPois(); i++) {
              //   console.log(result.getPoi(i));
              // }

              let temp = result.getPoi(0)

              // 能够直接查到经纬度的结果
              areaObj.lng = temp.point.lng;
              areaObj.lat = temp.point.lat;
              areaObj.info = '直接检索POI第一个结果成功!';
              areaObj.tag = temp.tags || '';
              resolve({ area: areaObj });
            } else {

              let msg = `检索POI失败,BMAP_STATUE_CODE:${local.getStatus()}`
              // areaObj.info = msg;
              // resolve({ noLngLat: areaObj })

              let obj = await this.getPoint(areaName, parentArea, mergeParent, areaCode, level)

              obj.area.info = msg + ' ,GetPoint结果: ' + obj.area.info

              resolve(obj)

            }
          }, pageCapacity: 4
        }

        // let local = new BMap.LocalSearch(parentArea, options);

        // 实测,这个和getPoint相反,不能过度扩大parent,要为上一级才能查到结果
        // 所以不用整体拼接的结果,仅用上一层(市内查县)或上两层(市县查镇)
        let tempArr = mergeParent.split(",");
        let queryParentName = (level === 4) ? tempArr[tempArr.length - 2] : tempArr[tempArr.length - 1];
        let local = new BMap.LocalSearch(queryParentName, options);

        // 有些乡镇名字很长，还有括号说明，这样是查不出来的，需要删除括号内只保留前面的内容查询才可以
        let queryName = areaName.split('（' ? '（' : '(')[0]
        local.search(queryName);

      } catch (error) {
        console.log(error)
        resolve('error')
      }

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
          // rst = await this.getPoint(e.name, e.name, e.name, e.code, level);
          rst = await this.localSearch(e.name, e.name, e.name, e.code, level);
        } else {
          // rst = await this.getPoint(e.name, parentName, mergeParent, e.code, level);
          rst = await this.localSearch(e.name, parentName, mergeParent, e.code, level);
        }

        // 不同结果存入不同内容
        if (rst.noLngLat) {
          this.resultNoLngLatArr.push(rst.noLngLat);
          // 为了保持数据完整,即便没有查询到经纬度,也把该行政区域放进去,只不过经纬度为0而已
          this.resultAreaArr.push(rst.noLngLat);
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
            } else {
              newParent = parentName + e.name;
            }

            // 这个mergeParent用于查询时已经只取省份了，所以不用提出同名（城市、区县和 直辖市 ）
            newMergeParent = mergeParent ? mergeParent + ',' + e.name : e.name;

            await this.getChilds(e.children, level + 1, newMergeParent, newParent);
          }
        }
      }
    }
    return;
  }

  // 获取经纬度并传给后台处理 
  async handlePcas(): Promise<any> {
    try {
      await this.ljs.noticeServer().toPromise();
    } catch (error) {
      console.log('通知后台开始记录日志失败', error);
    } finally {

      // tslint:disable-next-line: no-console
      console.time('total');
      // 这个31,其实就是拆分的小pcas-code-*.json文件的数量,31个省,但最好不要一次性就遍历处理31个,崩溃啊,溢出啊,挺麻烦的
      // 三五个一次吧,改动这个for循环就好
      for (let n = 23; n <= 31; n++) {

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
  }


  // 模拟线程阻塞
  sleep(milliSeconds): void {
    const startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds) { }
  }
}
