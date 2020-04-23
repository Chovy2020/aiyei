import React from 'react'
import { Form, Select, Table, Input, InputNumber, Button, Icon, Popconfirm } from 'antd'
import zrender from 'zrender'
import { delay, getColor } from '@/utils/web'
import _ from 'lodash'
import { post, download } from '@/utils/api'

class Map extends React.Component {
  constructor(props) {
    super(props)

    this.zr = null;
    this.group = null;

    this.state = {
      singleMapColors: {
        '': '#67c6a7'
      },
    }
  }

  componentDidMount() {
    this.onMapCreated()
    this.onMapInit()
  }

  // Map 创建 
  onMapCreated = async () => {
    const zrDom = this.refs[`map`]
    if (!zrDom) {
      console.log('zrDom not found')
      return
    }
    this.zr = zrender.init(zrDom)
    this.group = new zrender.Group()
  }
  // Wafer 初始化
  onMapInit = async () => {
    await delay(1)
    this.group.removeAll()
    const p1 = this.renderOutterCircle()
    const p2 = this.renderMap()
    const p3 = this.renderRects()
    // this.exportChart()
    Promise.all([p1,p2,p3]).then(res => {
      this.exportChart()
    })
  }
  // 绘制Map点
  renderMap = async () => {
    await delay(1)
    const { singleMapColors } = this.state
    const { selectedBar } = this.props
    const { mapData } = this.props
    const existBar = selectedBar.length > 0
    if (_.isEmpty(mapData)) return
    for (const mb in mapData.defectInfos) {
      for (const ob in mapData.defectInfos[mb]) {
        if (existBar && selectedBar.includes(`${mb}-${ob}`)) continue
        if (!singleMapColors[ob]) singleMapColors[ob] = '#' + getColor(ob)
        for (const coo in mapData.defectInfos[mb][ob]) {
          let [x, y] = coo.split(',')
          // 同一个坐标下 只绘制一次点
          let Point = null
          Point = new zrender.Circle({ shape: { cx: +x, cy: +y, r: 2 }, style: { fill: singleMapColors[ob] } })
          if (Point) {
            this.group.add(Point)
          }
        }
      }
    }
  }

  //画外层大圆
  renderOutterCircle = () => {
    const circle = new zrender.Circle({
      shape: { cx: 200, cy: 200, r: 200 },
      style: { fill: 'none', stroke: '#f00' }
    })
    this.group.add(circle)
    this.zr.add(this.group)
  }
  // 渲染方格
  renderRects = async () => {
    const { mapData } = this.props
    // 单个方格宽度、单个方格高度、有效方格数据、填充方格数据
    if(_.isEmpty(mapData)) return 
    const { dieWidth: width, dieHeight: height, dies=[], noScanDies=[] } = mapData
    dies.forEach(({ x, y }) => {
      let boundingRect = null
      boundingRect = new zrender.Rect({ shape: { x, y, width, height }, style: { fill: 'none', stroke: '#14f1ff' } })
      this.group.add(boundingRect)
    })
    // 填充方格渲染
    if (noScanDies) {
      noScanDies.forEach(({ x, y }) => {
        let boundingRect = new zrender.Rect({
          shape: { x, y, width, height },
          style: { fill: '#eee', stroke: '#ccc' }
        })
        this.group.add(boundingRect)
      })
    }
    this.zr.add(this.group)
  }

  exportChart = () => {
    if(this.zr.dom.querySelector('canvas')) {
      this.props.emitUrl({ map: this.zr.dom.querySelector('canvas').toDataURL() })
    }
  }
  
  render() {
    this.onMapInit()
    return (
      <div style={{height: '402px',width: '402px', borderWidth: 0, border: '1px solid #ccc'}} ref={`map`}></div>
    )
  }
}

export default Map