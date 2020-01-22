/* eslint-disable */
import React from 'react'
import { Collapse, Card } from 'antd'
import { getCluster } from './service'
import { StyleSetUp } from './style'
import SubDie from './subdie'

const { Panel } = Collapse

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`
class Setup extends React.Component {
  // getClusterInfo = async () => {
  //   await getCluster({})
  // }
  async componentDidMount() {
    // console.log(getCluster({}), '1')
  }

  render() {
    return (
      <StyleSetUp>
        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel header='Cluster Setting' key='1'>
            <p>{text}</p>
          </Panel>
          <Panel header='Adder' key='2'>
            <p>{text}</p>
          </Panel>
          <Panel header='Reticle/Repeater' key='3'>
            <p>{text}</p>
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
