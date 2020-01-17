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
  Upload,
  Icon,
  message
} from 'antd'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import _ from 'lodash'
import zrender from 'zrender'
import Heatmap from 'heatmap.js'
// import { injectReducer } from '@/utils/store'
import moment from 'moment'
import { delay } from '@/utils/web'
// import { changeForm, changeItems } from './action'
import { changeWaferSelected } from '@/utils/action'
// import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'
// import reducer from './reducer'
import { reclassifyParams, getImages, updateCorrect, deleteCorrect } from './service'
import { post, download } from '@/utils/api'
import { StyleSingleMap, StyleWafer, StylePareto } from './style'
import CommonDrawer from '@/components/CommonDrawer'

const commands = ['Rotation', 'Export to CSV', 'Export klarf', 'Send to review', 'Overlap']
const btns = [
  { content: '截取', i: 'select', func: 'chooseArea' },
  { content: '取消选中', i: 'undo', func: 'reply' },
  { content: '标记', i: 'pushpin', func: 'podcast' },
  { content: '显示选中点', i: 'check', func: 'star' },
  { content: '显示非选中点', i: 'close', func: 'star0' },
  { content: '选中点重新分类', i: 'apartment', func: 'reclassify' },
  { content: '删除选中点', i: 'delete', func: 'trash' },
  { content: '刷新', i: 'sync', func: 'refresh' }
]
const srcMapping = { 'Map/Pareto': '', 'Die Stack': '/ds', 'Reticle Stack': '/rs', 'Heat Map': '' }

let zr = null
let group = null
let rectRecords = []
let pointRecords = []
let timeout = null
let chosedArea = []
let chosedPoints = {}
let zoomRecords = {}
let mouseDownStartInner = false

const printTime = (sign = '') => {
  console.log(sign, `${moment(new Date()).second()}-${moment(new Date()).millisecond()}`)
}

class SingleMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      /* index */
      mapType: 'Map/Pareto',
      dsa: false,
      dsaInfo: {
        // dsaOrder: '',
        // sortName: ''
      },
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

      /* wafer */
      imageInfos: [],
      angel: 0,
      customizeAngel: false,
      // 晶圆图实例
      zr: null,
      // 晶圆图组实例
      group: null,
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
      resData: null,
      ifAvg: 'sum',
      allBar: [],

      // imageDetail
      pageSize: 10,
      infoPages: [],

      /* dsa pareto */
      formInline: {
        sort: '1',
        sortOrder: '1'
      },
      sortArr: [
        { label: 'STEP_ID', value: '1' },
        { label: 'SCAN_TM', value: '2' }
      ],
      sortOrderArr: [
        { label: '升序', value: '1' },
        { label: '降序', value: '2' }
      ],
      resData: null,
      colorsArr: [],
      selectBar: [],
      disappearBar: [],
      allSelectBar: [],
      allDisappearBar: [],
      typeBar: '',

      /* map info */
      infos: {
        'Lot ID': [],
        'Wafer No': [],
        'Product ID': [],
        'Step ID': [],
        'Scan Time': []
      },
      indexStyle: {
        0: true,
        1: true,
        2: true,
        3: true,
        4: true
      },

      total: 0,
      pageNo: 1
    }
  }

  async componentDidMount() {
    // const { items, itemSelected, defect } = this.props
    const singleWaferKey = [
      {
        lotId: 'SQCA00019',
        productId: 'GDM119',
        waferNo: '10.10',
        stepId: '4628_KTCTBRDP',
        scanTm: '2009-07-06 09:34:44',
        defects: [],
        defectIdRedisKey: '12a94eee-3d66-4511-a665-210ddcd79649'
        // lotId: "B0001.000",
        // stepId: "M1_CMP",
        // waferNo: "1",
        // productId: "Device01",
        // scanTm: "2018-05-31 12:30:35",
        // defects: [],
        // defectIdRedisKey: "59118255-e158-4f59-960f-2c538f1629c7"
      }
    ]
    this.setState({ singleWaferKey })
    await delay(1)
    this.onInit()
  }

  // computed
  getDataOption = () => {
    const { data } = this.state
    return data[0] || {}
  }

  // watch selectAction change
  onSelectActionChange = () => {
    this.init(zoomRecords)
  }

  onInit = async () => {
    printTime('onInit')
    const { name } = this.props
    const zrDom = document.getElementById(`main-${name}`)
    if (!zrDom) {
      console.log('zrDom not found')
      return
    }
    zr = zrender.init(zrDom)
    group = new zrender.Group()
    await delay(1)
    // this.setState({ zr, group })
    //  判断是否点击了小圆点
    group.on('click', async e => {
      if (e.target.shape.r) {
        // console.log(e)
        const imgDom = document.getElementById(`img-${name}`)
        if (!imgDom) {
          console.log('imgDom not found')
          return
        }
        imgDom.style.display = 'none'
        let x = e.target.shape.cx
        let y = e.target.shape.cy
        let emitObj = []
        this.pointIdsMapping.forEach((item, index) => {
          let pointCoordinate = item[`${x},${y}`]
          if (pointCoordinate) {
            let { lotId: lotId, waferNo: waferNo, productId: productId, stepId: stepId, scanTm: scanTm } = this.data[
              index
            ]
            let defectsInfomation = { lotId, waferNo, productId, stepId, scanTm, defects: pointCoordinate }
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
          for (let defectInfo in data) {
            let [lotId, , , waferNo, , defects] = defectInfo.split('|')
            data[defectInfo].forEach(item => {
              arr.push({ lotId, waferNo, defects, image: 'http://161.189.50.41:80' + item })
            })
          }
          this.setState({ imageInfos: arr })
        }
      }
    })
    this.init()
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
        let x = parseInt((e.offsetX - waferLocation.x) / this.zoomTimes)
        let y = parseInt((e.offsetY - waferLocation.y) / this.zoomTimes)
        if (timeout) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
          this.init({ times, x, y })
        }, 100)
      }
    })
  }

  //选择区域
  checkArea = () => {
    printTime('checkArea')
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
    const { data } = this.state
    const dataOption = this.getDataOption()
    const zoomTimes = dataOption.magnification || 1
    this.setState({ zoomTimes })
    if (parseInt(zoomTimes) === 1) this.drawIsogon()
  }

  onMapTypeChange = e => {
    this.setState({ mapType: e.target.value })
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
        this.init(zoomRecords)
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
        this.init(zoomRecords)
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
      this.init()
    }
  }

  init = async options => {
    group.removeAll()
    await delay(1)
    const res = await this.getData(options)
    this.setState({ data: res })
    // await delay(1)
    const { mapType, data } = this.state
    if (mapType === 'Map/Pareto' || mapType === 'Heat Map') this.renderOutterCircle()
    printTime('renderRects')
    this.renderRects()
    printTime('renderPoints')
    this.renderPoints()
    printTime('recordZoom')
    this.recordZoom()
    printTime('recordZoom end')
    if (mapType === 'Map/Pareto' && data[0].magnification == 1) this.drawIsogon()
    // const { dsa } = this.state
    // if (dsa) {
    //   this.$refs.dsaPareto.init()
    // } else {
    //   this.$refs.pareto.initSwp()
    // }
  }
  getData = async ({ times = 1, x = 200, y = 200 } = {}) => {
    let src = ''
    const { dsaInfo, mapType } = this.state
    if (_.isEmpty(dsaInfo)) {
      src = `swm${srcMapping[mapType]}`
    } else {
      src = `dm${srcMapping[mapType]}`
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
  recordZoom() {
    const dataOption = this.getDataOption()
    const { magnification: times, centralLocation: center } = dataOption
    zoomRecords = { times, x: center.x, y: center.y }
  }
  /* - - - - - - - - - - - - 绘图相关 Begin - - - - - - - - - - - -  */
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
    console.log('dataOption', dataOption)
    const { dieWidth: width, dieHeight: height, dies = [], noScanDies = [] } = dataOption
    let firstDie = dies[0] || { bin: 0 }
    let binMax = firstDie.bin
    let binMin = firstDie.bin
    dies.forEach(({ bin }) => {
      binMax = binMax > +bin ? binMax : +bin
      binMin = binMin < +bin ? binMin : +bin
    })
    // 条状渐变色填充
    let bgColor = []
    const { mapType, overlapType } = this.state
    if (mapType === 'Map/Pareto' && overlapType === 'Bin Map') {
      bgColor = this.gradientColors('#ff0', '#f00', binMax - binMin + 1)
    }
    // 有效方格渲染（填充色获取+方格渲染）
    let fillStyle = { fill: 'none', stroke: '#14f1ff', opacity: 0.5 }
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
  renderPoints = () => {
    this.clearPoints()
    this.setState({ pointIdsMapping: [] })
    const { data } = this.state
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
  renderSingleMap = (defectInfos, index) => {
    const { pointIdsMapping, selectedBar } = this.state
    console.log('renderSingleMap', pointIdsMapping)
    pointIdsMapping[index] = {}
    this.setState({ pointIdsMapping })
    for (let name in defectInfos) {
      for (let seriesName in defectInfos[name]) {
        const point = defectInfos[name][seriesName]
        let pointColor
        const { colorsObj } = this.state
        if (_.isEmpty(colorsObj)) {
          pointColor = '#' + this.getColor(seriesName)
        } else {
          pointColor = colorsObj[name + '-' + seriesName]
        }
        if (!selectedBar.includes(name + '-' + seriesName)) {
          for (let coordinate in point) {
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
  // 随机生成颜色
  getColor = str => {
    let hash = 1315423911
    for (let i = str.length - 1; i >= 0; i--) {
      let ch = str.charCodeAt(i)
      hash ^= (hash << 5) + ch + (hash >> 2)
    }
    return (hash & 0x7fffff).toString(16)
  }
  // 渲染单个点({横坐标，纵坐标，填充色}，是否星形点)
  renderPoint = ({ x, y, color }, isStar) => {
    const shape = isStar ? { cx: x, cy: y, n: 4, r: 5 } : { cx: x, cy: y, r: 2 }
    return new zrender[isStar ? 'Star' : 'Circle']({ shape, style: { fill: color } })
  }
  // 选中点及基本信息
  deliveryPoints() {
    let singleMapArr = []
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
  // 渐变色
  gradientColors(start, end, steps) {
    let i,
      j,
      ms,
      me,
      output = [],
      so = []
    const normalize = channel => {
      return Math.pow(channel / 255, 1)
    }
    start = this.parseColor(start).map(normalize)
    end = this.parseColor(end).map(normalize)
    for (i = 0; i < steps; i++) {
      ms = i / (steps - 1)
      me = 1 - ms
      for (j = 0; j < 3; j++) {
        so[j] = this.pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1) * 255).toString(16))
      }
      output.push('#' + so.join(''))
    }
    return output
  }
  // 方格背景颜色
  parseColor = hexStr => {
    return hexStr.length === 4
      ? hexStr
          .substr(1)
          .split('')
          .map(function(s) {
            return 0x11 * parseInt(s, 16)
          })
      : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function(s) {
          return parseInt(s, 16)
        })
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
    this.setState({reclassifyDialog: false})
    const { reclassifyForm } = this.state
    await updateCorrect({
      singleWaferKey: this.downloadPoints(),
      correct: reclassifyForm
    })
    chosedPoints = {}
    this.init()
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
      this.onSelectActionChange()
    }
    if (deleteDefectsType === '清除选中点并导出') download('export', { singleWaferKey: this.deliveryPoints() })
    if (deleteDefectsType === '删除选中点' || deleteDefectsType === '删除选中点并导出') {
      await deleteCorrect({singleWaferKey: this.downloadPoints()})
      chosedPoints = {}
      this.setState({ selectAction: '' })
      this.init()
    }
    if (deleteDefectsType === '删除选中点并导出') download('export', { singleWaferKey })
    this.setState({ deleteDefectsType: '' })
  }

  onFilterSubmit = () => {}

  onParetoSearch = () => {}
  onParetoClear = () => {}

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
    const { reclassifyDialog, correct, reclassifyForm } = this.state
    const { deleteDefectsDialog, deleteDefectsOptions } = this.state
    const { x, x2n, y } = this.state

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
                          {commands.map(c => (
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
                  {btns.map(item => (
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
                    <Button type='dashed' onClick={() => this.setState({ reclassifyDialog: false })}>Cancel</Button>
                    <Button type='primary' onClick={this.onReclassify}>重新分类</Button>
                    <Button type='primary' onClick={this.onReclassifyDownload}>重新分类并下载Klarf</Button>
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
          <StylePareto>
            <Form layout='inline'>
              <Form.Item label='X轴'>
                <Select onChange={xValue => this.setState({ xValue })}>
                  {Object.keys(x).map(key => (
                    <Select.Option key={key} value={x[key]} style={{ width: 100 }}>
                      {x[key]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='2nd X'>
                <Select onChange={x2ndValue => this.setState({ x2ndValue })}>
                  {Object.keys(x2n).map(key => (
                    <Select.Option key={key} value={x2n[key]}>
                      {x2n[key]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='Y轴'>
                <Select onChange={yValue => this.setState({ yValue })}>
                  {Object.keys(y).map(key => (
                    <Select.Option key={key} value={y[key]}>
                      {y[key]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label=' '>
                <Button onClick={this.onParetoSearch} type='primary' style={{ marginRight: 10 }}>
                  Search
                </Button>
                <Button onClick={this.onParetoClear} type='dashed'>
                  Clear
                </Button>
              </Form.Item>
              {singleWaferKey.length - 1 > 0 ? (
                <Form.Item label='SUM or AVG'>
                  <Select onChange={ifAvg => this.setState({ ifAvg })}>
                    <Select.Option value='sum'>sum</Select.Option>
                    <Select.Option value='avg'>avg</Select.Option>
                  </Select>
                </Form.Item>
              ) : null}
            </Form>
          </StylePareto>
        </div>
        <CommonDrawer ref={r => (this.drawer = r)} width={550}>
          <section>
            <h3 style={{ width: 60 }}>Filters</h3>
            <Form layout='vertical' labelCol={{ span: 5 }}>
              <Form.Item label='Defect Class:'>1</Form.Item>
              <Form.Item label=' '>
                <Button onClick={this.onFilterSubmit} type='primary'>
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
