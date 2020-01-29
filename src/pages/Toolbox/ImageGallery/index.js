/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Select, Pagination, Radio, Checkbox, Button, Input, Upload, Icon, message } from 'antd'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import _ from 'lodash'
// import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
// import { changeForm, changeItems } from './action'
// import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'
// import reducer from './reducer'
import { getClassCodes, getViewFilters, getImages, updateDefectGroup } from './service'
import { StyleImageGallery, StyleImages } from './style'
import CommonDrawer from '@/components/CommonDrawer'
import { getWaferSelected } from '@/utils/store'

const layoutSize = [3, 4, 5]
const getLotId = waferId => waferId.split('|')[0]
const getWaferNo = waferId => waferId.split('|')[3]
const getDefectId = waferId => waferId.split('|')[5]
const getEquipId = waferId => waferId.split('|')[6]
let drawer = null

class ImageGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      waferSelected: [], // 从MapGallery选中的wafer列表
      layout: {
        num1: 3,
        num2: 3,
      },
      showLabel: true,
      categoryTypes: [
        ['Manual Bin', 'mb'],
        ['Rough Bin', 'rb'],
        ['ADC Bin', 'adc']
      ],
      categoryType: 'mb',
      classCodes: [], // ！通过接口获取
      classCode: '',
      viewGroups: [
        ['Manual Bin', 'mb'],
        ['Rough Bin', 'rb'],
        ['ADC Bin', 'adc'],
        ['Lot ID', 'lotId'],
        ['Wafer ID', 'waferId'],
        ['Step ID', 'stepId'],
        ['Product ID', 'productId'],
        ['scan time', 'scanTm'],
        ['review time', 'reviewTm']
      ],
      viewGroup: '',
      viewFilters: [], // ！通过接口获取
      viewFilter: [],
      images: [],
      currentImages: [],
      selected: [],
      total: 0,
      pageNo: 1
    }
  }

  async componentDidMount() {
    await this.loadClassCodes()
    await this.loadImages()
    this.loadViewFilters()
  }

  loadClassCodes = async () => {
    const classCodes = await getClassCodes()
    this.setState({ classCodes })
  }
  loadViewFilters = async () => {
    const { wafers, bars } = getWaferSelected()
    let viewFilters = await getViewFilters({ imageInfo: wafers, bars })
    viewFilters = viewFilters.map(item => `${item}`)
    this.setState({ viewFilters })
  }
  // 获取图片链接的列表 + 过滤
  loadImages = async () => {
    await delay(1)
    const { viewGroup, viewFilter } = this.state
    const { wafers, bars } = getWaferSelected()
    console.log(wafers.length)
    if (wafers.length === 0) return
    const data = {
      imageGroupBy: viewGroup,
      mbFilter: viewFilter.map(item => parseInt(item)),
      imageInfo: wafers,
      singleGalleryFlag: 'galleryMap'
    }
    const res = await getImages(data)
    const images = []
    for (const id in res)
      for (const url of res[id])
        images.push({
          url,
          id
        })
    this.setState({ images, total: images.length || 0 })
    // 默认显示第一页的图片
    this.generateImages()
  }

  onLayoutChange = (key, value) => {
    const { layout } = this.state
    layout[key] = value
    this.setState({ layout })
    this.generateImages()
  }

  onPageSizeChange = pageNo => {
    this.setState({ pageNo })
    this.generateImages()
  }

  generateImages = async () => {
    await delay(1)
    const { layout, pageNo, images  } = this.state
    const pageSize = layout.num1 * layout.num2
    const currentImages = images.filter((img, index) => index >= pageSize * (pageNo - 1) && index < pageSize * pageNo)
    this.setState({ currentImages })
  }

  onSelect = id => {
    let { selected } = this.state
    if (selected.includes(id)) {
      selected = _.remove(selected, n => id !== n)
    } else {
      selected.push(id)
    }
    this.setState({ selected })
  }

  onFormSubmit = async () => {
    const { selected, categoryType, classCode } = this.state
    if (selected.length === 0) {
      message.warning('Please select image')
      return
    }
    await updateDefectGroup({
      idList: selected,
      type: categoryType,
      code: classCode
    })
    message.success('Classification success')
    this.setState({ selected: [] })
    // 重新拉取图片列表
    await this.loadImages()
    this.loadViewFilters()
  }

  onDefectClassChange = () => {}

  onFilterSubmit = () => {
    drawer.onClose()
    this.loadImages()
  }

  render() {
    // const { name } = this.props
    const { layout, categoryTypes, classCodes, categoryType, classCode, viewGroups, viewFilters, currentImages, total, pageNo, showLabel, selected } = this.state
    const { num1, num2 } = layout

    return (
      <StyleImageGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Layout:'>
            <Select defaultValue={num1} style={{ width: 60 }} onChange={v => this.onLayoutChange('num1', v)}>
              {layoutSize.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <span style={{ marginRight: 10 }}>X</span>
            <Select defaultValue={num2} style={{ width: 60 }} onChange={v => this.onLayoutChange('num2', v)}>
              {layoutSize.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <Checkbox onChange={e => this.setState({ showLabel: e.target.checked })} defaultChecked={showLabel}>
              Show Label
            </Checkbox>
          </Form.Item>
          <Form.Item label='Classified:'>
            <Select style={{ width: 120 }} defaultValue={categoryType} onChange={categoryType => this.setState({ categoryType })}>
              {categoryTypes.map(t => (
                <Select.Option value={t[1]} key={t[1]}>
                  {t[0]}
                </Select.Option>
              ))}
            </Select>
            <Select style={{ width: 120 }} defaultValue={classCode} onChange={classCode => this.setState({ classCode })}>
              {classCodes.map(c => (
                <Select.Option value={c.classCode} key={c.classCode}>
                  {`${c.classCode}-${c.className}`}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={this.onFormSubmit} type='primary'>
              Ok
            </Button>
            <Button onClick={() => this.setState({ selected: [] })} type='dashed'>
              Reset
            </Button>
          </Form.Item>
        </Form>

        <StyleImages className={`col${num1}`}>
          {currentImages.map((img, index) => (
            <li key={`${img.id}-${index}`} className={selected.includes(img.id) ? 'selected' : ''} onClick={() => this.onSelect(img.id)}>
            <img src={`http://161.189.50.41${img.url}`} />
            {showLabel ? (
              <div className='wafer-info'>
                <p>Lot ID: {getLotId(img.id)}</p>
                <p>Wafer No: {getWaferNo(img.id)}</p>
                <p>Defect ID: {getDefectId(img.id)}</p>
                <p>Equip ID: {getEquipId(img.id)}</p>
              </div>
            ) : null}
          </li>
          ))}
        </StyleImages>

        <Pagination hideOnSinglePage total={total} showTotal={t => `Total: ${t}`} pageSize={num1 * num2} defaultCurrent={pageNo} onChange={this.onPageSizeChange} />
        
        <CommonDrawer ref={r => (drawer = r)} width={550}>
          <section>
            <h3 style={{ width: 140 }}>Display Settings</h3>
            <Form layout='vertical' labelCol={{ span: 5 }}>
              <Form.Item label='Group View:'>
                <Select style={{ width: 120 }} onChange={viewGroup => this.setState({ viewGroup })}>
                  {viewGroups.map(g => (
                    <Select.Option value={g[1]} key={g[1]}>
                      {g[0]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='Filters:'>
                <Checkbox.Group options={viewFilters} onChange={viewFilter => this.setState({ viewFilter })} />
              </Form.Item>
              <Form.Item label=' '>
                <Button onClick={this.onFilterSubmit} type='primary'>
                  Submit
                </Button>
            </Form.Item>
            </Form>
          </section>
        </CommonDrawer>
      </StyleImageGallery>
    )
  }
}

// injectReducer('ImageGallery', reducer)
const mapStateToProps = state => ({
  ...state.Init
})
const mapDispatchToProps = {}
export default connect(mapStateToProps, mapDispatchToProps)(ImageGallery)
