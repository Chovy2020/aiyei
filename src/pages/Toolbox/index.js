import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { Icon, Tabs, Spin, Tooltip } from 'antd'
import { TOOLS } from '@/utils/const'
import { changeWafers, changePrevPage } from '@/utils/action'
// import { delay } from '@/utils/web'
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
      panes: [{ type: 'Data Query', name: '1' }]
    }
  }

  componentDidMount() {}

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

  onTabChange = activeKey => {
    this.setState({ activeKey })
  }

  /**
   * 将【当前页】需要传递的数据（store） 保存后，再跳转新tab
   * @param {String} name 当前tab页的name
   */
  beforeAddTab = async (name, next) => {
    const { panes, tabCount } = this.state
    next.name = `${tabCount + 1}`
    // 当前页 { type, name }
    const prev = _.find(panes, p => p.name === name)
    console.log('beforeAddTab => prev:', prev, 'next:', next)
    let wafers = []
    /* ------ Image Gallery ------ */
    if (prev.type === 'Image Gallery') {
      const { imageSelected, imageWafers } = this.props
      const selected = imageSelected[name] || []
      // 有选择图片，即defects，
      if (selected.length > 0) {
        // 对defect图片遍历，如果5个主键都相同，则存放到同一个wafer里
        selected.forEach(imgKey => {
          const imgKeyArray = imgKey.split('|')
          const lotId = imgKeyArray[0]
          const stepId = imgKeyArray[2]
          const waferNo = imgKeyArray[3]
          const productId = imgKeyArray[1]
          const scanTm = imgKeyArray[4]
          const defect = parseInt(imgKeyArray[5])
          const exist = _.find(wafers, w => w.lotId === lotId && w.stepId === stepId && w.waferNo === waferNo && w.productId === productId && w.scanTm === scanTm)
          if (exist) {
            exist.defects = [...exist.defects, defect]
          } else {
            wafers.push({
              lotId,
              stepId,
              waferNo,
              productId,
              scanTm,
              defects: [defect],
              defectCache: ''
            })
          }
        })
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
    }
    this.props.changePrevPage(prev)
    // 存储到store.Init
    console.log(`传递到下个页面的wafers:`, wafers.length, wafers)
    this.props.changeWafers(wafers)
  }

  addTab = async toolType => {
    const { panes } = this.state
    let { tabCount, activeKey } = this.state
    await this.beforeAddTab(activeKey, { type: toolType })
    // 先将当前页码存store
    // this.props.changePreviousPage(activeKey)
    tabCount += 1
    activeKey = `${tabCount}`
    panes.push({ type: toolType, name: activeKey })
    this.setState({ activeKey, panes, tabCount })
    // this.props.initPage(activeKey)
  }

  onEdit = (targetKey, action) => {
    if (action === 'remove') {
      // this.props.initPage(targetKey)
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
            <Tabs hideAdd onChange={this.onTabChange} activeKey={activeKey} type='editable-card' onEdit={this.onEdit}>
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
  ...state.ImageGallery
})
const mapDispatchToProps = {
  changePrevPage,
  changeWafers
}
export default connect(mapStateToProps, mapDispatchToProps)(Toolbox)
