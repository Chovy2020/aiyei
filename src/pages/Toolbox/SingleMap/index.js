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
  Icon,
  InputNumber,
  message
} from 'antd'
import _ from 'lodash'
import zrender from 'zrender'
import Heatmap from 'heatmap.js'
// import moment from 'moment'
import { injectReducer } from '@/utils/store'
import echarts from 'echarts'
// eslint-disable-next-line
import { delay, printTime, getColor, gradientColors, toPercent } from '@/utils/web'
import { changeWafers } from '@/utils/action'
import { post, download } from '@/utils/api'
import CommonDrawer from '@/components/CommonDrawer'
import { changeSingleSelected, changeSingleWafers, changeSingleParams } from './action'
import {
  SORT_LIST,
  SORT_ORDER_LIST,
  COMMANDS,
  TOOL_TIPS,
  MAP_TYPES,
  DEFECT_CLASS_LIST,
  DELETE_DEFECTS_OPTIONS,
  OVER_LAP_TYPE_OPTIONS,
  DSA_TABLE_COLUMNS,
  INFO_COLUMNS,
  YES_NO
} from './constant'
import reducer from './reducer'
import {
  reclassifyParams,
  getImages,
  updateCorrect,
  deleteCorrect,
  getX,
  getX2nd,
  getY,
  getDp,
  getDSATableData
} from './service'
import { StyleSingleMap, StyleWafer, StylePareto, StyleChart, StyleDSA, StyleImages, StyleTable } from './style'
// import SinglePareto from './component/SingleParato'

// eslint-disable-next-line
let drawer = null

class SingleMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      zr: null,
      group: null,
      rectRecords: [],
      pointRecords: [],
      timeout: null,
      chosedArea: [],
      zoomRecords: {},
      mouseDownStartInner: false,
      paretoChart: null,
      dsaChart: null,
      zoomTimes: 1,
      selectedPointsKey: [],
      // ---
      singleMapColors: {
        '': '#67c6a7'
      },
      existDefects: false,
      mapData: [],
      coordinate: [],
      paretoData: {},
      /* index */
      mapType: 'Map/Pareto',
      dsa: false,
      dsaInfo: {},
      selectedDefects: [],
      showOtherMap: false,
      selectAction: '',
      paretoParams: {
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
      deleteDefectsType: '清除选中点',
      /* Pareto */
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
        testId: [],
        adder: [],
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

  async componentDidMount() {
    // 如果前一个页面是chartSelection，获取params
    const { name, prevPage } = this.props
    if (prevPage && prevPage.type === 'Chart Selection') {
      const { params } = this.props
      const paretoParams = {
        '1stXCode': params.x,
        '2ndXCode': params.x2n,
        yCode: params.y
      }
      this.setState({ paretoParams, selectedBar: params.bars })
      this.props.changeSingleParams({
        name,
        params: {
          x: paretoParams['1stXCode'],
          x2n: paretoParams['2ndXCode'],
          y: paretoParams['yCode'],
          bars: paretoParams.bars
        }
      })
    } else {
      const { paretoParams } = this.state
      this.props.changeSingleParams({
        name,
        params: {
          x: paretoParams['1stXCode'],
          x2n: paretoParams['2ndXCode'],
          y: paretoParams['yCode'],
          bars: []
        }
      })
    }
    // 从store里取出 dataQuery查询的filterOption
    const { filterOption } = this.props
    this.setState({ filterOption })
    // 将wafers保存到store，跳转下一个页面使用
    let { wafers } = this.props
    if (wafers.length === 0) {
      wafers = [
        {
          lotId: 'F0001.000',
          stepId: 'M1_CMP',
          waferNo: '1',
          productId: 'Device01',
          scanTm: '2020-01-01 12:51:35',
          defects: []
          // currentDefects: [101, 69]
        },
        {
          lotId: 'F0001.000',
          stepId: 'M1_CMP',
          waferNo: '1',
          productId: 'Device01',
          scanTm: '2020-01-01 13:43:35',
          defects: []
        },
        {
          lotId: 'F0001.000',
          stepId: 'M2_CMP',
          waferNo: '1',
          productId: 'Device01',
          scanTm: '2020-01-02 10:43:35',
          defects: []
        }
      ]
    }
    let existDefects = false
    for (const wafer of wafers) {
      if (wafer.defects.length > 0) {
        existDefects = true
        break
      }
    }
    this.setState({ existDefects })
    wafers = wafers.map(w => {
      const { lotId, stepId, waferNo, productId, scanTm, defects } = w
      return {
        lotId,
        stepId,
        waferNo,
        productId,
        scanTm,
        currentDefects: existDefects ? defects : null,
        defects: []
      }
    })
    this.props.changeSingleWafers({ name, wafers })
    this.onParetoChartInit()
    this.onDSAChartInit()
    this.onMapCreated()
    this.onParetoCreated()
    this.setState({
      showOtherMap: this.showOtherMapInit(wafers)
    })
  }
  // componentDidUpdate = (prevProps, prevState) => {}
  // productId唯一时,显示Die Stack/Reticle Stack/Heap Map
  showOtherMapInit = wafers => {
    if (wafers.length > 1) {
      const firstWaferProductId = wafers[0].productId
      for(const wafer of wafers) {
        if (wafer.productId !== firstWaferProductId) return false
      }
    }
    return true
  }
  // 初始化 ParetoChart, 绑定点击事件
  onParetoChartInit = () => {
    const { name } = this.props
    let { paretoChart } = this.state
    const paretoChartDom = document.getElementById(`pareto-chart-${name}`)
    if (paretoChartDom) {
      paretoChart = echarts.init(paretoChartDom)
      paretoChart.on('click', params => this.onParetoChartClick(params))
    } else {
      console.log('paretoChartDom not found')
    }
    this.setState({ paretoChart })
  }
  // 初始化 DSAChart, 绑定点击事件
  onDSAChartInit = () => {
    const { name } = this.props
    let { dsaChart } = this.state 
    const dsaChartDom = document.getElementById(`dsa-chart-${name}`)
    if (dsaChartDom) {
      dsaChart = echarts.init(dsaChartDom)
      dsaChart.on('click', params => this.onDSAChartClick(params))
    } else {
      console.log('dsaChartDom not found')
    }
    this.setState({ dsaChart })
  }
  // computed
  getDataOption = () => {
    const { mapData } = this.state
    return mapData[0] || {}
  }
  //选择区域 事件绑定
  onCheckAreaInit = () => {
    let x, y, distanceX, distanceY, moveRect
    const { zr, group, chosedArea } = this.state
    let { mouseDownStartInner } = this.state
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
    this.setState({ zr, group, chosedArea, mouseDownStartInner })
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
      console.log('Export klarf')
      const singleWaferKey = this.getWafers()
      download('export', { singleWaferKey })
    } else if (key === 'Send to review') {
      console.log('review')
    } else if (key === 'Overlap') {
      this.setState({ overlapDialog: true })
    }
  }
  onDropDownReset = () => {
    // const { name } = this.props
    // this.props.changeSingleSelected({ name, selected: [] })
    this.setState({
      angel: 0,
      selectAction: '',
      selectedAction: '',
      coordinate: [],
      selectedBar: [],
      disappearBar: []
    })
    this.saveSelectedBar([])
    this.onMapAndParetoInit()
  }
  onMapTypeChange = async e => {
    const mapType = e.target.value
    this.setState({
      mapType,
      angel: 0,
      overlapType: ''
    })
    await this.onMapInit()
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
    const { coordinate, group, chosedArea } = this.state
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
      if (chosedArea.length === 0) {
        message.info('Please select area first')
        return
      }
      this.setState({ angel: 0 })
      this.onDoActionPodcast()
    } else if (func === 'star' || func === 'star0') {
      if (noSelectedPoints) {
        message.info('No defects selected')
        return
      }
      this.setState({ angel: 0 })
      this.onMapAndParetoInit()
    } else if (func === 'reclassify') {
      if (noSelectedPoints) {
        message.info('No defects selected')
        return
      }
      const singleWaferKey = this.getSelected()
      const correct = await reclassifyParams({ singleWaferKey })
      this.setState({
        correct,
        angel: 0,
        reclassifyDialog: true
      })
    } else if (func === 'trash') {
      if (noSelectedPoints) {
        message.info('No defects selected')
        return
      }
      this.setState({
        angel: 0,
        deleteDefectsDialog: true
      })
    } else if (func === 'refresh') {
      this.onDropDownReset()
    }
    this.setState({ group, chosedArea })
  }
  // 标记
  onDoActionPodcast = () => {
    // 把区域内的坐标都找出来，存放到coordinate，后续绘制使用
    const { mapData, coordinate, selectedBar, group } = this.state
    let { chosedArea } = this.state
    for (const wafer of mapData) {
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
    this.renderMap()
    // - - - - - - singleSelected - - - - - -
    // 点击标记的时候计算：如果区域内存在defect，统计选中的defects，存到store，后续分类、删除或页面跳转
    const existBar = selectedBar.length > 0
    const existArea = coordinate.length > 0
    const wafers = this.getWafers()
    const selectedPointsKey = []
    for (const wafer of mapData) {
      const w = {
        lotId: wafer.lotId,
        waferNo: wafer.waferNo,
        productId: wafer.productId,
        stepId: wafer.stepId,
        scanTm: wafer.scanTm,
        defects: []
      }
      for (const p of wafers) {
        if (
          p.lotId === w.lotId &&
          p.waferNo === w.waferNo &&
          p.productId === w.productId &&
          p.stepId === w.stepId &&
          p.scanTm === w.scanTm
        ) {
          w.currentDefects = p.defects.length > 0 ? p.defects : null
        }
      }
      for (const mb in wafer.defectInfos) {
        for (const ob in wafer.defectInfos[mb]) {
          if (existBar && selectedBar.includes(`${mb}-${ob}`)) continue
          for (const coo in wafer.defectInfos[mb][ob]) {
            if (existArea && coordinate.includes(coo)) {
              // 选中区域内同一个坐标下 所有点都符合
              w.defects = [...w.defects, ...wafer.defectInfos[mb][ob][coo]]
            }
          }
        }
      }
      selectedPointsKey.push(w)
    }
    this.setState({ selectedPointsKey, group, chosedArea })
  }
  /* - - - - - - - - - - - - Map - - - - - - - - - - - -  */
  onMapAndParetoInit = () => {
    this.onMapInit()
    this.onParetoInit()
  }
  // Map 创建 【点击defect查看图片、鼠标滚轮事件】
  onMapCreated = async () => {
    const { name } = this.props
    const zrDom = document.getElementById(`main-${name}`)
    if (!zrDom) {
      console.log('zrDom not found')
      return
    }
    const zr = zrender.init(zrDom)
    const group = new zrender.Group()
    //  判断是否点击了小圆点
    group.on('click', async e => {
      this.setState({ imageVisible: true })
      await delay(1)
      if (e.target.shape.r > 0) {
        const imgDom = document.getElementById(`img-${name}`)
        if (!imgDom) {
          console.log('imgDom not found')
          return
        }
        imgDom.style.display = 'none'
        const x = e.target.shape.cx
        const y = e.target.shape.cy
        const defectCoo = `${x},${y}`
        const { mapData } = this.state
        const imageInfo = []
        // let defectsCount = 0
        for (const wafer of mapData) {
          const w = {
            lotId: wafer.lotId,
            waferNo: wafer.waferNo,
            productId: wafer.productId,
            stepId: wafer.stepId,
            scanTm: wafer.scanTm,
            defects: []
          }
          for (const mb in wafer.defectInfos) {
            for (const ob in wafer.defectInfos[mb]) {
              for (const coo in wafer.defectInfos[mb][ob]) {
                if (defectCoo === coo) {
                  w.defects = [...w.defects, ...wafer.defectInfos[mb][ob][coo]]
                }
              }
            }
          }
          imageInfo.push(w)
        }
        const res = await getImages({
          imageInfo,
          singleGalleryFlag: 'singleMap'
        })
        if (res.singleMap && _.isEmpty(res.singleMap)) {
          message.warning('No photos yet')
          this.setState({ imageVisible: false })
          return
        }
        imgDom.style.top = e.offsetY + 'px'
        imgDom.style.left = e.offsetX + 5 + 'px'
        imgDom.style.display = 'block'
        let arr = []
        const images = {}
        for (const group in res) {
          for (const id in res[group]) {
            for (const url of res[group][id]) {
              const [lotId, , , waferNo, , defects] = id.split('|')
              arr.push({ lotId, waferNo, defects, image: 'http://161.189.50.41:80' + url })
            }
          }
        }
        this.setState({ defectImages: arr, imagesTotal: arr.length })
        await delay(1)
        this.onImageDetailPageChange(1)
      }
    })
    zr.on('mousewheel', e => {
      e = e || window.event
      let { mapType, timeout, zoomTimes } = this.state
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
          this.onMapInit({ zoom: { times, x, y } })
        }, 100)
        this.setState({ timeout, zoomTimes })
      }
    })
    this.setState({ zr, group })
    await delay(1)
    this.onMapInit()
    this.onCheckAreaInit()
  }
  // Wafer 初始化
  onMapInit = async option => {
    await delay(1)
    const { group } = this.state
    let { zoomTimes } = this.state
    // this.setState({ selectedAction: '' })
    group.removeAll()
    this.setState({ group })
    const { dsa, mapType } = this.state
    const formData = this.getFormData(option)
    const mapData = await post(`${dsa ? 'dm' : 'swm'}${MAP_TYPES[mapType]}`, formData)
    this.setState({ mapData })
    // 同时更新缩放倍数
    if (mapData.length > 0) zoomTimes = mapData[0].magnification
    if (mapType === 'Map/Pareto' || mapType === 'Heat Map') this.renderOutterCircle()
    this.renderRects()
    if (mapType === 'Map/Pareto' && zoomTimes === 1) this.drawIsogon()
    this.renderMap()
    this.recordZoom()
    this.setState({ zoomTimes })
  }
  // rednerPoint & renderPareto
  renderMap = async () => {
    await delay(1)
    const { mapData, coordinate, selectedBar, selectedAction, singleMapColors, pointRecords, group } = this.state
    const existBar = selectedBar.length > 0
    const existArea = coordinate.length > 0
    // - - - - - - renderMap - - - - - -
    if (mapData.length === 0) return
    this.clearPoints()
    for (const wafer of mapData) {
      for (const mb in wafer.defectInfos) {
        for (const ob in wafer.defectInfos[mb]) {
          if (existBar && selectedBar.includes(`${mb}-${ob}`)) continue
          for (const coo in wafer.defectInfos[mb][ob]) {
            // console.log('coo', coo)
            let [x, y] = coo.split(',')
            // 同一个坐标下 只绘制一次点
            // 选中的区域点绘制成 星星
            let Point = null
            if (selectedAction === 'podcast' && existArea && coordinate.includes(coo)) {
              Point = new zrender.Star({ shape: { cx: +x, cy: +y, n: 4, r: 5 }, style: { fill: singleMapColors[ob] } })
            } else if (selectedAction === 'star') {
              Point = new zrender.Star({ shape: { cx: +x, cy: +y, n: 4, r: 5 }, style: { fill: singleMapColors[ob] } })
            } else Point = new zrender.Circle({ shape: { cx: +x, cy: +y, r: 2 }, style: { fill: singleMapColors[ob] } })
            if (Point) {
              group.add(Point)
              pointRecords.push(Point)
            }
          }
        }
      }
    }
    this.setState({ pointRecords, group })
    // 完成renderMap, 统计当前的所有点，存store
    const selected = []
    for (const w of mapData) {
      const wafer = {
        lotId: w.lotId,
        productId: w.productId,
        scanTm: w.scanTm,
        stepId: w.stepId,
        waferNo: w.waferNo,
        defects: []
      }
      for (const mb in w.defectInfos) {
        for (const ob in w.defectInfos[mb]) {
          if (existBar && selectedBar.includes(`${mb}-${ob}`)) continue
          for (const coo in w.defectInfos[mb][ob]) {
            wafer.defects = [...wafer.defects, ...w.defectInfos[mb][ob][coo]]
          }
        }
      }
      selected.push(wafer)
    }
    const { name } = this.props
    this.props.changeSingleSelected({ name, selected })
  }
  // 记录本次放大数据
  recordZoom = () => {
    const dataOption = this.getDataOption()
    const { magnification: times, centralLocation: center } = dataOption
    this.setState({ zoomRecords: { times, x: center.x, y: center.y } })
  }
  /* - - - - - - - - - - - - 下拉菜单功能 和 map侧边功能 - - - - - - - - - - - -  */
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
    const { zoomTimes } = this.state
    if (zoomTimes === 1) this.drawIsogon()
  }
  onReclassifyFormChange = (key, value) => {
    const { reclassifyForm } = this.state
    reclassifyForm[key] = value
    this.setState({ reclassifyForm })
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
    this.onMapInit()
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
    const singleWaferKey2 = this.getWafers()
    const { deleteDefectsType } = this.state
    if (deleteDefectsType === DELETE_DEFECTS_OPTIONS[0] || deleteDefectsType === DELETE_DEFECTS_OPTIONS[1]) {
      // 从 mapData 中删除
      const { mapData, coordinate } = this.state
      const existArea = coordinate.length > 0
      for (const wafer of mapData) {
        for (const mb in wafer.defectInfos) {
          for (const ob in wafer.defectInfos[mb]) {
            for (const coo in wafer.defectInfos[mb][ob]) {
              if (existArea && coordinate.includes(coo)) {
                delete wafer.defectInfos[mb][ob][coo]
              }
            }
          }
        }
      }
      this.setState({
        mapData,
        coordinate: []
      })
      this.renderMap()
    }
    if (deleteDefectsType === DELETE_DEFECTS_OPTIONS[1]) download('export', { singleWaferKey })
    if (deleteDefectsType === DELETE_DEFECTS_OPTIONS[2] || deleteDefectsType === DELETE_DEFECTS_OPTIONS[3]) {
      await deleteCorrect({ singleWaferKey })
      this.setState({ coordinate: [] })
      this.onMapInit()
    }
    if (deleteDefectsType === DELETE_DEFECTS_OPTIONS[2]) download('export', { singleWaferKey: singleWaferKey2 })
    this.setState({ deleteDefectsType: DELETE_DEFECTS_OPTIONS[0] })
  }
  /* - - - - - - - - - - - - Pareto - - - - - - - - - - - -  */
  // Pareto 创建
  onParetoCreated = async () => {
    const { paretoParams } = this.state
    const x = await getX()
    const x2n = await getX2nd(paretoParams['1stXCode'])
    x2n[''] = 'None'
    const y = await getY(paretoParams['1stXCode'], paretoParams['2ndXCode'])
    this.setState({ x, x2n, y })
    this.onParetoInit()
  }
  // Parato 初始化 (包含pareto 和 dsaParato)
  onParetoInit = async () => {
    await delay(1)
    const { dsa } = this.state
    const formData = this.getFormData()
    if (dsa) {
      const dsaData = await getDp(formData)
      this.setState({
        dsaData,
        allDisappearBar: [],
        allSelectBar: []
      })
      this.dealDsaData()
    } else {
      const paretoData = await post('swp', formData)
      // 计算颜色
      const { singleMapColors } = this.state
      if (paretoData && paretoData.paretoValue && paretoData.paretoValue.series.length > 0) {
        paretoData.paretoValue.series.forEach(({name}) => {
          if (!singleMapColors[name]) singleMapColors[name] = '#' + getColor(name)
        })
      }
      this.setState({ paretoData, singleMapColors })
      this.renderPareto()
    }
  }
  // 渲染图表
  renderPareto = async () => {
    await delay(1)
    const { paretoData, x, y, paretoParams, ifAvg, selectedBar } = this.state
    if (_.isEmpty(paretoData)) return
    const wafers = this.getWafers()
    const len = wafers.length
    const opt = {
      width: 'auto',
      legend: { type: 'scroll' },
      tooltip: {},
      xAxis: { type: 'category', name: x[paretoParams['1stXCode']] },
      yAxis: { type: 'value', name: y[paretoParams['yCode']] },
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
    const hold = []
    const holdArr = []
    const colorArr = []
    const seriesArr = []
    const xAxisData = paretoData.paretoValue.xAxisData
    const series = paretoData.paretoValue.series
    let legendArr = []
    const yCode = parseInt(paretoParams['yCode'])
    if (xAxisData.length > 0 && series.length > 0) {
      xAxisData.forEach((item, index) => {
        arr[index] = [item]
      })
      series.forEach(item => {
        item.data.forEach((item, index) => {
          arr[index].push(ifAvg === 'avg' ? Math.round(item / len) : item)
        })
        legendArr.push(item.name)
        hold.push(item.holdValue)
        colorArr.push('#' + getColor(item.name))
      })
      arr.unshift(['product', ...legendArr])
      hold.forEach((item, i) => {
        holdArr.push({
          value: item,
          xAxis: i,
          yAxis: item
        })
      })
      colorArr.forEach((item, index) => {
        seriesArr.push({
          type: 'bar',
          markPoint: {
            data: holdArr
          },
          itemStyle: {
            color: param => {
              param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
              return selectedBar.includes(param.name + '-' + param.seriesName) ? '#ccc' : item
            }
          },
          label: {
            normal: {
              show: true,
              position: 'top',
              formatter: params => {
                if (yCode >= 300) return toPercent(params.data[index + 1])
                if (yCode >= 200) return params.data[1].toFixed(2)
                return params.data[index + 1]
              }
            }
          }
        })
      })
      // 填充值
      opt.dataset.source = arr
      opt.series = seriesArr
      opt.color = colorArr
    }
    const { paretoChart } = this.state
    paretoChart.setOption(opt)
    this.setState({ paretoChart })
  }
  onChangeX = async x => {
    const { paretoParams } = this.state
    paretoParams['1stXCode'] = x
    paretoParams['2ndXCode'] = ''
    paretoParams.yCode = ''
    const x2n = await getX2nd(x)
    x2n[''] = ''
    const y = await getY(x, '')
    this.setState({ paretoParams, x2n, y })
  }
  onChangeX2nd = async x2n => {
    const { paretoParams } = this.state
    paretoParams['2ndXCode'] = x2n
    paretoParams.yCode = ''
    const y = await getY(paretoParams['1stXCode'], x2n)
    this.setState({ paretoParams, y })
  }
  onChangeY = y => {
    const { paretoParams } = this.state
    paretoParams.yCode = y
    this.setState({ paretoParams })
  }
  // 搜索
  onParetoSearch = () => {
    this.onDropDownReset()
  }
  // 清空
  onParetoClear = async () => {
    const { paretoData } = this.state
    const selectedBar = []
    const xAxisData = paretoData.paretoValue.xAxisData
    const series = paretoData.paretoValue.series
    if (xAxisData.length > 0 && series.length > 0) {
      xAxisData.forEach(x => {
        series.forEach(s => {
          selectedBar.push(`${x}-${s.name}`)
        })
      })
    }
    this.setState({ selectedBar })
    this.saveSelectedBar(selectedBar)
    this.renderPareto()
    this.renderMap()
  }
  onAvgChange = ifAvg => {
    this.setState({ ifAvg })
    this.renderPareto()
  }
  onParetoChartClick = data => {
    const { selectedBar } = this.state
    data.seriesName = data.seriesName.substring(0, 6) === 'series' ? '' : data.seriesName
    const index = selectedBar.indexOf(data.name + '-' + data.seriesName)
    if (~index) {
      selectedBar.splice(index, 1)
    } else {
      selectedBar.push(data.name + '-' + data.seriesName)
    }
    this.setState({ selectedBar })
    this.saveSelectedBar(selectedBar)
    this.renderPareto()
    this.renderMap()
  }
  /* - - - - - - - - - - - - 数据封装与获取 - - - - - - - - - - - -  */
  // 从store取出当前页的selected
  getSelected = () => {
    const { singleSelected, name } = this.props
    console.log(singleSelected, name)
    return singleSelected[name] || []
  }
  // 从store取出当前页的wafers
  getWafers = () => {
    const { singleWafers, name } = this.props
    return singleWafers[name] || []
  }
  // 拼接 defectSize
  getFilter = () => {
    const { filter, defectSize } = this.state
    if (defectSize[0] === '') defectSize[0] = 0
    if (defectSize[1] === '') defectSize[1] = 9999
    const num1 = parseFloat(defectSize[0])
    const num2 = parseFloat(defectSize[1])
    filter.defectSize = [`${Math.min(num1, num2)},${Math.max(num1, num2)}`]
    return filter
  }
  // 计算 selectAction
  getSelectAction = () => {
    const { selectedAction } = this.state
    if (selectedAction === 'star0') return 'clean'
    if (selectedAction === 'star') return 'hold'
    return ''
  }
  // 封装接口请求数据
  getFormData = (option = {}) => {
    const { paretoParams: pareto, selectedAction, dsa, selectedPointsKey } = this.state
    const filter = this.getFilter()
    const singleWaferKey = ['star0', 'star'].includes(selectedAction) ? selectedPointsKey : this.getWafers()
    const selectAction = this.getSelectAction()
    const { zoom } = option
    const canvas = { canvasSize: 400, magnification: '1', centralLocation: '200,200' }
    if (zoom) {
      canvas.magnification = `${zoom.times}`
      canvas.centralLocation = `${zoom.x},${zoom.y}`
    }
    const formData = {
      singleWaferKey,
      canvas,
      filter,
      pareto,
      selectAction
    }
    if (dsa) {
      const { dsaInfo } = this.state
      formData.dsaOrder = dsaInfo.dsaOrder || ''
      formData.sortName = dsaInfo.sortName || ''
    }
    return formData
  }
  // 更新selectedBar
  saveSelectedBar = bars => {
    const { name, singleParams } = this.props
    const params = singleParams[name] || {}
    params.bars = bars
    this.props.changeSingleParams({ name, params })
  }
  /* - - - - - - - - - - - - DSA - - - - - - - - - - - -  */
  // DSA Pareto 切换
  onDsaToggle = () => {
    const { dsa } = this.state
    const singleWaferKey = this.getWafers()
    if (!dsa && singleWaferKey.length < 2) {
      message.warning('At least 2 wafers required')
      return
    }
    // 清除当前的Map 和 pareto
    this.clearPoints()
    const { paretoChart } = this.state
    paretoChart.clear()
    this.setState({ paretoChart, dsa: !dsa, colorsObj: {}, selectedBar: [], dsaInfo: dsa ? {} : { dsaOrder: '1', sortName: '1' } })
    this.saveSelectedBar([])
    this.onMapAndParetoInit()
    if (!dsa) this.onDSATableInit()
  }
  // DSA 排序
  onDSASortChange = (index, value) => {
    if (index === 1) this.setState({ dsaOrder: value })
    else this.setState({ sortName: value })
    this.onParetoInit()
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
    this.renderDsaPareto()
  }
  // DSA 图表
  renderDsaPareto = async () => {
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
    const { dsaChart } = this.state
    dsaChart.setOption(opt,true)
    this.setState({ dsaChart })
  }
  // DSA 柱状图点击
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
      this.saveSelectedBar(selectedBar)
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
      this.saveSelectedBar(_.cloneDeep(allSelectBar))
    }
    this.renderMap()
    this.renderDsaPareto()
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
          // 第一条数据不重复显示
          if (index2 > 0) {
            children.push({
              key: index + '-' + index2,
              step: jtem.step,
              scanTm: jtem.scanTm,
              defectId: jtem.defectId,
              imgUrl: jtem.imgUrl
            })
          }
        })
        dsaTableData[index].children = children
      }
    })
    this.setState({ dsaTableData })
  }

  /* - - - - - - - - - - - - Filters - - - - - - - - - - - -  */
  // 搜索过滤Filter
  onFilterSubmit = () => {
    drawer.onClose()
    const { dsa, paretoChart } = this.state
    const singleWaferKey = this.getWafers()
    if (dsa && singleWaferKey.length < 2) {
      message.warning('At least 2 wafers required')
      return
    }
    // 清除当前的Map 和 pareto
    this.clearPoints() 
    paretoChart.clear()
    this.setState({ paretoChart, colorsObj: {}, selectedBar: [] })
    this.saveSelectedBar([])
    this.onMapAndParetoInit()
    if (dsa) this.onDSATableInit()
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

  /* - - - - - - - - - - - - 绘图相关 - - - - - - - - - - - -  */
  //画外层大圆
  renderOutterCircle = () => {
    // 半径=画布长度*放大倍数/2    canvasLength*magnification/2
    const { zr, group } = this.state
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
    this.setState({ zr, group })
  }
  // 清除方格
  clearRects = () => {
    const { rectRecords, group } = this.state
    rectRecords.forEach(item => {
      group.remove(item)
    })
    this.setState({ rectRecords, group })
  }
  // 渲染方格
  renderRects = () => {
    this.clearRects()
    const { zr, group, rectRecords } = this.state
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
    this.setState({ zr, group, rectRecords })
  }
  // 三角形
  drawIsogon = () => {
    const { zr, group } = this.state
    const Isogon = new zrender.Isogon({ shape: { x: 200, y: 400, r: 13, n: 3 }, style: { fill: 'blue' } })
    group.add(Isogon)
    zr.add(group)
    this.setState({ zr, group })
  }
  // 清除圆点
  clearPoints = () => {
    const { pointRecords, group } = this.state
    pointRecords.forEach(item => {
      group.remove(item)
    })
    this.setState({ pointRecords: [], group })
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
      zoomTimes,
      rotationDialog
    } = this.state
    const { overlapDialog, deleteDefectsType } = this.state
    const { reclassifyDialog, correct } = this.state
    const { deleteDefectsDialog } = this.state
    const { x, x2n, y, paretoParams, ifAvg } = this.state
    const { dsa, sortName, dsaOrder, dsaTableData } = this.state
    const { filterOption, filter, defectClass } = this.state

    const wafers = this.getWafers()

    return (
      <StyleSingleMap>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Type:'>
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
                    {/* <Button size='small' onClick={this.onDropDownReset} type='dashed'>
                      Test
                    </Button> */}
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
              title='Rotation'
              visible={rotationDialog}
              onOk={this.onWaferRotate}
              onCancel={() => this.setState({ rotationDialog: false })}
              okText='Ok'
              cancelText='Cancel'
            >
              <Form layout='vertical' labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Form.Item label='Default'>
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
                <Form.Item label='Angle'>
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
              okText='Ok'
              cancelText='Cancel'
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
              title='Reclassify'
              visible={reclassifyDialog}
              onOk={this.onReclassifyOk}
              onCancel={() => this.setState({ reclassifyDialog: false })}
              footer={
                <div>
                  <Button type='dashed' onClick={() => this.setState({ reclassifyDialog: false })}>
                    Cancel
                  </Button>
                  <Button type='primary' onClick={this.onReclassify}>
                    Reclassify
                  </Button>
                  <Button type='primary' onClick={this.onReclassifyDownload}>
                    Reclassify & Download Klarf
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
              title='Delete Points'
              visible={deleteDefectsDialog}
              onOk={this.onDefectsDelete}
              onCancel={() => this.setState({ deleteDefectsDialog: false })}
              okText='Ok'
              cancelText='Cancel'
            >
              <Radio.Group
                defaultValue={deleteDefectsType}
                onChange={e => this.setState({ deleteDefectsType: e.target.value })}
              >
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
              <Form layout='inline' style={{ height: 59, marginTop: -9 }}>
                <Form.Item label='X' style={{ width: 160 }}>
                  <Select
                    size='small'
                    onChange={this.onChangeX}
                    value={paretoParams['1stXCode']}
                    style={{ width: 130 }}
                  >
                    {Object.keys(x).map(key => (
                      <Select.Option key={key} value={key}>
                        {x[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='2nd X' style={{ width: 180 }}>
                  <Select
                    size='small'
                    onChange={this.onChangeX2nd}
                    value={paretoParams['2ndXCode']}
                    style={{ width: 120 }}
                  >
                    {Object.keys(x2n).map(key => (
                      <Select.Option key={key} value={key}>
                        {x2n[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item size='small' label='Y' style={{ width: 200 }}>
                  <Select size='small' onChange={this.onChangeY} value={paretoParams['yCode']} style={{ width: 170 }}>
                    {Object.keys(y).map(key => (
                      <Select.Option style={{ fontSize: 12 }} key={key} value={key}>
                        {y[key]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button
                    size='small'
                    onClick={this.onParetoSearch}
                    type='primary'
                    style={{ marginRight: 10, minWidth: 50 }}
                  >
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
            <StyleChart id={`pareto-chart-${name}`} style={{ display: `${dsa ? 'none' : 'block'}` }} />
          </StylePareto>

          {/* DSA */}
          <StyleDSA style={{ display: `${dsa ? 'block' : 'none'}` }}>
            {dsa ? (
              <Form layout='inline' style={{ height: 59, marginTop: -9 }}>
                <Form.Item label='Sort' style={{ width: 200 }}>
                  <Select
                    size='small'
                    onChange={v => this.onDSASortChange(0, v)}
                    value={sortName}
                    style={{ width: 110 }}
                  >
                    {SORT_LIST.map(item => (
                      <Select.Option key={item.label} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label='Sort' style={{ width: 200 }}>
                  <Select
                    size='small'
                    onChange={v => this.onDSASortChange(1, v)}
                    value={dsaOrder}
                    style={{ width: 110 }}
                  >
                    {SORT_ORDER_LIST.map(item => (
                      <Select.Option key={item.label} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            ) : null}
            <StyleChart id={`dsa-chart-${name}`} style={{ display: `${dsa ? 'block' : 'none'}` }} />
          </StyleDSA>
        </div>

        <StyleTable
          pagination={false}
          className='single-map-table'
          size='small'
          scroll={{ y: 380 }}
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
            scroll={{ y: 380 }}
            bordered
            columns={DSA_TABLE_COLUMNS}
            dataSource={dsaTableData}
          />
        ) : null}

        <CommonDrawer ref={r => (drawer = r)} width={500}>
          <section>
            <h3>Filters</h3>
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Defect Class:'>
                <Radio.Group onChange={this.onDefectClassChange}>
                  {DEFECT_CLASS_LIST.map(o => (
                    <Radio key={o[0]} value={o[0]}>{o[1]}</Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              {defectClass ? (
                <Form.Item label=' '>
                  <Checkbox.Group value={filter[defectClass]} options={filterOption[defectClass]} onChange={this.onDefectClassDetailChange} />
                </Form.Item>
              ) : null}
              <Form.Item label='Defect Size:'>
                <Input style={{ width: 60 }} onChange={e => this.onDefectSizeChange(0, e.target.value)} size='small' />
                -
                <Input style={{ width: 60 }} onChange={e => this.onDefectSizeChange(1, e.target.value)} size='small' />
              </Form.Item>
              <Form.Item label='Test:'>
                <Checkbox.Group options={filterOption.testId} onChange={v => this.onDefectFiltersChange('testId', v)} />
              </Form.Item>
              <Form.Item label='Cluster:'>
                <Checkbox.Group options={YES_NO} onChange={v => this.onDefectFiltersChange('cluster', v)} />
              </Form.Item>
              <Form.Item label='Adder:'>
                <Checkbox.Group options={YES_NO} onChange={v => this.onDefectFiltersChange('adder', v)} />
              </Form.Item>
              <Form.Item label='Repeater:'>
                <Checkbox.Group options={YES_NO} onChange={v => this.onDefectFiltersChange('repeater', v)} />
              </Form.Item>
              <Form.Item label='Zone:'>
                <Checkbox.Group
                  options={filterOption.zoneId}
                  onChange={v => this.onDefectFiltersChange('zoneId', v)}
                />
              </Form.Item>
              <Form.Item label='Sub Die:'>
                <Checkbox.Group
                  options={filterOption.subDieId}
                  onChange={v => this.onDefectFiltersChange('subDie', v)}
                />
              </Form.Item>
              <Form.Item label=' ' style={{ textAlign: 'right' }}>
                <Button type='primary' onClick={this.onFilterSubmit}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </section>
        </CommonDrawer>

        {/* <SinglePareto name={name} wafers={wafers} /> */}
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
  changeSingleWafers,
  changeSingleParams
}
export default connect(mapStateToProps, mapDispatchToProps)(SingleMap)
