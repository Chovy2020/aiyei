import React from 'react'
import { connect } from 'react-redux'
import { Form, Pagination, Radio, Checkbox, Button, Modal, Input, InputNumber, Upload, Icon, message } from 'antd'
import _ from 'lodash'
import zrender from 'zrender'
import Heatmap from 'heatmap.js'
import { injectReducer } from '@/utils/store'
import { delay, waferToId } from '@/utils/web'
import { changeMapSelected, changeMapWafers } from './action'
import { DEFECT_CLASS_LIST, GROUP_BY_LIST, YES_NO } from './constant'
import reducer from './reducer'
import { downloadCSV, getNewMap, getNewStack } from './service'
import { StyleMapGallery, StyleWaferMapGroup, StyleWaferMap, StyleExistImages } from './style'
import CommonDrawer from '@/components/CommonDrawer'

let drawer = null

class MapGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      galleryType: 'Map', // 当前选中的类型
      galleryTypes: ['Map', 'Die Stack', 'Reticle Stack', 'Heat Map'], // 4种类型列表
      waferListGroup: {},
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
      group: {
        fileId: '',
        by: []
      },
      selected: [],
      deleteIds: [],
      redisCache: [],
      // rotation
      degrees: 0, // 角度 输入框
      rotationVisible: false, // 旋转弹出层是否显示
      total: 0,
      pageSize: 30,
      pageNo: 1
    }
  }
  // 从store取出当前页的selected
  getSelected = () => {
    const { mapSelected, name } = this.props
    return mapSelected[name] || []
  }
  // 从store取出当前页的wafers
  getWafers = () => {
    const { mapWafers, name } = this.props
    return mapWafers[name] || []
  }

  componentDidMount() {
    // 从store里取出 dataQuery查询的filterOption
    const { filterOption } = this.props
    this.setState({ filterOption })
    // 将页面传递的wafers(or bars) 存储在当前页面，后续该页面addTab需要使用(当前页面无选择操作，追溯前一个页面的wafers)
    const { wafers, name } = this.props
    this.props.changeMapWafers({ name, wafers })
    this.loadMapOrStack()
  }
  // 组合查询条件：galleryType、pagination、filter、groupBy
  getFilter = isDelete => {
    const { items, itemSelected, name } = this.props
    const { filter, selected, pageNo, pageSize, group, defectSize } = this.state
    let { deleteIds } = this.state
    if (isDelete) deleteIds = [...deleteIds, ...selected]
    const waferList = this.getWafers()
    let existDefects = false
    if (waferList.length > 0) {
      waferList.forEach(wafer => {
        wafer.defectList = wafer.defects
      })
      waferList.forEach(wafer => {
        if (wafer.defects.length > 0) existDefects = true
      })
    }
    const data = {
      waferList,
      selectAction: existDefects ? 'hold' : '',
      filter,
      pageNumber: pageNo,
      pageSize,
      groupExcelRedisKey: group.fileId,
      groupList: group.by,
      deleteIds,
      comboBoxes: items.map((item, index) => ({
        key: item,
        value: itemSelected[index] || []
      }))
    }
    if (defectSize[0] === '') defectSize[0] = 0
    if (defectSize[1] === '') defectSize[1] = 9999
    const num1 = parseFloat(defectSize[0])
    const num2 = parseFloat(defectSize[1])
    data.filter.defectSize = [`${Math.min(num1, num2)},${Math.max(num1, num2)}`]
    if (isDelete) {
      this.setState({ selected: [], deleteIds })
      this.props.changeMapSelected({ name, selected: [] })
    }
    return data
  }
  // Drawer
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
  // 侧边栏 筛选 或 排序, 初始化页码 清空当前选中
  onFilterOrGroup = () => {
    if (drawer) drawer.onClose()
    this.onSeletedReset()
  }
  // 切换显示类型
  onGalleryTypeChange = galleryType => {
    this.setState({ galleryType })
    this.loadMapOrStack()
  }
  // 切换分页
  onPageChange = async pageNo => {
    this.setState({ pageNo })
    this.loadMapOrStack()
  }
  // 重新加载页面数据
  loadMapOrStack = async isDelete => {
    await delay(1)
    const { galleryType } = this.state
    if (galleryType === 'Map' || galleryType === 'Heat Map') this.loadMap(isDelete)
    else if (galleryType === 'Die Stack') this.loadStack('Die Stack', isDelete)
    else if (galleryType === 'Reticle Stack') this.loadStack('Reticle Stack', isDelete)
  }
  // Map 或 Heat Map
  loadMap = async isDelete => {
    const res = await getNewMap(this.getFilter(isDelete))
    if (!res || !res.map || res.map === {}) {
      message.warning('No data')
      return
    }
    const waferListGroup = res.map
    const { galleryType } = this.state
    this.setState({ waferListGroup, total: res.totalCount })
    // 完成后渲染
    for (const key in waferListGroup) {
      if (waferListGroup[key]) {
        waferListGroup[key].forEach(wafer => {
          this.renderMap(wafer, `tab${this.props.name}-${wafer.id}`, galleryType === 'Heat Map')
        })
      }
    }
  }
  // Die Stack 或 Reticle Stack
  loadStack = async (stackType, isDelete) => {
    const res = await getNewStack(this.getFilter(isDelete))
    if (!res || !res.stackMap || res.stackMap === {}) {
      message.warning('No data')
      return
    }
    const waferListGroup = res.stackMap
    // 完成后渲染
    this.setState({ waferListGroup, total: res.totalCount })
    const { name } = this.props
    for (const key in waferListGroup) {
      if (waferListGroup[key]) {
        waferListGroup[key].forEach(wafer => {
          if (stackType === 'Die Stack') {
            this.rednerStack(
              `tab${name}-${wafer.id}`,
              wafer.dieWidth,
              wafer.dieHeight,
              [{ x: 0, y: 0 }],
              wafer.dieDefects
            )
          }
          if (stackType === 'Reticle Stack') {
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
      message.error(`${info.file.name} file upload failed`)
    }
  }

  /**
   * 点击选择、反选、连选
   * @param {Object} wafer 点击选择的wafer对象
   * @param {String} group 分组名
   */
  onWaferSelect = (wafer, group) => {
    const next = `${wafer.id}|${group}`
    const { mapSelected, name, shiftMultipleMode } = this.props
    let { selected } = this.state
    let wafers = mapSelected[name] || []
    // 反选直接走普通模式
    // console.log('shiftMultipleMode', shiftMultipleMode)
    if (shiftMultipleMode && !selected.includes(next)) {
      // 筛选出当前组内 已经选中的数量
      const currentSelected = selected.filter(item => {
        const infos = item.split('|')
        return group === infos[infos.length - 1]
      })
      // 如果当前组内 已选择为0  直接选中
      if (currentSelected.length === 0) {
        selected.push(next)
        const { lotId, stepId, waferNo, productId, scanTm, defectCache } = wafer
        wafers.push({
          lotId,
          stepId,
          waferNo,
          productId,
          scanTm,
          defects: [],
          defectCache
        })
      } else {
        // 连选 - 当前组内 已经选中的最后一个元素。数组有序，上一次选中添加在最后
        const prev = currentSelected[currentSelected.length - 1]
        // 计算下标  比较出正序连选、反序连选
        let lastIndex = 0
        let nextIndex = 0
        const { waferListGroup } = this.state
        const currentGroup = waferListGroup[group]
        for (const i in currentGroup) {
          const temp = `${currentGroup[i].id}|${group}`
          if (temp === prev) lastIndex = parseInt(i)
          if (temp === next) nextIndex = parseInt(i)
        }
        // console.log('currentGroup', currentGroup.length, 'lastIndex', lastIndex, 'nextIndex', nextIndex)
        for (const i in currentGroup) {
          const temp = `${currentGroup[i].id}|${group}`
          if (
            (nextIndex > lastIndex && i > lastIndex && i <= nextIndex) ||
            (nextIndex < lastIndex && i >= nextIndex && i < lastIndex)
          ) {
            const { lotId, stepId, waferNo, productId, scanTm, defectCache } = currentGroup[i]
            selected.push(temp)
            wafers.push({
              lotId,
              stepId,
              waferNo,
              productId,
              scanTm,
              defects: [],
              defectCache
            })
          }
        }
      }
    } else {
      // 普通选择
      if (selected.includes(next)) {
        selected = _.remove(selected, n => next !== n)
        wafers = _.remove(wafers, w => waferToId(w) !== next)
      } else {
        selected.push(next)
        const { lotId, stepId, waferNo, productId, scanTm, defectCache } = wafer
        wafers.push({
          lotId,
          stepId,
          waferNo,
          productId,
          scanTm,
          defects: [],
          defectCache
        })
      }
    }
    this.setState({ selected })
    this.props.changeMapSelected({ name, selected: wafers })
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
    const { mapSelected, name } = this.props
    let waferList = mapSelected[name] || []
    // 检查 defectCache 不能为空
    waferList = waferList.filter(wafer => wafer.defectCache && wafer.defectCache !== '')
    downloadCSV({ waferList })
  }

  onRotationClick = () => {
    const { selected } = this.state
    if (selected.length > 0) this.setState({ rotationVisible: true })
    else message.warning('Please select wafers first')
  }

  onSeletedReset = () => {
    this.setState({
      pageNo: 1,
      selected: [],
      deleteIds: []
    })
    const { name } = this.props
    this.props.changeMapSelected({ name, selected: [] })
    this.loadMapOrStack()
  }

  onSeletedRemove = async () => {
    const { selected } = this.state
    if (selected.length === 0) {
      message.warning('Please select wafers first')
      return
    }
    this.loadMapOrStack(true)
  }

  render() {
    const { name } = this.props
    const {
      galleryType,
      galleryTypes,
      waferListGroup,
      filterOption,
      filter,
      defectClass,
      total,
      pageSize,
      selected,
      rotationVisible,
      defectSize,
      pageNo
    } = this.state

    return (
      <StyleMapGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label={`Gallery Type:`} onChange={e => this.onGalleryTypeChange(e.target.value)}>
            <Radio.Group defaultValue={galleryType}>
              {galleryTypes.map(t => (
                <Radio key={t} value={t}>
                  {t}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label='Action:'>
            <Button size='small' type='primary' onClick={this.onRotationClick}>
              Rotation
            </Button>
            <Button size='small' type='primary' onClick={this.onExportCSV}>
              Export to CSV
            </Button>
            <Button size='small' type='danger' onClick={this.onSeletedRemove}>
              Remove
            </Button>
            <Button size='small' type='dashed' onClick={this.onSeletedReset}>
              Reset {selected.length > 0 ? `【${selected.length}】` : ''}
            </Button>
          </Form.Item>
        </Form>
        <StyleWaferMapGroup>
          {Object.keys(waferListGroup).map(group => (
            <div key={group}>
              <h4>{group}</h4>
              <StyleWaferMap>
                {waferListGroup[group].map(wafer => (
                  <li
                    key={wafer.id}
                    className={selected.includes(`${wafer.id}|${group}`) ? 'selected' : ''}
                    onClick={() => this.onWaferSelect(wafer, group)}
                  >
                    <div
                      id={`tab${name}-${wafer.id}`}
                      className={`wafer ${galleryType === 'Map' || galleryType === 'Heat Map' ? 'radius' : ''}`}
                      style={wafer.degrees > 0 ? { transform: `rotate(${wafer.degrees}deg)` } : {}}
                    />
                    {wafer.existImages ? <StyleExistImages /> : null}
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
        <Pagination
          size='small'
          total={total}
          showTotal={t => `Total: ${t}`}
          pageSize={pageSize}
          current={pageNo}
          onChange={this.onPageChange}
          style={{ width: 960 }}
        />
        <CommonDrawer ref={r => (drawer = r)} width={500}>
          <section>
            <h3>Filtes</h3>
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Defect Class:'>
                <Radio.Group onChange={this.onDefectClassChange}>
                  {DEFECT_CLASS_LIST.map(o => (
                    <Radio key={o[0]} value={o[0]}>
                      {o[1]}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              {defectClass ? (
                <Form.Item label=' '>
                  <Checkbox.Group
                    value={filter[defectClass]}
                    options={filterOption[defectClass]}
                    onChange={this.onDefectClassDetailChange}
                  />
                </Form.Item>
              ) : null}
              <Form.Item label='Defect Size:'>
                <Input
                  style={{ width: 60 }}
                  defaultValue={defectSize[0]}
                  onChange={e => this.onDefectSizeChange(0, e.target.value)}
                  size='small'
                />
                -
                <Input
                  style={{ width: 60 }}
                  defaultValue={defectSize[1]}
                  onChange={e => this.onDefectSizeChange(1, e.target.value)}
                  size='small'
                />
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
                <Checkbox.Group options={filterOption.zoneId} onChange={v => this.onDefectFiltersChange('zoneId', v)} />
              </Form.Item>
              <Form.Item label='Sub Die:'>
                <Checkbox.Group options={filterOption.subDie} onChange={v => this.onDefectFiltersChange('subDie', v)} />
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
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Group By:'>
                <Checkbox.Group onChange={v => this.onGroupChange('by', v)}>
                  {GROUP_BY_LIST.map(t => (
                    <Checkbox className='ant-checkbox-group-item' key={t[1]} value={t[1]}>
                      {t[0]}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item label='Upload File:'>
                <Upload name='file' action='api/export_excel/gallery_map_group' onChange={this.onFileUpload}>
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

injectReducer('MapGallery', reducer)
const mapStateToProps = state => ({
  ...state.Init,
  ...state.DataQuery,
  ...state.MapGallery
})
const mapDispatchToProps = {
  changeMapSelected,
  changeMapWafers
}
export default connect(mapStateToProps, mapDispatchToProps)(MapGallery)
