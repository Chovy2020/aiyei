/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Icon, Tabs, Spin } from 'antd'
import { TOOLS } from '@/utils/const'
import { changePreviousPage, initPage } from './action'
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
      // panes: [{ type: 'Image Gallery', name: '1' }]
      panes: [{ type: 'Data Query', name: '1' }]
    }
  }

  componentDidMount() {
    this.props.initPage('1')
  }

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

  addTab = toolType => {
    const { panes } = this.state
    let { tabCount, activeKey } = this.state
    // 存store
    this.props.changePreviousPage(activeKey)
    tabCount += 1
    activeKey = `${tabCount}`
    panes.push({ type: toolType, name: activeKey })
    this.setState({ activeKey, panes, tabCount })
    this.props.initPage(activeKey)
  }

  onEdit = (targetKey, action) => {
    if (action === 'remove') {
      this.props.initPage(targetKey)
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
              <Icon type={t.icon} key={t.icon} theme='filled' onClick={() => this.addTab(t.type)} />
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

const mapStateToProps = state => ({ ...state.Init })
const mapDispatchToProps = {
  changePreviousPage,
  initPage
}
export default connect(mapStateToProps, mapDispatchToProps)(Toolbox)
