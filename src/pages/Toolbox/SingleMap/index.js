/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import {
  Form,
  Dropdown,
  Menu,
  Tooltip,
  Modal,
  Select,
  Pagination,
  Radio,
  Checkbox,
  Button,
  Input,
  Table,
  Icon,
  message
} from 'antd'
import _ from 'lodash'
import zrender from 'zrender'
import Heatmap from 'heatmap.js'
import moment from 'moment'
import echarts from 'echarts'
import { delay, getColor, gradientColors } from '@/utils/web'
import { changeWaferSelected } from '@/utils/action'
import { get, post, download } from '@/utils/api'
import CommonDrawer from '@/components/CommonDrawer'
import { SORT_LIST, SORT_ORDER_LIST, COMMANDS, TOOL_TIPS, MAP_TYPES, DEFECT_CLASS_LIST } from './constant'
import { reclassifyParams, getImages, updateCorrect, deleteCorrect, getX, getX2nd, getY, getDp, getDSATableData } from './service'
import { StyleSingleMap, StyleWafer, StylePareto, StyleChart, StyleDSA } from './style'
import { getWaferSelected } from '@/utils/store'

let drawer = null
let zr = null
let group = null
let rectRecords = []
let pointRecords = []
let timeout = null
let chosedArea = []
let chosedPoints = {}
let zoomRecords = {}
let mouseDownStartInner = false
let paretoChart = null
let dsaChart = null

class SingleMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      /* index */
      mapType: 'Map/Pareto',
      dsa: false,
      dsaInfo: {},
      singleWaferKey: [],
      selectAction: '',
      filter: {},
      stxaxis: {
        '1stXCode': 'mb',
        '2ndXCode': '',
        yCode: '100'
      },
      selectedBar: [],
      colorsObj: {},
      /* Wafer */
      imageInfos: [],
      angel: 0,
      customizeAngel: false,
      selectedAction: '',
      data: [],
      // 方格实例记录
      rotationDialog: false,
      rotationDegree: '',
      overlapType: '',
      overlapTypeOptions: ['Bin Map', 'Bit Map', 'WAT', 'Metrology'],
      overlapDialog: false,
      heatMin: 0,
      heatMax: 0,
      // 点的坐标和它的id集合映射
      pointIdsMapping: [],
      reclassifyDialog: false,
      correct: [],
      reclassifyForm: {},
      heatmapInstance: null,
      deleteDefectsDialog: false,
      deleteDefectsOptions: ['清除选中点', '清除选中点并导出', '删除选中点', '删除选中点并导出'],
      deleteDefectsType: '',
      /* Pareto */
      xValue: 'mb',
      x2ndValue: '',
      yValue: '100',
      x: {},
      x2n: {},
      y: {},
      paretoData: null,
      ifAvg: 'sum',
      allBar: [],
      /* Image Detail */
      pageSize: 10,
      infoPages: [],
      /* DSA Pareto */
      sortName: '1',
      dsaOrder: '1',
      dsaData: null,
      colorsArr: [],
      disappearBar: [],
      allSelectBar: [],
      allDisappearBar: [],
      typeBar: '',
      dsaTableData: [],
      /* map info */
      indexStyle: {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true
      },
      // Filters
      tags: {
        mbs: [],
        abc: [],
        rbs: [],
        tests: [],
        clusterIds: [],
        repeaterIds: [],
        zoneIds: [],
        subDieIds: []
      },
      // 用户当前勾选的过滤条件
      tagsSeleted: {
        mbs: [],
        adc: [],
        rbs: [],
        tests: [],
        clusterIds: [],
        repeaterIds: [],
        zoneIds: [],
        subDieIds: []
      },
      defectClass: null,
      adderFlag: true,
      defectSize: ['', ''],
      total: 0,
      pageNo: 1
    }
  }

  async componentDidMount() {
    // const { items, itemSelected, defect } = this.props
    
    // const { wafers, bars } = getWaferSelected()
    const wafers = [
      {
        lotId: "B0001.000",
        stepId: "M3_CMP",
        waferNo: "1",
        productId: "Device01",
        scanTm: "2018-06-05 12:30:35",
        defects: [],
        defectIdRedisKey: "58ba0d53-caee-49da-af83-b7a190ccac2c"
      },
      {
        lotId: "B0001.000",
        stepId: "P1_ASI",
        waferNo: "1",
        productId: "Device01",
        scanTm: "2018-06-05 12:30:35",
        defects: [],
        defectIdRedisKey: "ff8d6098-8f9b-447b-857c-c284323b2d50"
      },
      // {
      //   lotId: "B0001.000",
      //   stepId: "M1_CMP",
      //   waferNo: "1",
      //   productId: "Device01",
      //   scanTm: "2018-05-31 13:12:35",
      //   defects: [],
      //   defectIdRedisKey: "4e9d46fe-2bc4-47a2-a7aa-78d8b6714112"
      // },
      // {
      //   lotId: "B0001.000",
      //   stepId: "SIN_RM",
      //   waferNo: "1",
      //   productId: "Device01",
      //   scanTm: "2018-06-04 12:30:35",
      //   defects: [],
      //   defectIdRedisKey: "9f18f167-7a86-43e7-9306-3ad27de14078"
      // },
      // {
      //   lotId: "B0001.000",
      //   stepId: "M5_CMP",
      //   waferNo: "1",
      //   productId: "Device01",
      //   scanTm: "2018-06-09 12:30:35",
      //   defects: [],
      //   defectIdRedisKey: "6891bd43-9aaa-48d5-9639-4089602de5e9"
      // }
    ]
    this.setState({ singleWaferKey: wafers })
    this.onParetoChartInit()
    this.onDSAChartInit()
    this.onWaferCreated()
    this.onParetoCreated()
  }
  // 初始化 ParetoChart, 绑定点击事件
  onParetoChartInit = () => {
    const paretoChartDom = document.getElementById('pareto-chart')
    if (paretoChartDom) {
      paretoChart = echarts.init(paretoChartDom)
      paretoChart.on('click', params => this.onParetoChartClick(params))
    } else {
      console.log('paretoChartDom not found')
    }
  }
  // 初始化 DSAChart, 绑定点击事件
  onDSAChartInit = () => {
    const dsaChartDom = document.getElementById('dsa-chart')
    if (dsaChartDom) {
      dsaChart = echarts.init(dsaChartDom)
      dsaChart.on('click', params => this.onDSAChartClick(params))
    } else {
      console.log('dsaChartDom not found')
    }
  }

  // computed
  getDataOption = () => {
    const { data } = this.state
    return data[0] || {}
  }

  // watch selectAction change
  watchStxaxis = () => {
    this.onWaferInit()
  }
  watchDSAInfo = () => {
    this.onWaferInit()
  }
  watchSelectAction = () => {
    this.onWaferInit(zoomRecords)
  }
  watchSelectedBar = () => {
    this.renderPoints()
  }
  watchDSASort = async () => {
    await delay(1)
    this.setState({
      disappearBar: [],
      selectedBar: []
    })
  }

  // Wafer 创建 【点击defect查看图片、鼠标滚轮事件】
  onWaferCreated = async () => {
    const { name } = this.props
    const zrDom = document.getElementById(`main-${name}`)
    if (!zrDom) {
      console.log('zrDom not found')
      return
    }
    zr = zrender.init(zrDom)
    group = new zrender.Group()
    await delay(1)
    //  判断是否点击了小圆点
    group.on('click', async e => {
      if (e.target.shape.r) {
        const imgDom = document.getElementById(`img-${name}`)
        if (!imgDom) {
          console.log('imgDom not found')
          return
        }
        imgDom.style.display = 'none'
        const x = e.target.shape.cx
        const y = e.target.shape.cy
        const emitObj = []
        this.pointIdsMapping.forEach((item, index) => {
          const pointCoordinate = item[`${x},${y}`]
          if (pointCoordinate) {
            const { lotId, waferNo, productId, stepId, scanTm } = this.data[index]
            const defectsInfomation = { lotId, waferNo, productId, stepId, scanTm, defects: pointCoordinate }
            emitObj.push(defectsInfomation)
          }
        })
        const res = await getImages({
          imageInfo: emitObj,
          singleGalleryFlag: 'singleMap'
        })
        if (!_.isEmpty(res)) {
          imgDom.style.top = e.offsetY + 'px'
          imgDom.style.left = e.offsetX + 5 + 'px'
          imgDom.style.display = 'block'
          const data = _.cloneDeep(res)
          let arr = []
          for (const defectInfo in data) {
            const [lotId, , , waferNo, , defects] = defectInfo.split('|')
            data[defectInfo].forEach(item => {
              arr.push({ lotId, waferNo, defects, image: 'http://161.189.50.41:80' + item })
            })
          }
          this.setState({ imageInfos: arr })
        }
      }
    })
    this.onWaferInit()
    this.checkArea()
    zr.on('mousewheel', e => {
      const dataOption = this.getDataOption()
      const { waferLocation } = dataOption
      let times
      e = e || window.event
      const { mapType, zoomTimes } = this.state
      if (mapType !== 'Heat Map' && e.wheelDelta) {
        //第一步：先判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) {
          //当滑轮向上滚动时
          times = zoomTimes * 2
          // console.log(e.offsetX, e.offsetY)
        }
        if (e.wheelDelta < 0) {
          //当滑轮向下滚动时
          if (zoomTimes !== 1) {
            times = zoomTimes / 2
          }
        }
        const x = parseInt((e.offsetX - waferLocation.x) / zoomTimes)
        const y = parseInt((e.offsetY - waferLocation.y) / zoomTimes)
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          this.onWaferInit({ times, x, y })
        }, 100)
      }
    })
  }
  //选择区域
  checkArea = () => {
    let x, y, distanceX, distanceY, moveRect
    zr.on('mousedown', e => {
      const { selectedAction } = this.state
      if (selectedAction === 'chooseArea') {
        x = e.offsetX
        y = e.offsetY
        mouseDownStartInner = true
      }
    })
    zr.on('mousemove', e => {
      group.remove(moveRect)
      if (mouseDownStartInner) {
        moveRect = new zrender.Rect({
          shape: { x: x, y: y, width: e.offsetX - x, height: e.offsetY - y },
          style: { fill: '#ccc', opacity: 0.5 }
        })
        group.add(moveRect)
      }
    })
    zr.on('mouseup', e => {
      group.remove(moveRect)
      distanceX = e.offsetX - x
      distanceY = e.offsetY - y
      if (mouseDownStartInner) {
        const boundingRect = new zrender.Rect({
          shape: { x: x, y: y, width: distanceX, height: distanceY },
          style: { fill: '#ccc', opacity: 0.5 }
        })
        group.add(boundingRect)
        chosedArea.push(boundingRect)
        mouseDownStartInner = false
      }
    })
  }
  // 下拉菜单展开
  onDropDownClick = ({ key }) => {
    if (key === 'Rotation') {
      this.setState({
        rotationDegree: '',
        rotationDialog: true
      })
    } else if (key === 'Export to CSV') {
      console.log('csv')
    } else if (key === 'Export klarf') {
      this.download({ singleWaferKey: this.singleWaferKey })
    } else if (key === 'Send to review') {
      console.log('review')
    } else if (key === 'Overlap') {
      this.overlapDialog = true
    }
  }
  onDropDownReset = () => {
    this.setState({
      overlapType: '',
      angel: 0
    })
    this.renderRects()
    const dataOption = this.getDataOption()
    const zoomTimes = dataOption.magnification || 1
    this.setState({ zoomTimes })
    if (parseInt(zoomTimes) === 1) this.drawIsogon()
  }
  onMapTypeChange = async e => {
    const mapType = e.target.value
    this.setState({
      mapType,
      angel: 0,
      overlapType: ''
    })
    await this.onWaferInit()
    await delay(1)
    const { name } = this.props
    const container = document.getElementById(`main-${name}`)
    if (!container) {
      console.log('heat map dom not found')
      return
    }
    if (mapType === 'Heat Map') {
      this.renderHeatmap(container)
    } else {
      container.style.borderRadius = ''
      container.style.overflow = ''
      if (container.getElementsByClassName('heatmap-canvas')[0]) {
        container.removeChild(container.getElementsByClassName('heatmap-canvas')[0])
      }
    }
  }
  // 热力图
  renderHeatmap = container => {
    const dataOption = this.getDataOption()
    if (!dataOption || !dataOption.dies) {
      console.log('no data')
      return
    }
    const dieHeat = dataOption.dies.filter(item => item.dc > 0)
    // console.log(dieHeat)
    const data = []
    let max = dieHeat[0].dc
    let min = dieHeat[0].dc
    dieHeat.forEach(item => {
      min = Math.min(min, item.dc)
      max = Math.max(max, item.dc)
      data.push({ x: item.x, y: item.y, value: item.dc })
    })
    this.setState({
      heatMax: max,
      heatMin: min
    })
    const config = { container, maxOpacity: 1, minOpacity: 0.1, blur: 1, radius: 20 * 4 }
    const heatmapInstance = Heatmap.create(config)
    heatmapInstance.setData({ min, max, data })
    container.style.borderRadius = '50%'
    container.style.overflow = 'hidden'
  }
  // image detail
  onImageDetailPageChange = pageNo => {
    const pageStart = (pageNo - 1) * 10
    const { imageInfos } = this.state
    const infoPages = imageInfos.slice(pageStart, pageStart + 10)
    this.setState({ infoPages })
  }
  onDoAction = async func => {
    console.log(func)
    this.setState({ selectedAction: func })
    if (func === 'chooseArea') {
      this.setState({ angel: 0 })
    } else if (func === 'reply') {
      this.setState({ angel: 0 })
      chosedArea.forEach(item => {
        group.remove(item)
      })
      chosedArea = []
    } else if (func === 'podcast') {
      this.setState({ angel: 0 })
      if (chosedArea.length > 0) {
        this.renderPoints()
        chosedArea.forEach(item => {
          group.remove(item)
        })
        chosedArea = []
      } else {
        message.info('没有选择的标记区域！')
      }
    } else if (func === 'star') {
      if (!_.isEmpty(chosedPoints)) {
        // const { chosedPoints } = this.state
        this.setState({
          angel: 0,
          selectAction: 'hold',
          singleWaferKey: this.deliveryPoints()
        })
        this.onWaferInit(zoomRecords)
      } else {
        message.info('没有被标记的点！')
      }
    } else if (func === 'star0') {
      if (!_.isEmpty(chosedPoints)) {
        this.setState({
          angel: 0,
          selectAction: 'clean',
          singleWaferKey: this.deliveryPoints()
        })
        this.onWaferInit(zoomRecords)
      } else {
        message.info('没有被标记的点！')
      }
    } else if (func === 'reclassify') {
      if (!_.isEmpty(chosedPoints)) {
        this.setState({
          reclassifyDialog: true,
          angel: 0
        })
        const correct = await reclassifyParams({ singleWaferKey: this.deliveryPoints() })
        this.setState({ correct })
      } else {
        message.info('没有被标记的点！')
      }
    } else if (func === 'trash') {
      if (!_.isEmpty(chosedPoints)) {
        this.setState({
          angel: 0,
          deleteDefectsDialog: true
        })
      } else {
        message.info('没有标记需要删除的点！')
      }
    } else if (func === 'refresh') {
      this.setState({
        angel: 0,
        selectAction: ''
      })
      chosedPoints = {}
      this.onWaferInit()
    }
  }
  /* - - - - - - - - - - - - Wafer - - - - - - - - - - - -  */
  // Wafer 初始化
  onWaferInit = async options => {
    group.removeAll()
    const res = await this.getData(options)
    this.setState({ data: res })
    const { mapType, data } = this.state
    if (mapType === 'Map/Pareto' || mapType === 'Heat Map') this.renderOutterCircle()
    this.renderRects()
    this.renderPoints()
    this.recordZoom()
    if (mapType === 'Map/Pareto' && data[0].magnification == 1) this.drawIsogon()
    const { dsa } = this.state
    if (dsa) this.onDSAInit()
    else this.onParetoInit()
  }
  getData = async ({ times = 1, x = 200, y = 200 } = {}) => {
    await delay(1)
    let src = ''
    const { dsaInfo, mapType } = this.state
    if (_.isEmpty(dsaInfo)) {
      src = `swm${MAP_TYPES[mapType]}`
    } else {
      src = `dm${MAP_TYPES[mapType]}`
    }
    const { singleWaferKey, filter, stxaxis, selectAction } = this.state
    return await post(src, {
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: `${times}`, centralLocation: x + ',' + y },
      filter,
      pareto: stxaxis,
      selectAction,
      dsaOrder: dsaInfo.dsaOrder || '',
      sortName: dsaInfo.sortName || ''
    })
  }

  // 记录本次放大数据
  recordZoom = () => {
    const dataOption = this.getDataOption()
    const { magnification: times, centralLocation: center } = dataOption
    zoomRecords = { times, x: center.x, y: center.y }
  }
  /* - - - - - - - - - - - - 绘图相关 - - - - - - - - - - - -  */
  //画外层大圆
  renderOutterCircle = () => {
    // 半径=画布长度*放大倍数/2    canvasLength*magnification/2
    const dataOption = this.getDataOption()
    const circleR = (dataOption.canvasLength * dataOption.magnification) / 2
    const circleX = dataOption.waferLocation.x + circleR
    const circleY = dataOption.waferLocation.y + circleR
    // 外层大圆
    const circle = new zrender.Circle({
      shape: { cx: circleX, cy: circleY, r: circleR },
      style: { fill: 'none', stroke: '#f00' }
    })
    group.add(circle)
    zr.add(group)
  }
  // 清除方格
  clearRects = () => {
    rectRecords.forEach(item => {
      group.remove(item)
    })
  }
  // 渲染方格
  renderRects = () => {
    this.clearRects()
    // 单个方格宽度、单个方格高度、有效方格数据、填充方格数据
    const dataOption = this.getDataOption()
    // console.log('dataOption', dataOption)
    const { dieWidth: width, dieHeight: height, dies = [], noScanDies = [] } = dataOption
    const firstDie = dies[0] || { bin: 0 }
    let binMax = firstDie.bin
    let binMin = firstDie.bin
    dies.forEach(({ bin }) => {
      binMax = binMax > +bin ? binMax : +bin
      binMin = binMin < +bin ? binMin : +bin
    })
    // 条状渐变色填充
    let bgColor = []
    const { mapType, overlapType } = this.state
    if (mapType === 'Map/Pareto' && overlapType === 'Bin Map') bgColor = gradientColors('#ff0', '#f00', binMax - binMin + 1)
    // 有效方格渲染（填充色获取+方格渲染）
    const fillStyle = { fill: 'none', stroke: '#14f1ff', opacity: 0.5 }
    dies.forEach(({ bin, x, y }) => {
      if (mapType === 'Map/Pareto' && overlapType === 'Bin Map') {
        fillStyle.fill = bin === '0' ? '#67c23a' : bgColor[bin]
      }
      const boundingRect = new zrender.Rect({ shape: { x, y, width, height }, style: fillStyle })
      group.add(boundingRect)
      rectRecords.push(boundingRect)
    })
    // 填充方格渲染
    if (noScanDies) {
      noScanDies.forEach(({ x, y }) => {
        let boundingRect = new zrender.Rect({
          shape: { x, y, width, height },
          style: { fill: '#eee', stroke: '#ccc' }
        })
        group.add(boundingRect)
        rectRecords.push(boundingRect)
      })
    }
    zr.add(group)
  }
  // 三角形
  drawIsogon = () => {
    const Isogon = new zrender.Isogon({ shape: { x: 200, y: 400, r: 13, n: 3 }, style: { fill: 'blue' } })
    group.add(Isogon)
    zr.add(group)
  }
  // 渲染圆点
  renderPoints = async () => {
    await delay(1)
    this.clearPoints()
    this.setState({ pointIdsMapping: [] })
    const { data } = this.state
    // console.log('renderPoints', data)
    data.forEach(({ defectInfos }, idx) => {
      this.renderSingleMap(defectInfos, idx)
    })
    this.waferDefectsGroup()
  }
  // 清除圆点
  clearPoints() {
    pointRecords.forEach(item => {
      group.remove(item)
    })
  }
  // 渲染单张图的点
  renderSingleMap = async (defectInfos, index) => {
    await delay(1)
    const { pointIdsMapping, selectedBar, colorsObj } = this.state
    // console.log('渲染单张图的点', Object.keys(defectInfos).length)
    let pointColor
    const colorFlag = _.isEmpty(colorsObj)
    // 通过 seriesName 生成不同的颜色，目前seriesName都是空字符串，暂时不在循环里做重复无用计算
    pointColor = '#' + getColor('')
    pointIdsMapping[index] = {}
    this.setState({ pointIdsMapping })
    for (const name in defectInfos) {
      for (const seriesName in defectInfos[name]) {
        if (!colorFlag) {
          pointColor = colorsObj[name + '-' + seriesName]
          console.log('颜色', colorFlag, pointColor)
        }
        const point = defectInfos[name][seriesName]
        if (!selectedBar.includes(name + '-' + seriesName)) {
          for (const coordinate in point) {
            const idList = point[coordinate]
            // 合并同一个坐标下的id，
            const pointIds = pointIdsMapping[index][coordinate] || []
            pointIdsMapping[index][coordinate] = [...pointIds, ..._.difference(idList, pointIds)]
            // 处理点
            this.dealPoint(coordinate, idList, pointColor, index)
          }
        }
      }
    }
    this.setState({ pointIdsMapping })
    zr.add(group)
  }
  // 渲染出的点的id集合
  waferDefectsGroup = () => {
    let waferDefects = []
    const { pointIdsMapping, data } = this.state
    for (let i in pointIdsMapping) {
      let singleWaferDefects = []
      const { lotId: lotId, waferNo: waferNo, productId: productId, stepId: stepId, scanTm: scanTm } = data[i]
      for (let j in pointIdsMapping[i]) {
        singleWaferDefects.push(...pointIdsMapping[i][j])
      }
      waferDefects.push({ lotId, waferNo, productId, stepId, scanTm, defects: singleWaferDefects || [] })
    }
    const { name } = this.props
    this.props.changeWaferSelected({ page: name, wafers: waferDefects })
  }
  // 处理单个点
  dealPoint = (coordinate, idList, pointColor, index) => {
    let [pointX, pointY] = coordinate.split(',')
    // 点在选中区域时需要塞进chosedPoints
    if (chosedArea.some(area => area.contain(+pointX, +pointY))) {
      this.setChosedPoints(index, coordinate)
    }
    // 单个点的渲染及记录
    const { selectedAction } = this.state
    const chosedPoint = chosedPoints[index] || []
    let isStar = idList.some(id => chosedPoint.includes(id))
    if (selectedAction === 'star') {
      isStar = 1
    }
    if (selectedAction === 'star-o') {
      isStar = 0
    }
    const Point = this.renderPoint({ x: +pointX, y: +pointY, color: pointColor }, isStar)
    Point.attr({ coordinate, index })
    group.add(Point)
    pointRecords.push(Point)
  }
  // 渲染单个点({横坐标，纵坐标，填充色}，是否星形点)
  renderPoint = ({ x, y, color }, isStar) => {
    const shape = isStar ? { cx: x, cy: y, n: 4, r: 5 } : { cx: x, cy: y, r: 2 }
    return new zrender[isStar ? 'Star' : 'Circle']({ shape, style: { fill: color } })
  }
  // 选中点及基本信息
  deliveryPoints = () => {
    const singleMapArr = []
    const { data } = this.state
    data.forEach((item, index) => {
      const { lotId, waferNo, productId, stepId, scanTm } = item
      singleMapArr.push({
        lotId,
        waferNo,
        productId,
        stepId,
        scanTm,
        defects: chosedPoints[index] || [],
        redisKey: ''
      })
    })
    return singleMapArr
  }
  /* - - - - - - - - - - - - 绘图相关 End - - - - - - - - - - - -  */
  setChosedPoints = (index, coordinate) => {
    const { pointIdsMapping } = this.state
    let chosedPoint = _.cloneDeep(chosedPoints[index]) || []
    const newPoint = _.difference(pointIdsMapping[index][coordinate], chosedPoint)
    chosedPoints[index] = [...chosedPoint, ...newPoint]
  }
  // 晶元旋转
  onWaferRotate = () => {
    const { rotationDegree } = this.state
    this.setState({
      angel: rotationDegree,
      rotationDialog: false
    })
  }

  onReclassifyFormChange = (key, value) => {
    const { reclassifyForm } = this.state
    reclassifyForm[key] = value
    this.setState({ reclassifyForm })
  }

  // 选中下载点及基本信息
  downloadPoints() {
    const singleMapArr = []
    const { data } = this.state
    for (const i in chosedPoints) {
      const { lotId, waferNo, productId, stepId, scanTm } = data[i]
      singleMapArr.push({
        lotId,
        waferNo,
        productId,
        stepId,
        scanTm,
        defects: chosedPoints[i] || [],
        redisKey: ''
      })
    }
    return singleMapArr
  }
  // 分类
  onReclassify = async () => {
    this.setState({ reclassifyDialog: false })
    const { reclassifyForm } = this.state
    await updateCorrect({
      singleWaferKey: this.downloadPoints(),
      correct: reclassifyForm
    })
    chosedPoints = {}
    this.onWaferInit()
  }
  // 分类 & 下载
  onReclassifyDownload = async () => {
    await this.onReclassify()
    const { singleWaferKey } = this.state
    download('export', { singleWaferKey })
  }

  // 删除选中点
  onDefectsDelete = async () => {
    this.setState({ deleteDefectsDialog: false })
    const { deleteDefectsType, singleWaferKey } = this.state
    if (deleteDefectsType === '清除选中点' || deleteDefectsType === '清除选中点并导出') {
      this.setState({
        singleWaferKey: this.deliveryPoints(),
        selectAction: 'clean'
      })
      this.watchSelectAction()
    }
    if (deleteDefectsType === '清除选中点并导出') download('export', { singleWaferKey: this.deliveryPoints() })
    if (deleteDefectsType === '删除选中点' || deleteDefectsType === '删除选中点并导出') {
      await deleteCorrect({ singleWaferKey: this.downloadPoints() })
      chosedPoints = {}
      this.setState({ selectAction: '' })
      this.onWaferInit()
    }
    if (deleteDefectsType === '删除选中点并导出') download('export', { singleWaferKey })
    this.setState({ deleteDefectsType: '' })
  }

  // 切换信息 显示与隐藏
  onInfoToggle = index => {
    const { indexStyle } = this.state
    indexStyle[index] = !indexStyle[index]
    this.setState({ indexStyle })
  }

  /* - - - - - - - - - - - - Pareto - - - - - - - - - - - -  */
  // Pareto 创建
  onParetoCreated = async () => {
    const { xValue, x2ndValue } = this.state
    const x = await getX()
    const x2n = await getX2nd(xValue)
    const y = await getY(xValue, x2ndValue)
    this.setState({ x, x2n, y })
    this.onParetoInit()
  }
  // Pareto 初始化
  onParetoInit = async obj => {
    await delay(1)
    const { singleWaferKey, filter, stxaxis, selectAction } = this.state
    const paretoData = await post('swp', {
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: 1, centralLocation: '200,200' },
      filter,
      pareto: obj || stxaxis,
      selectAction
    })
    this.setState({ paretoData })
    this.onGenerateParetoChart()
  }
  // Pareto 图表
  onGenerateParetoChart = async () => {
    await delay(1)
    const { paretoData, x, x2n, y, xValue, stxaxis, ifAvg, singleWaferKey } = this.state
    const opt = {
      width: 'auto',
      legend: { type: 'scroll' },
      tooltip: {},
      xAxis: { type: 'category', name: x[xValue] },
      yAxis: { type: 'value', name: y[stxaxis.yCode] },
      dataZoom: [
        {
          show: true,
          startValue: 0,
          endValue: 9,
          xAxisIndex: [0]
        }
      ],
      dataset: {
        source: []
      },
      series: []
    }
    if (paretoData) {
      // 处理数据
      const arr = []
      const hold = []
      const holdArr = []
      const colorArr = []
      const seriesArr = []
      arr[0] = ['product']
      let responseData = _.cloneDeep(paretoData)
      if (responseData.paretoValue.xAxisData.length && responseData.paretoValue.series.length) {
        responseData.paretoValue.xAxisData.forEach((item, index) => {
          arr[index + 1] = [item]
        })
        responseData.paretoValue.series.forEach(item => {
          arr[0].push(item.name)
          item.data.forEach((jtem, j) => {
            if (ifAvg === 'avg') {
              arr[j + 1].push(Math.round(jtem / singleWaferKey.length))
            } else {
              arr[j + 1].push(jtem)
            }
          })
          hold.push(item.holdValue)
          colorArr.push('#' + getColor(item.name))
        })
        hold.forEach((item, i) => {
          holdArr.push({
            value: item,
            xAxis: i,
            yAxis: item
          })
        })
        const { selectedBar } = this.state
        colorArr.forEach(item => {
          seriesArr.push({
            type: 'bar',
            // barWidth: 20,
            markPoint: {
              data: holdArr
            },
            itemStyle: {
              color: param => {
                param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
                const idx = selectedBar.indexOf(param.name + '-' + param.seriesName)
                return ~idx ? '#ccc' : item
              }
            },
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            }
          })
        })
      }
      // 填充值
      opt.dataset.source = arr
      opt.series = seriesArr
    }
    if (paretoChart) paretoChart.setOption(opt)
  }
  onChangeX = async xValue => {
    this.setState({
      xValue,
      x2ndValue: '',
      yValue: ''
    })
    const x2n = await getX2nd(xValue)
    const y = await getY(xValue, '')
    this.setState({ x2n, y })
  }
  onChangeX2nd = async x2ndValue => {
    this.setState({
      x2ndValue,
      yValue: ''
    })
    const { xValue } = this.state
    const y = await getY(xValue, x2ndValue)
    this.setState({ y })
  }
  onChangeY = yValue => {
    this.setState({ yValue })
  }
  onParetoSearch = () => {
    const { xValue, x2ndValue, yValue } = this.state
    const paretoObj = {
      '1stXCode': xValue,
      '2ndXCode': x2ndValue,
      yCode: yValue
    }
    this.onParetoInit(paretoObj)
    this.setState({
      stxaxis: paretoObj,
      selectedBar: []
    })
    this.watchStxaxis()
  }
  onParetoClear = () => {
    const allBar = []
    const { paretoData } = this.state
    if (!paretoData || !paretoData.paretoValue || !paretoData.paretoValue.xAxisData || !paretoData.paretoValue.series) {
      consoe.log('paretoData data error')
      return
    }
    paretoData.paretoValue.xAxisData.forEach(x => {
      paretoData.paretoValue.series.forEach(s => {
        allBar.push(x + '-' + s.name)
      })
    })
    this.setState({
      allBar,
      selectedBar: allBar
    })
    this.watchStxaxis()
  }
  onAvgChange = ifAvg => {
    this.setState({ ifAvg })
    this.onGenerateParetoChart()
  }
  onParetoChartClick = data => {
    const { selectedBar } = this.state
    const bar = _.cloneDeep(selectedBar)
    data.seriesName = data.seriesName.substring(0, 6) === 'series' ? '' : data.seriesName
    const index = bar.indexOf(data.name + '-' + data.seriesName)
    if (~index) {
      bar.splice(index, 1)
    } else {
      bar.push(data.name + '-' + data.seriesName)
    }
    this.setState({ selectedBar: bar })
    this.watchSelectedBar()
  }
  /* - - - - - - - - - - - - Pareto End - - - - - - - - - - - -  */
  
  /* - - - - - - - - - - - - DSA - - - - - - - - - - - -  */
  // DSA Pareto 切换
  onDsaToggle = () => {
    const { dsa } = this.state
    this.setState({ dsa: !dsa, colorsObj: {}, selectedBar: [], dsaInfo: dsa ? {} : { dsaOrder: '1', sortName: '1' } })
    this.watchDSAInfo()
  }
  // DSA 排序
  onDSASortChange = (index, value) => {
    if (index === 1) this.setState({ dsaOrder: value })
    else this.setState({ sortName: value })
    this.onDSAInit()
  }
  // DSA 初始化 === created
  onDSAInit = async () => {
    await delay(1)
    const { singleWaferKey, dsaOrder, sortName } = this.state
    const dsaData = await getDp({
      singleWaferKey,
      dsaOrder,
      sortName
    })
    this.setState({
      dsaData,
      allDisappearBar: [],
      allSelectBar: []
    })
    this.dealDsaData()
    this.watchSelectedBar()
  }
  // DSA 数据处理
  dealDsaData = async () => {
    await delay(1)
    const { dsaData, colorsArr, allDisappearBar, allSelectBar } = this.state
    dsaData.paretoValue.series.forEach(s => {
      const tagLength = s.tag.length
      colorsArr.push('#' + getColor(s.name))
      s.tag.forEach((t, index) => {
        if (index > tagLength / 2) {
          allDisappearBar.push(s.name + '-' + t)
        } else {
          allSelectBar.push(s.name + '-' + t)
        }
      })
    })
    const colorsObj = {}
    const len = colorsArr.length || 1
    dsaData.paretoValue.series.forEach(s => {
      s.tag.forEach((t, index) => {
        colorsObj[s.name + '-' + t] = colorsArr[index % len]
      })
    })
    this.setState({ colorsArr, allDisappearBar, allSelectBar, colorsObj })
    this.onGenerateDSAChart()
  }
  // DSA 图表
  onGenerateDSAChart = async () => {
    await delay(1)
    const { dsaData, selectedBar, disappearBar } = this.state
    const opt = {
      width: '800',
      legend: {},
      tooltip: {
        formatter(params) {
          let tag = ''
          dsaData.paretoValue.series.some(item => {
            if (item.name == params.name) {
              tag = item['tag'][params.seriesIndex]
            }
          })
          return tag
        }
      },
      dataset: {
        source: []
      },
      xAxis: { type: 'category' },
      yAxis: {},
      series: []
    }
    if (dsaData) {
      const series = dsaData.paretoValue.series
      const colors = []
      series.forEach(item => {
        opt.dataset.source.push([item.name, ...item.data])
        colors.push(getColor(item.name))
      })
      series[0].data.forEach((item, index) => {
        const i = index
        opt.series.push({
          type: 'bar',
          stack: 'one',
          label: {
            normal: {
              show: true,
              position: 'inside',
              color: '#fff'
            }
          },
          itemStyle: {
            color: param => {
              let tag = ''
              const len = colors.length || 1
              dsaData.paretoValue.series.some(item => {
                if (item.name == param.name) {
                  tag = item['tag'][param.seriesIndex]
                }
              })
              const value = param.value[param.seriesIndex + 1]
              let idx = 0
              if (value > 0) {
                idx = selectedBar.indexOf(param.name + '-' + tag)
              }
              if (value < 0) {
                idx = disappearBar.indexOf(param.name + '-' + tag)
              }
              return ~idx ? '#ccc' : '#' + colors[i % len]
            }
          }
        })
      })
    }
    if (dsaChart) dsaChart.setOption(opt)
  }
  onDSAChartClick = params => {
    let tag = ''
    const { dsaData, selectedBar } = this.state
    dsaData.paretoValue.series.some(item => {
      if (item.name == params.name) {
        tag = item['tag'][params.seriesIndex]
      }
    })
    if (params.value[params.seriesIndex + 1] > 0) {
      let idx = selectedBar.indexOf(params.name + '-' + tag)
      if (~idx) {
        selectedBar.splice(idx, 1)
      } else {
        selectedBar.push(params.name + '-' + tag)
      }
      this.setState({
        typeBar: '',
        disappearBar: [],
        selectedBar
      })
    } else {
      const { allSelectBar, allDisappearBar } = this.state
      let { typeBar, disappearBar } = this.state
      const disBar = _.cloneDeep(allDisappearBar)
      if (typeBar !== params.name) {
        typeBar = params.name
        const index = disBar.indexOf(params.name + '-' + tag)
        disBar.splice(index, 1)
        disappearBar = disBar
      } else {
        const index = disappearBar.indexOf(params.name + '-' + tag)
        // console.log(disappearBar)
        if (~index) {
          disappearBar.splice(index, 1)
        } else {
          disappearBar.push(params.name + '-' + tag)
        }
      }
      this.setState({
        typeBar,
        disappearBar,
        selectedBar: _.cloneDeep(allSelectBar)
      })
    }
    this.watchSelectedBar()
  }
  // DSA Table
  onDSATableInit = async () => {
    const { singleWaferKey } = this.state
    const res = await getDSATableData(singleWaferKey)
    const dsaTableData = []
    res.forEach((item, index) => {
      dsaTableData.push({
        key: index + '',
        dieIndex: item.dieIndex,
        step: item.defectInfos[0].step,
        scanTm: item.defectInfos[0].scanTm,
        defectId: item.defectInfos[0].defectId,
        imgUrl: item.defectInfos[0].imgUrl
      })
      if (item.defectInfos.length > 1) {
        const children = []
        item.defectInfos.forEach((jtem, index2) => {
          children.push({
            key: index + '-' + index2,
            step: jtem.step,
            scanTm: jtem.scanTm,
            defectId: jtem.defectId,
            imgUrl: jtem.imgUrl
          })
        })
        dsaTableData[index].children = children
      }
    })
    // console.log('onDSATableInit', dsaTableData)
    this.setState({ dsaTableData })
  }
  /* - - - - - - - - - - - - DSA End - - - - - - - - - - - -  */

  /* - - - - - - - - - - - - Filters - - - - - - - - - - - -  */
  onFilterSubmit = () => {}
  onDefectClassChange = e => {
    const { tagsSeleted } = this.state
    tagsSeleted.mbs = []
    tagsSeleted.adc = []
    tagsSeleted.rbs = []
    this.setState({
      defectClass: e.target.value,
      tagsSeleted
    })
  }
  onDefectClassDetailChange = value => {
    const { defectClass, tagsSeleted } = this.state
    tagsSeleted[defectClass] = value
    this.setState({ tagsSeleted })
  }
  onDefectSizeChange = (index, value) => {
    const { defectSize } = this.state
    defectSize[index] = value
    this.setState({ defectSize })
  }
  onDefectFiltersChange = (key, value) => {
    const { tagsSeleted } = this.state
    tagsSeleted[key] = value
    this.setState({ tagsSeleted })
  }
  /* - - - - - - - - - - - - Filters End - - - - - - - - - - - -  */

  render() {
    const { name } = this.props
    const {
      singleWaferKey,
      mapType,
      angel,
      infoPages,
      zoomTimes,
      imageVisible,
      selectedAction,
      heatMin,
      heatMax,
      rotationDialog
    } = this.state
    const { overlapTypeOptions, overlapDialog } = this.state
    const { reclassifyDialog, correct } = this.state
    const { deleteDefectsDialog, deleteDefectsOptions } = this.state
    const { x, x2n, y, xValue, x2ndValue, yValue, ifAvg } = this.state
    const { indexStyle } = this.state
    const { dsa, sortName, dsaOrder, dsaTableData } = this.state
    const { tags, tagsSeleted, defectClass } = this.state

    if (dsa) this.onGenerateDSAChart()
    else this.onGenerateParetoChart()

    const dsaTableColumns = [
      { title: 'dieIndex', dataIndex: 'dieIndex', key: 'dieIndex' },
      { title: 'step', dataIndex: 'step', key: 'step' },
      { title: 'defectId', dataIndex: 'defectId', key: 'defectId' },
      { title: 'scanTime', dataIndex: 'scanTm', key: 'scanTm' },
      { title: 'image', dataIndex: 'imgUrl', key: 'imgUrl' }
    ]
    const infoColumns = [
      { title: 'Lot ID', dataIndex: 'lotId' },
      { title: 'Wafer No', dataIndex: 'waferNo' },
      { title: 'Product ID', dataIndex: 'productId' },
      { title: 'Step ID', dataIndex: 'stepId' },
      { title: 'Scan Time', dataIndex: 'scanTm' }
    ]

    return (
      <StyleSingleMap>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Single Map:'>
            <Radio.Group onChange={this.onMapTypeChange} defaultValue={mapType}>
              <Radio value='Map/Pareto'>Map/Pareto</Radio>
              {singleWaferKey.length === 1 ? (
                <span>
                  <Radio value='Die Stack'>Die Stack</Radio>
                  <Radio value='Reticle Stack'>Reticle Stack</Radio>
                  {mapType === 'Map/Pareto' || mapType === 'Heat Map' ? <Radio value='Heat Map'>Heat Map</Radio> : null}
                </span>
              ) : null}
            </Radio.Group>
          </Form.Item>
        </Form>
        <div className='mapPareto'>
          {/* Wafer */}
          <StyleWafer>
            <div className='formDropDown'>
              {mapType === 'Map/Pareto' ? (
                <Form layout='vertical' labelCol={{ span: 6 }}>
                  <Form.Item label='Action：'>
                    <Dropdown
                      overlay={
                        <Menu onClick={this.onDropDownClick}>
                          {COMMANDS.map(c => (
                            <Menu.Item key={c}>{c}</Menu.Item>
                          ))}
                        </Menu>
                      }
                    >
                      <Button type='primary'>
                        Dropdown <Icon type='down' />
                      </Button>
                    </Dropdown>
                    <Button onClick={this.onDropDownReset} type='dashed'>
                      Reset
                    </Button>
                  </Form.Item>
                </Form>
              ) : null}
            </div>

            <div className='mapContent'>
              <div id={`content-${name}`} className='single-map-content'>
                <div
                  id={`main-${name}`}
                  className='single-map-main'
                  style={zoomTimes === 1 ? { transform: `rotate(${angel}deg)` } : {}}
                ></div>
                {imageVisible ? (
                  <div id={`img-${name}`} className='single-map-img'>
                    <br />
                    <div ref='detailInfo'></div>
                    {/* image detail */}
                    <div className='imageDetail'>
                      <ul className='imageContent'>
                        {infoPages.map((item, index) => (
                          <li key={index}>
                            <img src={item.image} alt='' />
                            <div>Lot Id:{item.lotId}</div>
                            <div>Wafer No:{item.waferNo}</div>
                            <div>Defect Id:{item.defects}</div>
                          </li>
                        ))}
                      </ul>
                      <Pagination
                        total={100}
                        showTotal={t => `Total: ${t}`}
                        pageSize={10}
                        defaultCurrent={1}
                        onChange={this.onImageDetailPageChange}
                      />
                    </div>

                    <span
                      id={`close-${name}`}
                      className='single-map-close'
                      onClick={() => this.setState({ imageVisible: false })}
                    >
                      X
                    </span>
                  </div>
                ) : null}
              </div>
              {mapType !== 'Heat Map' ? (
                <div className='operBtn'>
                  {TOOL_TIPS.map(item => (
                    <Tooltip key={item.i} placement='right' title={item.content}>
                      <Icon
                        onClick={() => this.onDoAction(item.func)}
                        className={`fa fa-${item.i} ${selectedAction === item.func ? 'checked' : ''}`}
                        type={item.i}
                      />
                    </Tooltip>
                  ))}
                </div>
              ) : null}
              {mapType === 'Heat Map' ? (
                <div className='heatRuler' v-show="mapType === 'Heat Map'">
                  {heatMax}
                  <div className='heatMapRuler'></div>
                  {heatMin}
                </div>
              ) : null}
            </div>

            <Modal
              title='旋转角度'
              visible={rotationDialog}
              onOk={this.onWaferRotate}
              onCancel={() => this.setState({ rotationDialog: false })}
              okText='确认'
              cancelText='取消'
            >
              <Form layout='vertical' labelCol={{ span: 2 }}>
                <Form.Item label='预设角度'>
                  <Button type='primary' onClick={() => this.setState({ rotationDegree: 90 })}>
                    90°
                  </Button>
                  <Button type='primary' onClick={() => this.setState({ rotationDegree: 180 })}>
                    180°
                  </Button>
                  <Button type='primary' onClick={() => this.setState({ rotationDegree: 270 })}>
                    270°
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Input onChange={e => this.setState({ rotationDegree: e.target.value })} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title='Overlap'
              visible={overlapDialog}
              // onOk={this.onWaferRotate}
              onCancel={() => this.setState({ overlapDialog: false })}
              okText='确认'
              cancelText='取消'
            >
              <Radio.Group onChange={e => this.setState({ overlapType: e.target.value })}>
                {overlapTypeOptions.map(item => (
                  <Radio key={item} value={item}>
                    {item}
                  </Radio>
                ))}
              </Radio.Group>
            </Modal>

            <Modal
              title='重新分类'
              visible={reclassifyDialog}
              onOk={this.onReclassifyOk}
              onCancel={() => this.setState({ reclassifyDialog: false })}
              footer={
                <div>
                  <Button type='dashed' onClick={() => this.setState({ reclassifyDialog: false })}>
                    Cancel
                  </Button>
                  <Button type='primary' onClick={this.onReclassify}>
                    重新分类
                  </Button>
                  <Button type='primary' onClick={this.onReclassifyDownload}>
                    重新分类并下载Klarf
                  </Button>
                </div>
              }
            >
              <Form layout='inline'>
                {correct.map(c => (
                  <Form.Item layout='inline' label={c} key={c}>
                    <Input onChange={e => this.onReclassifyFormChange(c, e.target.value)} />
                  </Form.Item>
                ))}
              </Form>
            </Modal>

            <Modal
              title='删除选中点'
              visible={deleteDefectsDialog}
              onOk={this.onDefectsDelete}
              onCancel={() => this.setState({ deleteDefectsDialog: false })}
              okText='确认'
              cancelText='取消'
            >
              <Radio.Group onChange={e => this.setState({ deleteDefectsType: e.target.value })}>
                {deleteDefectsOptions.map(item => (
                  <Radio key={item} value={item}>
                    {item}
                  </Radio>
                ))}
              </Radio.Group>
            </Modal>
          </StyleWafer>

          {/* Pareto */}
          <StylePareto style={{ display: `${dsa ? 'none' : 'block'}` }} >
            {!dsa ? (
              <Form layout='inline' style={{ height: 50 }}>
                <Form.Item label='X轴' style={{ width: 150 }}>
                  <Select onChange={this.onChangeX} value={xValue} style={{ width: 110 }}>
                    {Object.keys(x).map(key => (
                      <Select.Option key={key} value={key}>
                        {x[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='2nd X' style={{ width: 170 }}>
                  <Select onChange={this.onChangeX2nd} value={x2ndValue} style={{ width: 110 }}>
                    {Object.keys(x2n).map(key => (
                      <Select.Option key={key} value={key}>
                        {x2n[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='Y轴' style={{ width: 150 }}>
                  <Select onChange={this.onChangeY} value={yValue} style={{ width: 110 }}>
                    {Object.keys(y).map(key => (
                      <Select.Option key={key} value={key}>
                        {y[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button onClick={this.onParetoSearch} type='primary' style={{ marginRight: 10, minWidth: 50 }}>
                    Search
                  </Button>
                  <Button onClick={this.onParetoClear} type='dashed' style={{ minWidth: 50 }}>
                    Clear
                  </Button>
                </Form.Item>
                {singleWaferKey.length > 1 ? (
                  <Form.Item>
                    <Select onChange={this.onAvgChange} value={ifAvg} style={{ width: 110 }}>
                      <Select.Option value='sum'>SUM</Select.Option>
                      <Select.Option value='avg'>AVG</Select.Option>
                    </Select>
                  </Form.Item>
                ) : null}
              </Form>
            ) : null}
            <StyleChart id='pareto-chart' style={{ display: `${dsa ? 'none' : 'block'}` }} />
          </StylePareto>

          {/* DSA */}
          <StyleDSA style={{ display: `${dsa ? 'block' : 'none'}` }}>
            {dsa ? (
              <Form layout='inline' style={{ height: 50 }}>
                <Form.Item label='排序' style={{ width: 200 }}>
                  <Select onChange={v => this.onDSASortChange(0, v)} value={sortName} style={{ width: 110 }}>
                    {SORT_LIST.map(item => (
                      <Select.Option key={item.label} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='排序' style={{ width: 200 }}>
                  <Select onChange={v => this.onDSASortChange(1, v)} value={dsaOrder} style={{ width: 110 }}>
                    {SORT_ORDER_LIST.map(item => (
                      <Select.Option key={item.label} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            ) : null}
            <StyleChart id='dsa-chart' style={{ display: `${dsa ? 'block' : 'none'}` }} />
          </StyleDSA>
        </div>

        <Table pagination={false} className='single-map-table' size='small' bordered rowKey={r => `${r.lotId}${r.waferNo}${r.productId}${r.stepId}${r.scanTm}`} columns={infoColumns} dataSource={singleWaferKey} />

        <Button type='primary' style={{ marginTop: 20 }} onClick={this.onDsaToggle}>
          {dsa ? 'Single Map' : 'DSA'}
        </Button>

        {dsa ? (
          <Table pagination={false} className='single-map-table' size='small' bordered columns={dsaTableColumns} dataSource={dsaTableData} />
        ) : null}

        <CommonDrawer ref={r => (drawer = r)} width={500}>
          <section>
            <h3>Filter</h3>
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Defect class:'>
                <Radio.Group onChange={this.onDefectClassChange}>
                  {DEFECT_CLASS_LIST.map(t => (
                    <Radio key={t[1]} value={t[1]}>
                      {t[0]}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              {defectClass ? (
                <Form.Item label=' '>
                  <Checkbox.Group options={tags[defectClass]} onChange={this.onDefectClassDetailChange} />
                </Form.Item>
              ) : null}
              <Form.Item label='Defect size:'>
                <Input style={{ width: 60 }} onChange={e => this.onDefectSizeChange(0, e.target.value)} size='small' />
                -
                <Input style={{ width: 60 }} onChange={e => this.onDefectSizeChange(1, e.target.value)} size='small' />
              </Form.Item>
              <Form.Item label='Test:'>
                <Checkbox.Group options={tags.tests} onChange={v => this.onDefectFiltersChange('tests', v)} />
              </Form.Item>
              <Form.Item label='Cluster:'>
                <Checkbox.Group options={tags.clusterIds} onChange={v => this.onDefectFiltersChange('clusterIds', v)} />
              </Form.Item>
              <Form.Item label='Adder:'>
                <Checkbox onChange={e => this.setState({ adderFlag: e.target.checked ? ['Y'] : ['N'] })} />
              </Form.Item>
              <Form.Item label='Repeater:'>
                <Checkbox.Group
                  options={tags.repeaterIds}
                  onChange={v => this.onDefectFiltersChange('repeaterIds', v)}
                />
              </Form.Item>
              <Form.Item label='Zone:'>
                <Checkbox.Group options={tags.zoneIds} onChange={v => this.onDefectFiltersChange('zoneIds', v)} />
              </Form.Item>
              <Form.Item label='Sub Die:'>
                <Checkbox.Group options={tags.subDieIds} onChange={v => this.onDefectFiltersChange('subDieIds', v)} />
              </Form.Item>
              <Form.Item label=' ' style={{ textAlign: 'right' }}>
                <Button type='primary' onClick={this.onFilterSubmit}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </section>
        </CommonDrawer>
      </StyleSingleMap>
    )
  }
}

// injectReducer('SingleMap', reducer)
const mapStateToProps = state => ({
  ...state.Init
})
const mapDispatchToProps = {
  changeWaferSelected
}
export default connect(mapStateToProps, mapDispatchToProps)(SingleMap)
