import React from 'react'
import { connect } from 'react-redux'
import { Form, Dropdown, Menu, Tooltip, Modal, Select, Pagination, Switch, Radio, Checkbox, Button, Input, Icon, InputNumber, message } from 'antd'
import _ from 'lodash'
import zrender from 'zrender'
import Heatmap from 'heatmap.js'
// import moment from 'moment'
import { injectReducer } from '@/utils/store'
import echarts from 'echarts'
// eslint-disable-next-line
import { delay, printTime, getColor, gradientColors, defectIdsToWafers } from '@/utils/web'
import { changeWafers } from '@/utils/action'
import { post, download } from '@/utils/api'
import CommonDrawer from '@/components/CommonDrawer'
import { changeSingleSelected, changeSingleWafers } from './action'
import { SORT_LIST, SORT_ORDER_LIST, COMMANDS, TOOL_TIPS, MAP_TYPES, DEFECT_CLASS_LIST, DELETE_DEFECTS_OPTIONS, OVER_LAP_TYPE_OPTIONS, DSA_TABLE_COLUMNS, INFO_COLUMNS } from './constant'
import reducer from './reducer'
import { reclassifyParams, getImages, updateCorrect, deleteCorrect, getX, getX2nd, getY, getDp, getDSATableData } from './service'
import { StyleSingleMap, StyleWafer, StylePareto, StyleChart, StyleDSA, StyleImages, StyleTable } from './style'

// eslint-disable-next-line
let drawer = null
let zr = null
let group = null
let rectRecords = []
let pointRecords = []
let timeout = null
let chosedArea = []
let chosedPoints = {}
let pointIdsMapping = []
let zoomRecords = {}
let mouseDownStartInner = false
let paretoChart = null
let dsaChart = null
let zoomTimes = 1
let firstPointId = 0

class SingleMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 前端联动的数据
      dataSource: [],
      coordinate: [],
      obList: [],
      paretoData: {},
      /* index */
      mapType: 'Map/Pareto',
      dsa: false,
      dsaInfo: {},
      selectedDefects: [],
      showOtherMap: false,
      selectAction: '',
      stxaxis: {
        '1stXCode': 'mb',
        '2ndXCode': '',
        yCode: '100'
      },
      selectedBar: [],
      colorsObj: {},
      /* Wafer */
      angel: 0,
      customizeAngel: false,
      selectedAction: '',
      // 方格实例记录
      rotationDialog: false,
      rotationDegree: '',
      overlapType: '',
      overlapDialog: false,
      heatMin: 0,
      heatMax: 0,
      // 点的坐标和它的id集合映射
      reclassifyDialog: false,
      correct: [],
      reclassifyForm: {},
      heatmapInstance: null,
      deleteDefectsDialog: false,
      deleteDefectsType: '',
      /* Pareto */
      xValue: 'mb',
      x2ndValue: '',
      yValue: '100',
      x: {},
      x2n: {},
      y: {},
      ifAvg: 'sum',
      allBar: [],
      /* Image Detail */
      defectImages: [],
      currentImages: [],
      imagesTotal: 0,
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
      // 右侧各种过滤条件
      filterOption: {
        mb: [],
        abc: [],
        rb: [],
        testId: [],
        cluster: [],
        repeater: [],
        zoneId: [],
        subDie: []
      },
      // 用户当前勾选的过滤条件
      filter: {
        mb: [],
        adc: [],
        rb: [],
        adder: ['NO'],
        testId: [],
        cluster: [],
        repeater: [],
        zoneId: [],
        subDie: []
      },
      defectClass: null,
      defectSize: ['0', '9999'],
      total: 0,
      pageNo: 1
    }
  }

  // 从store取出当前页的selected
  getSelected = () => {
    const { singleSelected, name } = this.props
    return singleSelected[name] || []
  }
  // 从store取出当前页的wafers
  getWafers = () => {
    const { singleWafers, name } = this.props
    return singleWafers[name] || []
  }
  // rednerPoint & renderPareto
  renderMapAndPareto = async () => {
    await delay(1)
    const { dataSource, coordinate, selectedBar, selectedAction } = this.state
    const existBar = selectedBar.length > 0
    const existArea = coordinate.length > 0
    // - - - - - - renderMap - - - - - - 
    if (dataSource.length === 0) return
    await delay(1)
    this.clearPoints()
    const fill = '#' + getColor('')
    for (const wafer of dataSource) {
      for (const mb in wafer.defectInfos) {
        for (const ob in wafer.defectInfos[mb]) {
          if (existBar && selectedBar.includes(`${mb}-${ob}`)) continue
          for (const coo in wafer.defectInfos[mb][ob]) {
            let [x, y] = coo.split(',')
            // 同一个坐标下 只绘制一次点
            // 选中的区域点绘制成 星星
            let Point = null
            if (existArea && coordinate.includes(coo)) {
              // 选中区域内
              // podcast & star 绘制成星星
              if (selectedAction === 'podcast' || selectedAction === 'star') {
                Point = new zrender.Star({ shape: { cx: +x, cy: +y, n: 4, r: 5 }, style: { fill } })
              } else if (selectedAction !== 'star0') {
                // 除了star0，其他都正常绘制
                Point = new zrender.Circle({ shape: { cx: +x, cy: +y, r: 2 }, style: { fill } })
              }
            } else {
              // 选中区域外
              // 除了star，其他都正常绘制
              if (selectedAction !== 'star') {
                Point = new zrender.Circle({ shape: { cx: +x, cy: +y, r: 2 }, style: { fill } })
              }
            }
            if (Point) {
              group.add(Point)
              pointRecords.push(Point)
            }
          }
        }
      }
    }
    // - - - - - - renderPareto - - - - - - 
    const paretoAll = []
    const paretoStar = []
    const paretoStar0 = []
    let obList = []
    for (const wafer of dataSource) {
      for (const mb in wafer.defectInfos) {
        for (const ob in wafer.defectInfos[mb]) {
          obList.push(ob)
          const key = `${mb}-${ob}`
          paretoAll[key] = 0
          paretoStar[key] = 0
          paretoStar0[key] = 0
          for (const coo in wafer.defectInfos[mb][ob]) {
            if (['star', 'star0'].includes(selectedAction)) {
              if (existArea && coordinate.includes(coo)) {
                paretoStar[key] += wafer.defectInfos[mb][ob][coo].length
              } else {
                paretoStar0[key] += wafer.defectInfos[mb][ob][coo].length
              }
            } else {
              paretoAll[key] += wafer.defectInfos[mb][ob][coo].length
            }
          }
        }
      }
    }
    if (selectedAction === 'star') {
      for (const key in paretoStar) {
        if (paretoStar[key] === 0) delete paretoStar[key]
      }
      this.setState({ paretoData: paretoStar })
    } else if (selectedAction === 'star0') {
      for (const key in paretoStar0) {
        if (paretoStar0[key] === 0) delete paretoStar0[key]
      }
      this.setState({ paretoData: paretoStar0 })
    } else {
      for (const key in paretoAll) {
        if (paretoAll[key] === 0) delete paretoAll[key]
      }
      this.setState({ paretoData: paretoAll })
    }
    obList = _.uniq(obList)
    this.setState({ obList })
    this.renderPareto()
  }
  async componentDidMount() {
    // 从store里取出 dataQuery查询的filterOption
    const { filterOption } = this.props
    this.setState({ filterOption })
    // 将wafers保存到store，跳转下一个页面使用
    let { wafers, name } = this.props
    if (wafers.length === 0) {
      wafers = [
        {
          lotId: "B0001.000",
          stepId: "M4_CMP",
          waferNo: "1",
          productId: "Device01",
          scanTm: "2018-06-07 12:30:35",
          defects: [],
          defectCache: "5255f356-0558-414c-ba28-6a4a88774f0e"
        },
        {
          lotId: "B0001.000",
          stepId: "M1_CMP",
          waferNo: "1",
          productId: "Device01",
          scanTm: "2018-05-31 12:30:35",
          defects: [],
          defectCache: "f87bae15-d431-474b-8f4e-e6f6b9babab6"
        }
      ]
    }
    this.props.changeSingleWafers({ name, wafers })
    this.onParetoChartInit()
    this.onDSAChartInit()
    this.onWaferCreated()
    this.onParetoCreated()
    this.setState({
      showOtherMap: this.showOtherMapInit(wafers)
    })
  }
  // productId唯一时,显示Die Stack/Reticle Stack/Heap Map
  showOtherMapInit = wafers => {
    if (wafers.length > 1) {
      const firstWaferProductId = wafers[0].productId
      wafers.forEach(wafer => {
        if (wafer.productId !== firstWaferProductId) return false
      })
    }
    return true
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
    const { dataSource } = this.state
    return dataSource[0] || {}
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
      this.setState({ imageVisible: true })
      await delay(1)
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
        const { dataSource } = this.state
        pointIdsMapping.forEach((item, index) => {
          const pointCoordinate = item[`${x},${y}`]
          if (pointCoordinate) {
            const { lotId, waferNo, productId, stepId, scanTm } = dataSource[index]
            const defectsInfomation = { lotId, waferNo, productId, stepId, scanTm, defects: pointCoordinate }
            emitObj.push(defectsInfomation)
          }
        })
        console.log('defectsInfomation', emitObj)
        const res = await getImages({
          imageInfo: emitObj,
          singleGalleryFlag: 'singleMap'
        })
        if (_.isEmpty(res)) {
          message.warning('no photo')
          return
        }
        imgDom.style.top = e.offsetY + 'px'
        imgDom.style.left = e.offsetX + 5 + 'px'
        imgDom.style.display = 'block'
        let arr = []
        for (const defectInfo in res) {
          const [lotId, , , waferNo, , defects] = defectInfo.split('|')
          res[defectInfo].forEach(item => {
            arr.push({ lotId, waferNo, defects, image: 'http://161.189.50.41:80' + item })
          })
        }
        this.setState({ defectImages: arr, imagesTotal: arr.length })
        await delay(1)
        this.onImageDetailPageChange(1)
      }
    })
    this.onWaferInit()
    this.onCheckAreaInit()
    zr.on('mousewheel', e => {
      e = e || window.event
      const { mapType } = this.state
      if (mapType !== 'Heat Map' && e.wheelDelta) {
        const dataOption = this.getDataOption()
        const { waferLocation } = dataOption
        let times = 1
        //第一步：先判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) {
          //当滑轮向上滚动时
          times = zoomTimes * 2
        }
        if (e.wheelDelta < 0) {
          //当滑轮向下滚动时
          if (zoomTimes === 1) return
          times = zoomTimes / 2
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
  //选择区域 事件绑定
  onCheckAreaInit = () => {
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
      download({ singleWaferKey: this.getWafers() })
    } else if (key === 'Send to review') {
      console.log('review')
    } else if (key === 'Overlap') {
      this.setState({ overlapDialog: true })
    }
  }
  onDropDownReset = async () => {
    this.setState({
      angel: 0,
      selectAction: '',
      selectedAction: '',
      selectedBar: [],
      disappearBar: []
    })
    chosedPoints = {}
    this.onWaferInit()
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
    const pageStart = (pageNo - 1) * 5
    const { defectImages } = this.state
    const currentImages = defectImages.slice(pageStart, pageStart + 5)
    this.setState({ currentImages })
  }
  onDoAction = async func => {
    this.setState({ selectedAction: func })
    const { coordinate } = this.state
    const noSelectedPoints = coordinate.length === 0
    if (func === 'chooseArea') {
      this.setState({ angel: 0 })
    } else if (func === 'reply') {
      this.setState({ angel: 0 })
      chosedArea.forEach(item => {
        group.remove(item)
      })
      chosedArea = []
    } else if (func === 'podcast') {
      // if (noSelectedPoints) {
      //   message.info('没有被标记的点！')
      //   return
      // }
      this.setState({ angel: 0 })
      this.onDoActionPodcast()
    } else if (func === 'star' || func === 'star0') {
      if (noSelectedPoints) {
        message.info('没有被标记的点！')
        return
      }
      this.setState({ angel: 0 })
      this.onDoActionPodcast()
    } else if (func === 'reclassify') {
      if (noSelectedPoints) {
        message.info('没有被标记的点！')
        return
      }
      this.setState({
        reclassifyDialog: true,
        angel: 0
      })
      const singleWaferKey = this.getSelected()
      const correct = await reclassifyParams({ singleWaferKey })
      this.setState({ correct })
    } else if (func === 'trash') {
      if (noSelectedPoints) {
        message.info('没有被标记的点！')
        return
      }
      this.setState({
        angel: 0,
        deleteDefectsDialog: true
      })
    } else if (func === 'refresh') {
      this.setState({
        angel: 0,
        selectAction: ''
      })
      chosedPoints = {}
      this.onWaferInit()
    }
  }
  // 标记
  onDoActionPodcast = () => {
    // 把区域内的坐标都找出来，存放到coordinate，后续绘制使用
    const { dataSource, coordinate } = this.state
    for (const wafer of dataSource) {
      for (const mb in wafer.defectInfos) {
        for (const ob in wafer.defectInfos[mb]) {
          for (const coo in wafer.defectInfos[mb][ob]) {
            let [x, y] = coo.split(',')
            if (chosedArea.some(area => area.contain(+x, +y))) {
              coordinate.push(coo)
            }
          }
        }
      }
    }
    chosedArea.forEach(item => {
      group.remove(item)
    })
    chosedArea = []
    this.setState({ coordinate })
    this.renderMapAndPareto()
  }
  onDoActionStar = () => { }
  /* - - - - - - - - - - - - Wafer - - - - - - - - - - - -  */
  // Wafer 初始化
  onWaferInit = async options => {
    group.removeAll()
    const res = await this.getMapData(options)
    this.setState({ dataSource: res })
    // this.onPretreatment()
    // 同时更新缩放倍数
    if (res.length > 0) zoomTimes = res[0].magnification
    const { mapType } = this.state
    if (mapType === 'Map/Pareto' || mapType === 'Heat Map') this.renderOutterCircle()
    this.renderRects()
    this.recordZoom()
    if (mapType === 'Map/Pareto' && zoomTimes === 1) this.drawIsogon()
    this.renderMapAndPareto()
    const { dsa } = this.state
    if (dsa) this.onDSAInit()
  }
  getMapData = async ({ times = 1, x = 200, y = 200 } = {}) => {
    await delay(1)
    let src = ''
    const { dsaInfo, mapType } = this.state
    if (_.isEmpty(dsaInfo)) {
      src = `swm${MAP_TYPES[mapType]}`
    } else {
      src = `dm${MAP_TYPES[mapType]}`
    }
    const { filter, defectSize, stxaxis } = this.state
    // insert defect size
    if (defectSize[0] === '') defectSize[0] = 0
    if (defectSize[1] === '') defectSize[1] = 9999
    const num1 = parseFloat(defectSize[0])
    const num2 = parseFloat(defectSize[1])
    filter.defectSize = [`${Math.min(num1, num2)},${Math.max(num1, num2)}`]
    const singleWaferKey = this.getWafers()
    let existDefects = false
    singleWaferKey.forEach(wafer => {
      if (wafer.defects.length > 0) {
        existDefects = true
      }
    })
    return await post(src, {
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: `${times}`, centralLocation: x + ',' + y },
      filter,
      pareto: stxaxis,
      selectAction: existDefects ? 'hold' : '',
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
    if (mapType === 'Map/Pareto' && overlapType === 'Bin Map')
      bgColor = gradientColors('#ff0', '#f00', binMax - binMin + 1)
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
    pointIdsMapping = []
    const { dataSource } = this.state
    dataSource.forEach(({ defectInfos }, idx) => {
      this.renderSingleMap(defectInfos, idx)
    })
    this.waferDefectsGroup()
  }
  // 清除圆点
  clearPoints = () => {
    pointRecords.forEach(item => {
      group.remove(item)
    })
    pointRecords = []
  }
  // 渲染单张图的点
  renderSingleMap = async (defectInfos, index) => {
    // printTime(`第${index + 1}片wafer开始渲染`)
    // await delay(1)
    const { selectedBar, colorsObj } = this.state
    let pointColor
    const colorFlag = _.isEmpty(colorsObj)
    // 通过 seriesName 生成不同的颜色，目前seriesName都是空字符串，暂时不在循环里做重复无用计算
    pointColor = '#' + getColor('')
    pointIdsMapping[index] = {}
    for (const name in defectInfos) {
      for (const seriesName in defectInfos[name]) {
        if (!colorFlag) {
          pointColor = colorsObj[name + '-' + seriesName]
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
    zr.add(group)
  }
  // 渲染出的点的id集合
  waferDefectsGroup = () => {
    const wafers = []
    const { dataSource } = this.state
    for (const i in pointIdsMapping) {
      const singleWaferDefects = []
      const { lotId, waferNo, productId, stepId, scanTm } = dataSource[i]
      for (const j in pointIdsMapping[i]) {
        singleWaferDefects.push(...pointIdsMapping[i][j])
      }
      wafers.push({ lotId, waferNo, productId, stepId, scanTm, defects: singleWaferDefects || [] })
    }
    this.props.changeWafers(wafers)
  }
  // 处理单个点
  dealPoint = (coordinate, idList, pointColor, index) => {
    // printTime(`第${index + 1}片wafer正在渲染`)
    let [pointX, pointY] = coordinate.split(',')
    pointX = +pointX
    pointY = +pointY
    // 点在选中区域时需要塞进chosedPoints
    if (chosedArea.some(area => area.contain(pointX, pointY))) {
      this.setChosedPoints(index, coordinate)
    }
    // 单个点的渲染及记录
    const { selectedAction } = this.state
    const chosedPoint = chosedPoints[index] || []
    let isStar = idList.some(id => chosedPoint.includes(id))
    if (selectedAction === 'star') isStar = 1
    if (selectedAction === 'star0') isStar = 0
    const Point = this.renderPoint({ x: pointX, y: pointY, color: pointColor }, isStar)
    // Point.attr({ coordinate, index })
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
    const { dataSource } = this.state
    dataSource.forEach((item, index) => {
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
  onOverlapOk = () => {
    this.setState({ overlapDialog: false })
    this.renderRects()
    this.renderPoints()
    if (zoomTimes === 1) this.drawIsogon()
  }

  onReclassifyFormChange = (key, value) => {
    const { reclassifyForm } = this.state
    reclassifyForm[key] = value
    this.setState({ reclassifyForm })
  }

  // 选中下载点及基本信息
  downloadPoints() {
    const singleMapArr = []
    const { dataSource } = this.state
    for (const i in chosedPoints) {
      const { lotId, waferNo, productId, stepId, scanTm } = dataSource[i]
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
    const singleWaferKey = this.getSelected()
    await updateCorrect({
      singleWaferKey,
      correct: reclassifyForm
    })
    chosedPoints = {}
    this.onWaferInit()
  }
  // 分类 & 下载
  onReclassifyDownload = async () => {
    await this.onReclassify()
    const singleWaferKey = this.getSelected()
    download('export', { singleWaferKey })
  }

  // 删除选中点
  onDefectsDelete = async () => {
    this.setState({ deleteDefectsDialog: false })
    const singleWaferKey = this.getSelected()
    const { deleteDefectsType } = this.state
    if (deleteDefectsType === '清除选中点' || deleteDefectsType === '清除选中点并导出') {
      // this.setState({
      //   selectedDefects: this.deliveryPoints(),
      //   selectAction: 'clean'
      // })
      this.watchSelectAction()
    }
    if (deleteDefectsType === '清除选中点并导出') download('export', { singleWaferKey })
    if (deleteDefectsType === '删除选中点' || deleteDefectsType === '删除选中点并导出') {
      await deleteCorrect({ singleWaferKey })
      chosedPoints = {}
      this.onWaferInit()
    }
    await delay(1)
    if (deleteDefectsType === '删除选中点并导出') download('export', { singleWaferKey })
    this.setState({ deleteDefectsType: '' })
  }

  /* - - - - - - - - - - - - Pareto - - - - - - - - - - - -  */
  // Pareto 创建
  onParetoCreated = async () => {
    const { xValue, x2ndValue } = this.state
    const x = await getX()
    const x2n = await getX2nd(xValue)
    const y = await getY(xValue, x2ndValue)
    this.setState({ x, x2n, y })
  }
  renderPareto = async () => {
    await delay(1)
    paretoChart.clear()
    const wafers = this.getWafers()
    const len = wafers.length
    const { paretoData, x, y, xValue, stxaxis, ifAvg, obList, selectedBar } = this.state
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
    // 处理数据
    const arr = []
    const holdArr = []
    const colorArr = []
    const seriesArr = []
    for (const mbob in paretoData) {
      const [mb,] = mbob.split('-')
      if (ifAvg === 'avg') {
        arr.push([mb, Math.round(paretoData[mbob] / len)])
      } else {
        arr.push([mb, paretoData[mbob]])
      }
    }
    arr.unshift(['product', ''])
    obList.forEach((item, i) => {
      holdArr.push({
        value: null,
        xAxis: i,
        yAxis: null
      })
      colorArr.push('#' + getColor(item))
    })
    colorArr.forEach(item => {
      seriesArr.push({
        type: 'bar',
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
    // 填充值
    opt.dataset.source = arr
    opt.series = seriesArr
    paretoChart.setOption(opt)
  }
  // Pareto 图表
  onGenerateParetoChart = async () => {
    await delay(1)
    // eslint-disable-next-line
    const { paretoData, x, y, xValue, stxaxis, ifAvg } = this.state
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
      const singleWaferKey = this.getWafers()
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
    this.setState({
      // 点击搜索 恢复初始
      selectedAction: '',
      stxaxis: paretoObj,
      selectedBar: []
    })
    this.onWaferInit()
  }
  onParetoClear = () => {
    const { paretoData } = this.state
    if (paretoData.length === 0) {
      message.warning('no data')
      return
    }
    this.setState({
      selectedBar: Object.keys(paretoData)
    })
    this.onWaferInit()
  }
  onAvgChange = ifAvg => {
    this.setState({ ifAvg })
    this.renderPareto()
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
    this.renderMapAndPareto()
  }
  /* - - - - - - - - - - - - Pareto End - - - - - - - - - - - -  */

  /* - - - - - - - - - - - - DSA - - - - - - - - - - - -  */
  // DSA Pareto 切换
  onDsaToggle = () => {
    const { dsa } = this.state
    const singleWaferKey = this.getWafers()
    if (singleWaferKey.length < 2) {
      message.error('至少选择2片wafer，才能比较')
      return
    }
    this.setState({ dsa: !dsa, colorsObj: {}, selectedBar: [], dsaInfo: dsa ? {} : { dsaOrder: '1', sortName: '1' } })
    if (dsa) this.watchDSAInfo()
    else this.onWaferInit()
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
    const { dsaOrder, sortName } = this.state
    const singleWaferKey = this.getWafers()
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
        formatter: params => {
          let tag = ''
          dsaData.paretoValue.series.some(item => {
            if (item.name === params.name) {
              tag = item['tag'][params.seriesIndex]
            }
            return item.name === params.name
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
                if (item.name === param.name) {
                  tag = item['tag'][param.seriesIndex]
                }
                return item.name === param.name
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
      if (item.name === params.name) {
        tag = item['tag'][params.seriesIndex]
      }
      return item.name === params.name
    })
    if (params.value[params.seriesIndex + 1] > 0) {
      const idx = selectedBar.indexOf(params.name + '-' + tag)
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
    this.onWaferInit()
  }
  // DSA Table
  onDSATableInit = async () => {
    const singleWaferKey = this.getWafers()
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
    this.setState({ dsaTableData })
  }
  /* - - - - - - - - - - - - DSA End - - - - - - - - - - - -  */

  /* - - - - - - - - - - - - Filters - - - - - - - - - - - -  */
  onFilterSubmit = () => {
    drawer.onClose()
    this.onWaferInit()
  }
  onDefectClassChange = e => {
    const { filter } = this.state
    filter.mb = []
    filter.adc = []
    filter.rb = []
    this.setState({
      defectClass: e.target.value,
      filter
    })
  }
  onDefectClassDetailChange = value => {
    const { defectClass, filter } = this.state
    filter[defectClass] = value
    this.setState({ filter })
  }
  onDefectSizeChange = (index, value) => {
    const { defectSize } = this.state
    defectSize[index] = value
    this.setState({ defectSize })
  }
  onDefectFiltersChange = (key, value) => {
    const { filter } = this.state
    filter[key] = value
    this.setState({ filter })
  }
  /* - - - - - - - - - - - - Filters End - - - - - - - - - - - -  */

  paretoChartClear = () => {
    paretoChart.clear()
  }

  render() {
    const { name } = this.props
    const singleWaferKey = this.getWafers()
    const {
      showOtherMap,
      mapType,
      angel,
      currentImages,
      imagesTotal,
      imageVisible,
      selectedAction,
      heatMin,
      heatMax,
      rotationDialog
    } = this.state
    const { overlapDialog } = this.state
    const { reclassifyDialog, correct } = this.state
    const { deleteDefectsDialog } = this.state
    const { x, x2n, y, xValue, x2ndValue, yValue, ifAvg } = this.state
    const { dsa, sortName, dsaOrder, dsaTableData } = this.state
    const { filterOption, filter, defectClass } = this.state

    return (
      <StyleSingleMap>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Single Map:'>
            <Radio.Group onChange={this.onMapTypeChange} defaultValue={mapType}>
              <Radio value='Map/Pareto'>Map/Pareto</Radio>
              {showOtherMap ? (
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
                      size='small'
                      overlay={
                        <Menu onClick={this.onDropDownClick}>
                          {COMMANDS.map(c => (
                            <Menu.Item key={c}>{c}</Menu.Item>
                          ))}
                        </Menu>
                      }
                    >
                      <Button size='small' type='primary'>
                        Dropdown <Icon type='down' />
                      </Button>
                    </Dropdown>
                    <Button size='small' onClick={this.onDropDownReset} type='dashed'>
                      Reset
                    </Button>
                    <Button size='small' onClick={this.paretoChartClear} type='dashed'>
                      Test
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
                  <StyleImages id={`img-${name}`}>
                    <div className='imageDetail'>
                      <ul className='imageContent'>
                        {currentImages.map((item, index) => (
                          <li key={index}>
                            <img src={item.image} alt='' />
                            <div>Lot Id:{item.lotId}</div>
                            <div>Wafer No:{item.waferNo}</div>
                            <div>Defect Id:{item.defects}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Pagination
                      simple
                      size='small'
                      total={imagesTotal}
                      pageSize={5}
                      onChange={this.onImageDetailPageChange}
                    />
                    <Icon type='close' onClick={() => this.setState({ imageVisible: false })} />
                  </StyleImages>
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
              <Form layout='vertical' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Form.Item label='预设角度'>
                  <Button type='primary' size='small' onClick={() => this.setState({ rotationDegree: 90 })}>
                    90°
                  </Button>
                  <Button type='primary' size='small' onClick={() => this.setState({ rotationDegree: 180 })}>
                    180°
                  </Button>
                  <Button type='primary' size='small' onClick={() => this.setState({ rotationDegree: 270 })}>
                    270°
                  </Button>
                </Form.Item>
                <Form.Item label='自定义角度'>
                  <InputNumber
                    min={0}
                    max={360}
                    size='small'
                    style={{ width: 100, textAlign: 'center' }}
                    onChange={rotationDegree => this.setState({ rotationDegree })}
                  />{' '}
                  °
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title='Overlap'
              visible={overlapDialog}
              onOk={this.onOverlapOk}
              onCancel={() => this.setState({ overlapDialog: false })}
              okText='确认'
              cancelText='取消'
            >
              <Radio.Group onChange={e => this.setState({ overlapType: e.target.value })}>
                {OVER_LAP_TYPE_OPTIONS.map(item => (
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
                {DELETE_DEFECTS_OPTIONS.map(item => (
                  <Radio key={item} value={item}>
                    {item}
                  </Radio>
                ))}
              </Radio.Group>
            </Modal>
          </StyleWafer>

          {/* Pareto */}
          <StylePareto style={{ display: `${dsa ? 'none' : 'block'}` }}>
            {!dsa ? (
              <Form layout='inline' style={{ height: 57, marginTop: -7 }}>
                <Form.Item label='X轴' style={{ width: 150 }}>
                  <Select size='small' onChange={this.onChangeX} value={xValue} style={{ width: 110 }}>
                    {Object.keys(x).map(key => (
                      <Select.Option key={key} value={key}>
                        {x[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='2nd X' style={{ width: 170 }}>
                  <Select size='small' onChange={this.onChangeX2nd} value={x2ndValue} style={{ width: 110 }}>
                    {Object.keys(x2n).map(key => (
                      <Select.Option key={key} value={key}>
                        {x2n[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item size='small' label='Y轴' style={{ width: 190 }}>
                  <Select size='small' onChange={this.onChangeY} value={yValue} style={{ width: 150 }}>
                    {Object.keys(y).map(key => (
                      <Select.Option key={key} value={key}>
                        {y[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button size='small' onClick={this.onParetoSearch} type='primary' style={{ marginRight: 10, minWidth: 50 }}>
                    Search
                  </Button>
                  <Button size='small' onClick={this.onParetoClear} type='dashed' style={{ minWidth: 50 }}>
                    Clear
                  </Button>
                </Form.Item>
                {singleWaferKey.length > 1 ? (
                  <Form.Item>
                    <Select size='small' onChange={this.onAvgChange} value={ifAvg} style={{ width: 70 }}>
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
                  <Select size='small' onChange={v => this.onDSASortChange(0, v)} value={sortName} style={{ width: 110 }}>
                    {SORT_LIST.map(item => (
                      <Select.Option key={item.label} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='排序' style={{ width: 200 }}>
                  <Select size='small' onChange={v => this.onDSASortChange(1, v)} value={dsaOrder} style={{ width: 110 }}>
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

        <StyleTable
          pagination={false}
          className='single-map-table'
          size='small'
          bordered
          rowKey={r => `${r.lotId}${r.waferNo}${r.productId}${r.stepId}${r.scanTm}`}
          columns={INFO_COLUMNS}
          dataSource={singleWaferKey}
        />

        <Button type='primary' style={{ marginTop: 20 }} onClick={this.onDsaToggle}>
          {dsa ? 'Single Map' : 'DSA'}
        </Button>

        {dsa ? (
          <StyleTable
            pagination={false}
            className='single-map-table'
            size='small'
            bordered
            columns={DSA_TABLE_COLUMNS}
            dataSource={dsaTableData}
          />
        ) : null}

        <CommonDrawer ref={r => (drawer = r)} width={500}>
          <section>
            <h3>Filter</h3>
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Defect class:'>
                <Radio.Group options={DEFECT_CLASS_LIST} onChange={this.onDefectClassChange} />
              </Form.Item>
              {defectClass ? (
                <Form.Item label=' '>
                  <Checkbox.Group options={filterOption[defectClass]} onChange={this.onDefectClassDetailChange} />
                </Form.Item>
              ) : null}
              <Form.Item label='Defect size:'>
                <Input style={{ width: 60 }} onChange={e => this.onDefectSizeChange(0, e.target.value)} size='small' />
                -
                <Input style={{ width: 60 }} onChange={e => this.onDefectSizeChange(1, e.target.value)} size='small' />
              </Form.Item>
              <Form.Item label='Test:'>
                <Checkbox.Group options={filterOption.testId} onChange={v => this.onDefectFiltersChange('tests', v)} />
              </Form.Item>
              <Form.Item label='Cluster:'>
                <Checkbox.Group options={filterOption.cluster} onChange={v => this.onDefectFiltersChange('clusterIds', v)} />
              </Form.Item>
              <Form.Item label='Adder:'>
                <Switch
                  size='small'
                  defaultChecked={filter.adder[0] === 'YES'}
                  onChange={checked => this.onDefectFiltersChange('adder', checked ? ['YES'] : ['NO'])}
                />
              </Form.Item>
              <Form.Item label='Repeater:'>
                <Checkbox.Group
                  options={filterOption.repeater}
                  onChange={v => this.onDefectFiltersChange('repeaterIds', v)}
                />
              </Form.Item>
              <Form.Item label='Zone:'>
                <Checkbox.Group options={filterOption.zoneId} onChange={v => this.onDefectFiltersChange('zoneIds', v)} />
              </Form.Item>
              <Form.Item label='Sub Die:'>
                <Checkbox.Group options={filterOption.subDieId} onChange={v => this.onDefectFiltersChange('subDieIds', v)} />
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

injectReducer('SingleMap', reducer)
const mapStateToProps = state => ({
  ...state.Init,
  ...state.DataQuery,
  ...state.SingleMap
})
const mapDispatchToProps = {
  changeWafers,
  changeSingleSelected,
  changeSingleWafers
}
export default connect(mapStateToProps, mapDispatchToProps)(SingleMap)
