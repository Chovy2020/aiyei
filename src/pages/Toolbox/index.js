import React from 'react'
import { Icon, Tabs, Button } from 'antd'
import { TOOLS } from '@/utils/const'
import { StyleToolbox, Tools, Content } from './style'
import DataQuery from './DataQuery'
import MapGallery from './MapGallery'

const { TabPane } = Tabs

const PAGES = {
  'Data Query': <DataQuery />,
  'Map Gallery': <MapGallery />
}

class Toolbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: '1',
      tabCount: 1,
      panes: [{ type: 'Data Query', name: '1' }]
    }
  }

  onTabChange = activeKey => {
    // console.log(activeKey)
    this.setState({ activeKey })
  }

  addTab = toolType => {
    const { panes } = this.state
    let { tabCount } = this.state
    tabCount += 1
    panes.push({ type: toolType, name: `${tabCount}` })
    this.setState({ panes, tabCount })
  }

  onEdit = (targetKey, action) => {
    // console.log(targetKey, action)
    if (action === 'remove') {
      const { panes } = this.state
      // eslint-disable-next-line no-unused-vars
      for (const i in panes) {
        if (panes[i].name === targetKey) {
          panes.splice(i, 1)
          break
        }
      }
      this.setState({ panes })
    }
  }

  render() {
    const { activeKey, panes } = this.state
    return (
      <StyleToolbox>
        <Tools>
          {TOOLS.map(t => (
            <Icon type={t.icon} key={t.icon} theme='filled' onClick={() => this.addTab(t.type)} />
          ))}
        </Tools>
        <Content>
          <Tabs hideAdd onChange={this.onTabChange} activeKey={activeKey} type='editable-card' onEdit={this.onEdit}>
            {panes.map(pane => (
              <TabPane tab={pane.type} key={pane.name} closable={pane.name !== '1'}>
                {PAGES[pane.type]}
              </TabPane>
            ))}
          </Tabs>
        </Content>
      </StyleToolbox>
    )
  }
}

export default Toolbox
