import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { Icon, Tabs, Spin, Tooltip } from 'antd'
import { TOOLS } from '@/utils/constant'
import { changeWafers, changePrevPage, changeMenu, changeParams, changeShiftMultipleMode } from '@/utils/action'
import { defectIdsToWafers } from '@/utils/web'
import { post } from '@/utils/api'
import { StyleToolbox, Tools, Content, StyleTabPane } from './style'
import DataQuery from './DataQuery'
import MapGallery from './MapGallery'
import ImageGallery from './ImageGallery'
import SingleMap from './SingleMap'
import ChartSelection from './ChartSelection'

class Toolbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: '1',
      tabCount: 1,
      // panes: [{ type: 'Single Map', name: '1' }]
      panes: [{ type: 'Data Query', name: '1' }]
    }
  }

  componentDidMount() {
    this.props.changeMenu('toolbox')
    const body = document.getElementsByTagName('body')[0]
    body.addEventListener('keydown', e => {
      if (e.keyCode === 16) this.props.changeShiftMultipleMode(true)
    })
    body.addEventListener('keyup', e => {
      if (e.keyCode === 16) this.props.changeShiftMultipleMode(false)
    })
  }
  /**
   * 生成各tab页面组件
   * @param {String} type 页面类型
   * @param {String} name 页面名称（唯一key）
   */
  generatePage = ({ type, name }) => {
    switch (type) {
      case 'Data Query':
        return <DataQuery name={name} addTab={this.addTab} />
      case 'Map Gallery':
        return <MapGallery name={name} addTab={this.addTab} />
      case 'Image Gallery':
        return <ImageGallery name={name} addTab={this.addTab} />
      case 'Single Map':
        return <SingleMap name={name} addTab={this.addTab} />
      case 'Chart Selection':
        return <ChartSelection name={name} addTab={this.addTab} />
      default:
        return null
    }
  }
  /**
   * 将【当前页】需要传递的数据保存至store后，再跳转新tab
   * @param {String} name 当前页面的name
   * @param {Object} next 下一个页面对象
   */
  beforeAddTab = async (name, next) => {
    const { panes, tabCount } = this.state
    next.name = `${tabCount + 1}`
    // 当前页 { type, name }
    const prev = _.find(panes, p => p.name === name)
    // console.log('beforeAddTab => prev:', prev, 'next:', next)
    let wafers = []
    /* ------ Image Gallery ------ */
    if (prev.type === 'Image Gallery') {
      const { imageSelected, imageWafers } = this.props
      const selected = imageSelected[name] || []
      // 有选择图片，即defects，
      if (selected.length > 0) {
        // 对defect图片遍历，如果5个主键都相同，则存放到同一个wafer里
        // 2020.3.1 增加连选  改动了 selected结构  需要去重
        const idList = []
        for (const s of selected) {
          const [id,,] = s.split(',')
          if (idList.lenght === 0 || !idList.includes(id)) idList.push(id)
        }
        wafers = defectIdsToWafers(idList)
      } else {
        // 如果没有选择图片，直接使用当前页拉取图片的wafers（前一个页面传递的，imageGallery初始化存储在store）
        wafers = imageWafers[name] || []
      }
    }
    /* ------ Map Gallery ------ */
    if (prev.type === 'Map Gallery') {
      const { mapSelected, mapWafers } = this.props
      const selected = mapSelected[name] || []
      if (selected.length > 0) {
        wafers = selected
      } else {
        wafers = mapWafers[name] || []
      }
      // defectCache => defects
      if (next.type === 'Single Map' || next.type === 'Chart Selection') {
        const res = await post('gallery_map/download_defects', { waferList: wafers })
        wafers = res.map(w => {
          const { lotId, waferNo, productId, stepId, scanTm, defectList } = w
          return {
            lotId,
            waferNo,
            productId,
            stepId,
            scanTm,
            defects: defectList
          }
        })
      }
    }
    /* ------ Single Map ------ */
    if (prev.type === 'Single Map') {
      const { singleSelected, singleWafers } = this.props
      const selected = singleSelected[name] || []
      if (selected.length > 0) {
        wafers = selected
      } else {
        wafers = singleWafers[name] || []
      }
      if (next.type === 'Chart Selection') {
        const { singleParams } = this.props
        const params = singleParams[name]
        this.props.changeParams(params)
      }
    }
    /* ------ Chart Selection ------ */
    if (prev.type === 'Chart Selection') {
      const { chartWafers } = this.props
      wafers = chartWafers[name] || []
      // 如果跳转到Single Map，图表保持一致，需要x, x2n, y, selectedBar四个参数
      if (next.type === 'Single Map') {
        const { chartParams } = this.props
        const params = chartParams[name]
        this.props.changeParams(params)
      }
    }
    // 存储到store.Init
    this.props.changePrevPage(prev)
    // console.log(`传递到下个页面的wafers:`, wafers.length, wafers)
    this.props.changeWafers(wafers)
  }
  /**
   * 添加新页面
   * @param {String} toolType 新页面类型
   */
  addTab = async toolType => {
    const { panes } = this.state
    let { tabCount, activeKey } = this.state
    await this.beforeAddTab(activeKey, { type: toolType })
    tabCount += 1
    activeKey = `${tabCount}`
    panes.push({ type: toolType, name: activeKey })
    this.setState({ activeKey, panes, tabCount })
  }
  /**
   * 页面关闭
   * @param {String} targetKey 页面name
   * @param {String} action 事件类型
   */
  onEdit = (targetKey, action) => {
    if (action === 'remove') {
      let { panes, activeKey } = this.state
      if (activeKey === targetKey) {
        for (const i in panes) {
          if (panes[i].name === targetKey) {
            activeKey = panes[i - 1].name
            break
          }
        }
      }
      panes = panes.filter(p => p.name !== targetKey)
      this.setState({ activeKey, panes })
    }
  }

  render() {
    const { activeKey, panes } = this.state
    const { toolBoxLoading } = this.props

    return (
      <Spin spinning={toolBoxLoading} style={{ maxHeight: '100vh' }}>
        <StyleToolbox>
          <Tools>
            {TOOLS.map(t => (
              <Tooltip placement='right' title={t.type} key={t.icon}>
                <Icon type={t.icon} theme='filled' onClick={() => this.addTab(t.type)} />
              </Tooltip>
            ))}
          </Tools>
          <Content>
            <Tabs hideAdd onChange={activeKey => this.setState({ activeKey })} activeKey={activeKey} type='editable-card' onEdit={this.onEdit}>
              {panes.map(pane => (
                <StyleTabPane tab={pane.type} key={pane.name} closable={pane.name !== '1'}>
                  {this.generatePage(pane)}
                </StyleTabPane>
              ))}
            </Tabs>
          </Content>
        </StyleToolbox>
      </Spin>
    )
  }
}

const mapStateToProps = state => ({
  ...state.Init,
  ...state.MapGallery,
  ...state.SingleMap,
  ...state.ChartSelection,
  ...state.ImageGallery
})
const mapDispatchToProps = {
  changeShiftMultipleMode,
  changePrevPage,
  changeWafers,
  changeParams,
  changeMenu
}
export default connect(mapStateToProps, mapDispatchToProps)(Toolbox)
