/* eslint-disable */
import React from 'react'
import { Collapse, Card } from 'antd'
import { StyleSetUp } from './style'
import Cluster from './cluster'
import Adder from './adder'
import ReticleRepeater from './reticleRepeater'
import Zonal from './zonal'
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
            <Adder />
          </Panel>
          <Panel header='Reticle/Repeater' key='3'>
            <ReticleRepeater />
          </Panel>
        </Collapse>
        <Card title='Zonal Setting'>
          <Zonal />
        </Card>
        <Card title='Sub-Die Setting'>
          <SubDie />
        </Card>
      </StyleSetUp>
    )
  }
}

export default Setup
