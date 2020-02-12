import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { Form, Select, Pagination, Checkbox, Button, message } from 'antd'
import CommonDrawer from '@/components/CommonDrawer'
import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
import { changeImageSelected, changeImageWafers } from './action'
import { LAYOUT_SIZE, VIEW_GROUPS, CATEGORY_TYPES, getLotId, getWaferNo, getDefectId, getEquipId } from './constant'
import reducer from './reducer'
import { getClassCodes, getViewFilters, getImages, updateDefectGroup } from './service'
import { StyleImageGallery, StyleImages } from './style'

class ImageGallery extends React.Component {
  constructor(props) {
    super(props)
    this.drawer = null
    this.state = {
      // 图片布局
      layout: {
        num1: 5,
        num2: 3
      },
      showLabel: true,
      categoryType: 'mb',
      classCodes: [], // ！通过接口获取
      classCode: '',
      viewGroup: 'mb',
      viewFilters: [], // ！通过接口获取
      viewFilter: [],
      images: [],
      currentImages: [],
      total: 0,
      pageNo: 1
    }
  }
  
  // 从store取出当前页的selected
  getImageSelected = () => {
    const { imageSelected, name } = this.props
    return imageSelected[name] || []
  }
  // 从store取出当前页的wafers
  getImageWafers = () => {
    const { imageWafers, name } = this.props
    return imageWafers[name] || []
  }

  async componentDidMount() {
    // 将wafers保存到store，跳转下一个页面使用
    const { wafers, name } = this.props
    this.props.changeImageWafers({ name, wafers })
    // 初始化selected
    this.onClassifiedReset()
    await this.loadClassCodes()
    await this.loadImages()
    this.loadViewFilters()
  }
  // 通过接口获取 classCodes
  loadClassCodes = async () => {
    const classCodes = await getClassCodes()
    this.setState({ classCodes })
  }
  // 通过接口获取 filters
  loadViewFilters = async () => {
    const imageInfo = this.getImageWafers()
    let viewFilters = await getViewFilters({ imageInfo })
    viewFilters = viewFilters.map(item => `${item}`)
    this.setState({ viewFilters })
  }
  // 获取图片链接的列表 + 过滤
  loadImages = async () => {
    this.onClassifiedReset()
    await delay(1)
    const { prevPage } = this.props
    const isFromMapGallery = prevPage.type === 'Map Gallery'
    const { viewGroup, viewFilter } = this.state
    let imageInfo = this.getImageWafers()
    if (imageInfo.length === 0) return
    if (isFromMapGallery) {
      // 需要使用 defectIdRedisKey
      imageInfo.forEach(item => {
        item.defectIdRedisKey = item.defectCache
      })
      // 过滤无redisKey
      imageInfo = imageInfo.filter(item => item.defectIdRedisKey !== '')
    } else {
      // 过滤无defects
      imageInfo = imageInfo.filter(item => item.defects.length > 0)
    }
    const data = {
      imageGroupBy: viewGroup,
      mbFilter: viewFilter.map(item => parseInt(item)),
      imageInfo: imageInfo,
      singleGalleryFlag: isFromMapGallery ? 'galleryMap' : 'singleMap'
    }
    const res = await getImages(data)
    const images = []
    for (const id in res)
      for (const url of res[id])
        images.push({
          url,
          id
        })
    this.setState({ images, total: images.length || 0, pageNo: 1 })
    // 默认显示第一页的图片
    this.generateImages()
  }
  // 修改图片布局
  onLayoutChange = (key, value) => {
    const { layout } = this.state
    layout[key] = value
    this.setState({ layout })
    this.generateImages()
  }
  // 分页切换
  onPageSizeChange = pageNo => {
    this.setState({ pageNo })
    this.generateImages()
  }
  // 从缓存取出图片，前端分页
  generateImages = async () => {
    await delay(1)
    const { layout, pageNo, images } = this.state
    const pageSize = layout.num1 * layout.num2
    const currentImages = images.filter((img, index) => index >= pageSize * (pageNo - 1) && index < pageSize * pageNo)
    this.setState({ currentImages })
  }
  // 选择/反选图片
  onSelect = id => {
    const { name } = this.props
    let selected = this.getImageSelected()
    if (selected.includes(id)) {
      selected = _.remove(selected, n => id !== n)
    } else {
      selected.push(id)
    }
    this.props.changeImageSelected({ name, selected })
  }
  // 图片分类提交
  onClassifiedSubmit = async () => {
    const selected = this.getImageSelected()
    const { categoryType, classCode } = this.state
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
    this.onClassifiedReset()
    // 重新拉取图片列表
    await this.loadImages()
    this.loadViewFilters()
  }
  // 图片取消选择
  onClassifiedReset = () => {
    const { name } = this.props
    this.props.changeImageSelected({ name, selected: [] })
  }
  // 侧边栏 筛选
  onFilterSubmit = () => {
    this.drawer.onClose()
    this.loadImages()
  }

  render() {
    const selected = this.getImageSelected()
    const { layout, classCodes, categoryType, classCode, viewGroup, viewFilters, currentImages, total, pageNo, showLabel } = this.state
    const { num1, num2 } = layout

    return (
      <StyleImageGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Layout:'>
            <Select size='small' defaultValue={num1} style={{ width: 60 }} onChange={v => this.onLayoutChange('num1', v)}>
              {LAYOUT_SIZE.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <span style={{ marginRight: 10 }}>X</span>
            <Select size='small' defaultValue={num2} style={{ width: 60 }} onChange={v => this.onLayoutChange('num2', v)}>
              {LAYOUT_SIZE.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <Checkbox size='small' onChange={e => this.setState({ showLabel: e.target.checked })} defaultChecked={showLabel}>
              Show Label
            </Checkbox>
          </Form.Item>
          <Form.Item label='Classified:'>
            <Select
              size='small'
              style={{ width: 120 }}
              defaultValue={categoryType}
              onChange={categoryType => this.setState({ categoryType })}
            >
              {CATEGORY_TYPES.map(t => (
                <Select.Option value={t[1]} key={t[1]}>
                  {t[0]}
                </Select.Option>
              ))}
            </Select>
            <Select
              size='small'
              style={{ width: 120 }}
              defaultValue={classCode}
              onChange={classCode => this.setState({ classCode })}
            >
              {classCodes.map(c => (
                <Select.Option value={c.classCode} key={c.classCode}>
                  {`${c.classCode}-${c.className}`}
                </Select.Option>
              ))}
            </Select>
            <Button size='small' onClick={this.onClassifiedSubmit} type='primary'>
              Ok {selected.length > 0 ? `(${selected.length * 2})` : ''}
            </Button>
            <Button size='small' onClick={this.onClassifiedReset} type='dashed'>
              Reset
            </Button>
          </Form.Item>
        </Form>

        <StyleImages className={`col${num1}`}>
          {currentImages.map((img, index) => (
            <li
              key={`${img.id}-${index}`}
              className={selected.includes(img.id) ? 'selected' : ''}
              onClick={() => this.onSelect(img.id)}
            >
              <img src={`http://161.189.50.41${img.url}`} alt='' />
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

        <Pagination
          size='small'
          hideOnSinglePage
          total={total}
          showTotal={t => `Total: ${t}`}
          pageSize={num1 * num2}
          current={pageNo}
          onChange={this.onPageSizeChange}
        />

        <CommonDrawer ref={r => (this.drawer = r)} width={550}>
          <section>
            <h3 style={{ width: 140 }}>Display Settings</h3>
            <Form layout='vertical' labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
              <Form.Item label='Group View:'>
                <Select
                  size='small'
                  style={{ width: 120 }}
                  defaultValue={viewGroup}
                  onChange={viewGroup => this.setState({ viewGroup })}
                >
                  {VIEW_GROUPS.map(g => (
                    <Select.Option value={g[1]} key={g[1]}>
                      {g[0]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='Filters:'>
                <Checkbox.Group size='small' options={viewFilters} onChange={viewFilter => this.setState({ viewFilter })} />
              </Form.Item>
              <Form.Item label=' '>
                <Button onClick={this.onFilterSubmit} style={{ float: 'right' }} type='primary'>
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

injectReducer('ImageGallery', reducer)
const mapStateToProps = state => ({
  ...state.Init,
  ...state.ImageGallery
})
const mapDispatchToProps = { changeImageSelected, changeImageWafers }
export default connect(mapStateToProps, mapDispatchToProps)(ImageGallery)
