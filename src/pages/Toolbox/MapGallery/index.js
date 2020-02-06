/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Pagination, Radio, Checkbox, Button, Modal, Input, InputNumber, Upload, Icon, message } from 'antd'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import _ from 'lodash'
import zrender from 'zrender'
import Heatmap from 'heatmap.js'
// import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
// import { changeForm, changeItems } from './action'
// import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'
// import reducer from './reducer'
import { getFilters, getMap, getStack, downloadCSV, getNewMap, getNewStack } from './service'
import { StyleMapGallery, StyleWaferMapGroup, StyleWaferMap } from './style'
import { changeWaferSelected } from '@/utils/action'
import CommonDrawer from '@/components/CommonDrawer'

const defectClassList = [
  ['mb', 'mbs'],
  ['adc', 'adc'],
  ['rb', 'rbs']
]
const groupByList = [
  ['Product ID', 'product_id'],
  ['Step ID', 'step_id'],
  ['Inspector', 'eqp_id'],
  ['Scan Time', 'scan_tm']
]
let drawer = null

class MapGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      galleryType: 'Die Stack', // 当前选中的类型
      galleryTypes: ['Map', 'Die Stack', 'Reticle Stack', 'Heat Map'], // 4种类型列表
      waferListGroup: {},
      // 右侧各种过滤条件
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
      group: {
        fileId: '',
        by: []
      },
      selected: [],
      selectedAndKey: {},
      redisCache: [],
      // rotation
      degrees: 0, // 角度 输入框
      rotationVisible: false, // 旋转弹出层是否显示
      total: 0,
      pageSize: 10,
      pageNo: 1
    }
  }

  async componentDidMount() {
    const { filters } = this.props
    this.setState({ tags: filters })
    this.onFilterOrGroup()
  }

  getFormData = isDelete => {
    const { items, itemSelected } = this.props
    const { tagsSeleted, selected, adderFlag, pageNo, pageSize, group, defectSize } = this.state
    const data = {
      waferList: [],
      filter: {
        defectType: {
          rb: tagsSeleted.rbs,
          adc: tagsSeleted.adc,
          mb: tagsSeleted.mbs
        },
        testId: tagsSeleted.tests,
        cluster: tagsSeleted.clusterIds,
        adder: adderFlag ? ['Y'] : ['N'],
        repeater: tagsSeleted.repeaterIds,
        zoneId: tagsSeleted.zoneIds,
        subDie: tagsSeleted.subDieIds,
      },
      pageNumber: pageNo,
      pageSize,
      groupExcelRedisKey: group.fileId,
      groupList: group.by,
      deleteIds: isDelete ? selected : [],
      comboBoxes: items.map((item, index) => ({
        key: item,
        value: itemSelected[index] || []
      }))
    }
    if (defectSize[0] === '') defectSize[0] = 0
    if (defectSize[1] === '') defectSize[1] = 1
    const num1 = parseFloat(defectSize[0])
    const num2 = parseFloat(defectSize[1])
    data.defectSize = [Math.min(num1, num2), Math.max(num1, num2)]
    return data
  }

  // Drawer
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

  onFilterOrGroup = async isDelete => {
    if (!isDelete) drawer.onClose()
    const { map, fullMap, defectCount, totalCount } = await this.loadFilters(isDelete)
    console.log('defectCount: ', defectCount)
    const { pageSize } = this.state
    // 清空并且重建缓存
    const redisCache = []
    // 计算多少页，缓存
    const pages = Math.ceil(totalCount / pageSize)
    redisCache.length = pages
    redisCache[0] = { map, fullMap }
    this.setState({
      total: totalCount || 0,
      pageNo: 1,
      redisCache
    })
    // 重新filter or group 重新加载第一页数据
    this.onGalleryTypeChange()
  }

  // 切换显示类型
  onGalleryTypeChange = async e => {
    if (e) {
      this.setState({ galleryType: e.target.value })
      await delay(1)
    }
    const { galleryType } = this.state
    // 当前页 一定有缓存，不用判断为空
    if (galleryType === 'Map' || galleryType === 'Heat Map') this.loadMap()
    else if (galleryType === 'Die Stack') this.loadStack(true)
    else if (galleryType === 'Reticle Stack') this.loadStack()
  }

  loadMap = async () => {
    const { redisCache, pageNo } = this.state
    const map = redisCache[pageNo - 1]
    const data = this.getFormData()
    // console.log('getFormData', data)
    const res1 = await getNewMap(data)
    console.log('newMap', res1)
    const res = await getMap(map)
    if (!res.resultMap || res.resultMap === {}) {
      message.warning('No data')
      return
    }
    const waferListGroup = res.resultMap
    this.setState({ waferListGroup })
    // 完成后渲染
    await delay(1)
    const { galleryType } = this.state
    for (const key in waferListGroup) {
      if (waferListGroup[key]) {
        waferListGroup[key].forEach(wafer => {
          this.renderMap(wafer, `tab${this.props.name}-${wafer.id}`, galleryType === 'Heat Map')
        })
      }
    }
  }

  loadStack = async isDieStack => {
    const { redisCache, pageNo } = this.state
    const map = redisCache[pageNo - 1]
    const waferListGroup = await getStack(map)
    if (!waferListGroup) {
      message.warning('No data')
      return
    }
    // 完成后渲染
    this.setState({ waferListGroup })
    await delay(1)
    const { name } = this.props
    for (const key in waferListGroup) {
      if (waferListGroup[key]) {
        waferListGroup[key].forEach(wafer => {
          if (isDieStack) {
            this.rednerStack(
              `tab${name}-${wafer.id}`,
              wafer.dieWidth,
              wafer.dieHeight,
              [{ x: 0, y: 0 }],
              wafer.dieDefects
            )
          } else {
            this.rednerStack(
              `tab${name}-${wafer.id}`,
              wafer.reticleDieWidth,
              wafer.reticleDieHeight,
              wafer.reticleDice,
              wafer.reticleDefects
            )
          }
        })
      }
    }
  }

  // 绘制 die stack
  rednerStack = (containerId, dieWidth, dieHeight, dies, defects) => {
    const container = document.getElementById(containerId)
    if (!container) return
    const zr = zrender.init(container)
    const group = new zrender.Group()
    this.renderPoints(group, defects)
    this.renderDies(group, dieWidth, dieHeight, dies)
    zr.add(group)
  }

  /**
   * 绘制 map
   * @param {Object} wafer
   * @param {String} containerId
   * @param {Boolean} isHeatMap 是否绘制热力图
   * 1、dom实例
   * 2、初始化zrender与group
   * 3、绘制 dies、 noScanDies
   * 4、旋转重新渲染canvas 会超出父级dom，需要重新设置圆角
   */
  renderMap = async (wafer = {}, containerId, isHeatMap, time = 0) => {
    const container = document.getElementById(containerId)
    if (!container) {
      if (time > 1000) {
        console.log('container not found')
        return
      }
      await delay(10)
      this.renderMap(wafer, containerId, isHeatMap, time + 10)
      return
    }
    if (time > 0) console.log(`Wait for ${time}ms.`)
    const { dies, noScan, points, dieDefects, dieWidth, dieHeight } = wafer
    const zr = zrender.init(container)
    const group = new zrender.Group()
    // dies & noScanDies
    this.renderDies(group, dieWidth, dieHeight, dies, noScan)
    if (isHeatMap) this.renderHeatmap(container, points)
    else this.renderPoints(group, dieDefects)
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

  /**
   * 绘制热力图
   * @param {Node} container
   * @param {Array} points
   */
  renderHeatmap = (container, points) => {
    if (!points) return
    const data = []
    let max = 0
    let min = 9999
    for (const key in points) {
      const location = key.split(',')
      const value = points[key]
      min = Math.min(min, value)
      max = Math.max(max, value)
      data.push({
        x: location[0],
        y: location[1],
        value
      })
    }
    const config = {
      container,
      // backgroundColor: 'transparent',
      // opacity: 0.1,
      // onExtremaChange(a, b) {
      //   console.log('onExtremaChange: ', a, b)
      // },
      maxOpacity: 1,
      minOpacity: 0.1,
      blur: 1,
      radius: 20
    }
    const heatmapInstance = Heatmap.create(config)
    heatmapInstance.setData({
      min,
      max,
      data
    })
    container.childNodes[1].style.borderRadius = '50%'
  }

  loadFilters = async isDelete => {
    const { items, itemSelected } = this.props
    const { tagsSeleted, selected, adderFlag, pageNo, pageSize, group, defectSize } = this.state
    const data = {
      ...tagsSeleted,
      adderFlag: adderFlag ? ['Y'] : ['N'],
      deleteIds: isDelete ? selected : [],
      pageNumber: pageNo,
      pageSize,
      groupExcelRedisKey: group.fileId,
      groupList: group.by,
      comboBoxes: items.map((item, index) => ({
        key: item,
        value: itemSelected[index] || []
      }))
    }
    if (defectSize[0] === '') defectSize[0] = 0
    if (defectSize[1] === '') defectSize[1] = 1
    const num1 = parseFloat(defectSize[0])
    const num2 = parseFloat(defectSize[1])
    data.defectSize = [Math.min(num1, num2), Math.max(num1, num2)]
    const res = await getFilters(data)
    return res
  }

  onGroupChange = (key, value) => {
    const { group } = this.state
    group[key] = value
    this.setState({ group })
  }

  onFileUpload = info => {
    if (info.file.status === 'removed') {
      const { group } = this.state
      group.fileId = ''
      this.setState({ group })
      return
    }
    if (info.file.status !== 'uploading') {
      const fileId = info.file.response.data
      const { group } = this.state
      group.fileId = fileId
      this.setState({ group })
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  onPageChange = async pageNo => {
    this.setState({ pageNo })
    // 等待页码变化
    await delay(1)
    const { redisCache } = this.state
    if (!redisCache[pageNo - 1]) {
      const { map, fullMap } = await this.loadFilters()
      redisCache[pageNo - 1] = { map, fullMap }
    }
    this.onGalleryTypeChange()
  }

  // 点击选择
  onWaferSelect = wafer => {
    const { waferSelected, name } = this.props
    let { selected, selectedAndKey } = this.state
    let wafers = waferSelected[name].wafers || []
    if (selected.includes(wafer.id)) {
      selected = _.remove(selected, n => wafer.id !== n)
      wafers = _.remove(wafers, w => `${w.lotId}|${w.waferNo}|${w.productId}|${w.stepId}|${w.scanTm}` !== wafer.id)
      selectedAndKey = _.omit(selectedAndKey, [wafer.id])
    } else {
      selected.push(wafer.id)
      const { lotId, stepId, waferNo, productId, scanTm, defectIdRedisKey } = wafer
      wafers.push({
        lotId,
        stepId,
        waferNo,
        productId,
        scanTm,
        defects: [],
        defectIdRedisKey
      })
      selectedAndKey[wafer.id] = defectIdRedisKey
    }
    this.setState({ selected, selectedAndKey })
    // 同步缓存到store
    this.props.changeWaferSelected({
      page: name,
      wafers,
      selectedBar: []
    })
  }

  onWaferRotate = () => {
    const { selected, waferListGroup, degrees } = this.state
    for (const key in waferListGroup) {
      waferListGroup[key].forEach(item => {
        if (selected.includes(item.id)) item.degrees = degrees
      })
    }
    this.setState({
      rotationVisible: false,
      waferListGroup
    })
  }

  onExportCSV = () => {
    const { waferSelectedAndKey } = this.state
    downloadCSV({ paretoExportId: waferSelectedAndKey })
  }

  onRotationClick = () => {
    const { selected } = this.state
    if (selected.length > 0) this.setState({ rotationVisible: true })
    else message.warning('Please select wafer')
  }
  
  onSeletedReset = () => {
    const { name } = this.props
    this.setState({ selected: [] })
    this.props.changeWaferSelected({
      page: name,
      wafers: [],
      selectedBar: []
    })
  }

  onSeletedRemove = async () => {
    const { selected } = this.state
    if (selected.length === 0) {
      message.warning('Please select wafer')
      return
    }
    const { pageSize } = this.state
    const { map, fullMap, defectCount, totalCount } = await this.loadFilters('remove')
    console.log('defectCount: ', defectCount)
    const redisCache = []
    const pages = Math.ceil(totalCount / pageSize)
    redisCache.length = pages
    redisCache[0] = { map, fullMap }
    this.setState({
      total: totalCount,
      redisCache,
      selected: [],
      pageNo: 1
    })
    this.onGalleryTypeChange()
  }

  render() {
    const { name } = this.props
    const {
      galleryType,
      galleryTypes,
      waferListGroup,
      tags,
      defectClass,
      total,
      pageSize,
      selected,
      rotationVisible,
      pageNo
    } = this.state

    return (
      <StyleMapGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label={`Gallery Type:`} onChange={this.onGalleryTypeChange}>
            <Radio.Group defaultValue={galleryType}>
              {galleryTypes.map(t => (
                <Radio key={t} value={t}>
                  {t}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label='Action:'>
            <Button type='primary' onClick={this.onRotationClick}>Rotation</Button>
            <Button type='primary' onClick={this.onExportCSV}>Export to CSV</Button>
            <Button type='danger' onClick={this.onSeletedRemove}>Remove</Button>
            <Button type='dashed' onClick={this.onSeletedReset}>Reset</Button>
          </Form.Item>
        </Form>
        <StyleWaferMapGroup>
          {Object.keys(waferListGroup).map(group => (
            <div key={group}>
              <h4>{group}</h4>
              <StyleWaferMap>
                {waferListGroup[group].map(wafer => (
                  <li key={wafer.id} className={selected.includes(wafer.id) ? 'selected' : ''} onClick={() => this.onWaferSelect(wafer)}>
                    <div
                      id={`tab${name}-${wafer.id}`}
                      className={`wafer ${galleryType === 'Map' || galleryType === 'Heat Map' ? 'radius' : ''}`}
                      style={wafer.degrees > 0 ? { transform: `rotate(${wafer.degrees}deg)` } : {}}
                    />
                    <p>Lot ID: {wafer.lotId}</p>
                    <p>Wafer No: {wafer.waferNo}</p>
                    <p>Step ID: {wafer.stepId}</p>
                    <p>Total: {wafer.dieDefects ? wafer.dieDefects.length : 0}</p>
                  </li>
                ))}
              </StyleWaferMap>
            </div>
          ))}
        </StyleWaferMapGroup>
        <Pagination total={total} showTotal={t => `Total: ${t}`} pageSize={pageSize} defaultCurrent={pageNo} onChange={this.onPageChange} style={{ width: 960 }} />
        <CommonDrawer ref={r => (drawer = r)} width={500}>
          <section>
            <h3>Filter</h3>
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Defect class:'>
                <Radio.Group onChange={this.onDefectClassChange}>
                  {defectClassList.map(t => (
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
                <Button type='primary' onClick={this.onFilterOrGroup}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </section>
          <section>
            <h3 style={{ width: 110 }}>Group View</h3>
            <Form layout='vertical'  labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Group by:'>
                <Checkbox.Group onChange={v => this.onGroupChange('by', v)}>
                  {groupByList.map(t => (
                    <Checkbox className='ant-checkbox-group-item' key={t[1]} value={t[1]}>
                      {t[0]}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item label='Upload file:'>
                <Upload name='file' action='export_excel/gallery_map_group' onChange={this.onFileUpload}>
                  <Button>
                    <Icon type='upload' /> Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item label=' ' style={{ textAlign: 'right' }}>
                <Button type='primary' onClick={this.onFilterOrGroup}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </section>
        </CommonDrawer>

        <Modal
          title='旋转角度'
          visible={rotationVisible}
          onOk={this.onWaferRotate}
          onCancel={() => this.setState({ rotationVisible: false })}
          okText='确认'
          cancelText='取消'
        >
          <Form>
            <Form.Item>
              <Button onClick={() => this.setState({ degrees: 90 })}>90°</Button>
              <Button onClick={() => this.setState({ degrees: 180 })}>180°</Button>
              <Button onClick={() => this.setState({ degrees: 270 })}>270°</Button>
            </Form.Item>
            <Form.Item>
              <InputNumber min={0} max={360} onChange={degrees => this.setState({ degrees })} />
            </Form.Item>
          </Form>
        </Modal>

      </StyleMapGallery>
    )
  }
}

// injectReducer('MapGallery', reducer)
const mapStateToProps = state => ({
  ...state.Init,
  ...state.DataQuery
})
const mapDispatchToProps = {
  changeWaferSelected
}
export default connect(mapStateToProps, mapDispatchToProps)(MapGallery)
