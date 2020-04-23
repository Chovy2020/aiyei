import React from 'react'
import { Pagination } from 'antd'
import _ from 'lodash'
import zrender from 'zrender'
import { delay } from '@/utils/web'
import { StyleMapGallery, StyleWaferMapGroup, StyleWaferMap, StyleExistImages } from '../../Toolbox/MapGallery/style'

class MoreMap extends React.Component {
  constructor(props) {
    super(props)
    this.waferListGroup = []
    this.total = 0
    this.state = {
      pageSize: 10,
      pageNo: 1
    }
  }
 
  componentDidMount() {
    this.loadMap()
  }
  // 切换分页
  onPageChange = async pageNo => {
    this.setState({ pageNo })
    this.loadMap()
  }
  // Map 
  loadMap = () => {
    const waferListGroup = this.props.moreMapData
    this.waferListGroup = waferListGroup
    this.total = waferListGroup.length
    waferListGroup.forEach((wafer, index) => {
      this.renderMap(wafer, `tab-${index}`)
    })
  }

  /**
   * 绘制 map
   * @param {Object} wafer
   * @param {String} containerId
   * 1、dom实例
   * 2、初始化zrender与group
   * 3、绘制 dies、 noScanDies
   * 4、旋转重新渲染canvas 会超出父级dom，需要重新设置圆角
   */
  renderMap = async (wafer = {}, containerId, time = 0) => {
    const container = document.getElementById(containerId)
    if (!container) {
      if (time > 1000) {
        console.log('container not found')
        return
      }
      await delay(10)
      this.renderMap(wafer, containerId, time + 10)
      return
    }
    if (time > 0) console.log(`Wait for ${time}ms.`)
    const { dies, noScan, points, dieDefects, dieWidth, dieHeight } = wafer
    const zr = zrender.init(container)
    const group = new zrender.Group()
    // dies & noScanDies
    this.renderDies(group, dieWidth, dieHeight, dies, noScan)
    this.renderPoints(group, dieDefects)
    zr.add(group)
    // canvas创建有延时
    await delay(1)
    if (container.childNodes[0] && container.childNodes[0].childNodes[0]) {
      container.childNodes[0].childNodes[0].style.borderRadius = '50%'
    }
  }

  /**
   * 绘制 dies、 noScanDies
   * @param {Object} group
   * @param {Array} dies
   * @param {Array} noScan
   */
  renderDies = (group, width, height, dies, noScan) => {
    // dies
    if (dies) {
      dies.forEach(item => {
        const boundingRect = new zrender.Rect({
          shape: {
            x: item.x,
            y: item.y,
            width,
            height
          },
          style: {
            fill: 'none',
            stroke: '#ddd',
            lineWidth: 1,
            strokeNoScale: true
          }
        })
        group.add(boundingRect)
      })
    }
    // noScan
    if (noScan) {
      noScan.forEach(item => {
        const boundingRect = new zrender.Rect({
          shape: {
            x: item.x,
            y: item.y,
            width,
            height
          },
          style: {
            fill: 'none',
            stroke: '#f1f1f1',
            lineWidth: 1,
            strokeNoScale: true
          }
        })
        group.add(boundingRect)
      })
    }
  }

  /**
   * 绘制 点
   * @param {Object} group
   * @param {Array} dieDefects
   */
  renderPoints = (group, dieDefects) => {
    if (dieDefects) {
      dieDefects.forEach(item => {
        const point = new zrender.Circle({
          shape: {
            cx: item.x,
            cy: item.y,
            r: 1
          },
          style: { fill: '#f00' }
        })
        group.add(point)
      })
    }
  }

  render() {
    this.loadMap()
    const {
      pageSize,
      pageNo
    } = this.state

    return (
      <StyleMapGallery>
        <StyleWaferMapGroup>
          <StyleWaferMap>
            {this.waferListGroup.map((wafer, index) => (
              <li key={index}>
                <div
                  id={`tab-${index}`}
                  className={`wafer radius`}
                />
                {wafer.existImages ? <StyleExistImages /> : null}
                <p>Lot ID: {wafer.lotId}</p>
                <p>Wafer No: {wafer.waferNo}</p>
                <p>Step ID: {wafer.stepId}</p>
              </li>
            ))}
          </StyleWaferMap>
        </StyleWaferMapGroup>
        <Pagination
          size='small'
          total={this.total}
          showTotal={t => `Total: ${t}`}
          pageSize={pageSize}
          current={pageNo}
          onChange={this.onPageChange}
        />
      </StyleMapGallery>
    )
  }
}

export default MoreMap
