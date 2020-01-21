import React from 'react'
import { Collapse, Card } from 'antd'
import { StyleSetUp } from './style'
import Cluster from './cluster'
import SubDie from './subdie'

const { Panel } = Collapse

class Setup extends React.Component {
  render() {
    return (
      <StyleSetUp>
        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel header='Cluster Setting' key='1'>
            <Cluster />
          </Panel>
          <Panel header='Adder' key='2'>
            <Cluster />
          </Panel>
          <Panel header='Reticle/Repeater' key='3'>
            <Cluster />
          </Panel>
        </Collapse>
        <Card title='Zonal Setting'>
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card title='Sub-Die Setting'>
          <SubDie />
        </Card>
      </StyleSetUp>
    )
  }
}

export default Setup
