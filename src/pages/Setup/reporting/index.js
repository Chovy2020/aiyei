import React from 'react'
import _ from 'lodash'
import { Card } from 'antd'
import { StyleSetUp } from './style'
import DoiHandling from './doiHandling'
import HolSetting from './holSetting'

class Reporting extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      
    }
  }

  render() {
    return (
      <StyleSetUp>
        <Card title='DOI Handling' headStyle={{backgroundColor: '#8bc5ff'}}>
          <DoiHandling />
        </Card>
        <Card title='HOL Setting' headStyle={{backgroundColor: '#8bc5ff'}}>
          <HolSetting />
        </Card>
      </StyleSetUp>
    )
  }
}

export default Reporting
