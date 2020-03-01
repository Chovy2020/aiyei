import React from 'react'
import _ from 'lodash'
import LazyLoad from 'react-lazyload'
import { connect } from 'react-redux'
import { Form, Select, Checkbox, Button, message } from 'antd'
import CommonDrawer from '@/components/CommonDrawer'
import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
import { changeImageSelected, changeImageWafers } from './action'
import {
  LAYOUT_SIZE,
  VIEW_GROUPS,
  CATEGORY_TYPES,
  FONT_SIZE,
  getLotId,
  getWaferNo,
  getDefectId,
  getStepId
} from './constant'
import reducer from './reducer'
import { getClassCodes, getViewFilters, getImages, updateDefectGroup } from './service'
import { StyleImageGallery, StyleImages, StyleImagesGroup } from './style'

class ImageGallery extends React.Component {
  constructor(props) {
    super(props)
    this.drawer = null
    this.state = {
      selectedIds: [],
      // 图片布局
      columns: 5,
      showLabel: true,
      labelSize: '12',
      categoryType: 'mb',
      classCodes: [], // ！通过接口获取
      classCode: '',
      viewGroup: 'MB',
      viewFilters: [], // ！通过接口获取
      viewFilter: [],
      images: {},
      total: 0,
      pageNo: 1
    }
  }

  // 从store取出当前页的selected
  getSelected = () => {
    const { imageSelected, name } = this.props
    return imageSelected[name] || []
  }
  // 从store取出当前页的wafers
  getWafers = () => {
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
    const imageInfo = this.getWafers()
    if (imageInfo.length === 0) return
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
    let imageInfo = this.getWafers()
    if (imageInfo.length === 0) return
    if (isFromMapGallery) {
      // 过滤无redisKey
      imageInfo = imageInfo.filter(item => item.defectCache !== '')
    } else {
      // 过滤无defects
      imageInfo = imageInfo.filter(item => item.defects.length > 0)
    }
    const data = {
      imageGroupBy: viewGroup,
      mbFilter: viewFilter.map(item => parseInt(item)),
      imageInfo: imageInfo,
      singleGalleryFlag: 'galleryMap'
    }
    const res = await getImages(data)
    const images = {}
    let count = 0
    for (const group in res) {
      images[group] = []
      for (const id in res[group]) {
        for (const index in res[group][id]) {
          count++
          images[group].push({
            id,
            index,
            url: res[group][id][index]
          })
        }
      }
    }
    this.setState({ images })
    if (count === 0) message.warning('No photos yet')
  }
  /**
   * 图片选择、反选、连选
   * @param {String} nextId
   * @param {Number} index
   * @param {String} group
   */
  onSelect = (nextId, index, group) => {
    const next = `${nextId},${index},${group}`
    const { name, shiftMultipleMode } = this.props
    let selected = this.getSelected()
    // 先找到当前选择的图片所在分组，仅对组内连选
    const { images } = this.state
    const currentGroupImages = images[group]
    // 存储图片的id，相同id不同index，同时选中
    let { selectedIds } = this.state
    // 反选直接走普通模式
    if (shiftMultipleMode && !selectedIds.includes(nextId)) {
      // shift连选模式
      const currentSelected = selected.filter(item => {
        const info = item.split(',')
        return group === info[info.length - 1]
      })
      if (currentSelected.length === 0) {
        selectedIds.push(nextId)
        for (const img of currentGroupImages) {
          if (img.id === nextId) {
            // 点击的是一张图片，存储2张
            selected.push(`${img.id},${img.index},${group}`)
          }
        }
      } else {
        // 连选 - 当前组内 已经选中的最后一个元素。数组有序，上一次选中添加在最后
        const prev = currentSelected[currentSelected.length - 1]
        // 计算下标  比较出正序连选、反序连选
        let lastIndex = 0
        let nextIndex = 0
        for (const i in currentGroupImages) {
          const temp = `${currentGroupImages[i].id},${currentGroupImages[i].index},${group}`
          // 这里始终为同id的最后一个下标，反序连选时 会重复计算，后面需要去重
          // [1,【2】,3,4,[5,6]] ()>=2 && <6) 会重复5
          if (temp === prev) lastIndex = parseInt(i)
          if (temp === next) nextIndex = parseInt(i)
        }
        // console.log('currentGroupImages', currentGroupImages.length, 'lastIndex', lastIndex, 'nextIndex', nextIndex)
        for (const i in currentGroupImages) {
          const temp = `${currentGroupImages[i].id},${currentGroupImages[i].index},${group}`
          if (
            (nextIndex > lastIndex && i > lastIndex && i <= nextIndex) ||
            (nextIndex < lastIndex && i >= nextIndex && i < lastIndex) ||
            // [[1,2],3,4,【5】,6]，点击5的时候，会漏掉6
            // [1,【2】,3,4,[5,6]] 反序同理会漏掉1
            currentGroupImages[i].id === nextId
          ) {
            // 这里添加的id必然是重复的，后续去重
            selectedIds.push(currentGroupImages[i].id)
            selected.push(temp)
          }
        }
        selectedIds = _.uniq(selectedIds)
        // 反选去重
        if (nextIndex < lastIndex) selected = _.uniq(selected)
      }
    } else {
      // 普通单选模式
      if (selectedIds.includes(nextId)) {
        selectedIds = selectedIds.filter(n => n !== nextId)
        selected = selected.filter(s => {
          const sArr = s.split(',')
          return sArr[0] !== nextId
        })
      } else {
        selectedIds.push(nextId)
        for (const img of currentGroupImages) {
          if (img.id === nextId) {
            // 点击的是一张图片，存储2张
            selected.push(`${img.id},${img.index},${group}`)
          }
        }
      }
    }
    this.setState({ selectedIds })
    this.props.changeImageSelected({ name, selected })
  }
  // 图片分类提交
  onClassifiedSubmit = async () => {
    let selected = this.getSelected()
    // 需要去重
    const idList = []
    for (const s of selected) {
      const [id,,] = s.split(',')
      if (idList.lenght === 0 || !idList.includes(id)) idList.push(id)
    }
    const { categoryType, classCode } = this.state
    if (idList.length === 0) {
      message.warning('Please select images first')
      return
    }
    await updateDefectGroup({
      idList,
      type: categoryType,
      code: classCode
    })
    message.success('Classification operation succeeded')
    this.onClassifiedReset()
    // 重新拉取图片列表
    await this.loadImages()
    this.loadViewFilters()
  }
  // 图片取消选择
  onClassifiedReset = () => {
    this.setState({ selectedIds: [] })
    const { name } = this.props
    this.props.changeImageSelected({ name, selected: [] })
  }
  // 侧边栏 筛选
  onFilterSubmit = () => {
    this.drawer.onClose()
    this.loadImages()
  }

  render() {
    const {
      selectedIds,
      columns,
      classCodes,
      categoryType,
      classCode,
      viewGroup,
      viewFilters,
      images,
      showLabel,
      labelSize
    } = this.state

    return (
      <StyleImageGallery>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Layout:'>
            <span>Columns:</span>
            <Select
              size='small'
              defaultValue={columns}
              style={{ width: 55, marginLeft: 5 }}
              onChange={columns => this.setState({ columns })}
            >
              {LAYOUT_SIZE.map(s => (
                <Select.Option value={s} key={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <Checkbox
              size='small'
              style={{ marginLeft: 20 }}
              onChange={e => this.setState({ showLabel: e.target.checked })}
              defaultChecked={showLabel}
            >
              Show Label
            </Checkbox>
            {showLabel ? (
              <>
                <span style={{ marginLeft: 20 }}>Label Size:</span>
                <Select
                  size='small'
                  style={{ width: 55, marginLeft: 5 }}
                  value={labelSize}
                  onChange={labelSize => this.setState({ labelSize })}
                >
                  {FONT_SIZE.map(t => (
                    <Select.Option value={t} key={t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              </>
            ) : null}
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
              Ok {selectedIds.length > 0 ? `(${selectedIds.length * 2})` : ''}
            </Button>
            <Button size='small' onClick={this.onClassifiedReset} type='dashed'>
              Reset
            </Button>
          </Form.Item>
        </Form>

        <StyleImagesGroup>
          {Object.keys(images).map(key => (
            <div key={key}>
              {images[key].length > 0 ? <h2>【{key}】</h2> : null}
              <StyleImages className={`col${columns}`}>
                {images[key].map((img, index) => (
                  <li
                    key={`${img.id}-${index}`}
                    className={selectedIds.includes(img.id) ? 'selected' : ''}
                    onClick={() => this.onSelect(img.id, img.index, key)}
                  >
                    <LazyLoad height={200} overflow={true}>
                      <img src={`http://161.189.50.41${img.url}`} alt='' />
                    </LazyLoad>
                    {showLabel ? (
                      <div className={`wafer-info font-size-${labelSize}`}>
                        <p>Lot ID: {getLotId(img.id)}</p>
                        <p>Wafer No: {getWaferNo(img.id)}</p>
                        <p>Defect ID: {getDefectId(img.id)}</p>
                        <p>Step: {getStepId(img.id)}</p>
                      </div>
                    ) : null}
                  </li>
                ))}
              </StyleImages>
            </div>
          ))}
        </StyleImagesGroup>

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
                <Checkbox.Group
                  size='small'
                  options={viewFilters}
                  onChange={viewFilter => this.setState({ viewFilter })}
                />
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
