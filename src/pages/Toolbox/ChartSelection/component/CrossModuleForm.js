/* eslint-disable */
import React from 'react'
import { Button, TreeSelect } from 'antd'
import _ from 'lodash'
import { delay } from '@/utils/web'
import { getPcCmStep, getPcCm } from '../service'
import {StyleCrossModuleForm} from '../style'
import CrossModuleChart from './CrossModuleChart'

class CrossModuleForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      singleWaferKey: this.props.singleWaferKey,
      x: {},
      x2n: {},
      y: {},
      cmStepData: null,
      cmStepValue: [],
      /* LineCharts */
      LineCharts: [],
    }
  }
  componentDidMount() {
    this.onCMInit()
  }
  
  onCMInit = async () => {
    await delay(1)
    const singleWaferKey = this.props.singleWaferKey
    const res = await getPcCmStep({ singleWaferKey })
    if (res) {
      const cmStepData = []
      for (const i in res) {
        const obj = {
          title: i,
          value: i,
          key: i,
          selectable: false,
          children: res[i].map(item => {
            return {
              title: item,
              value: item,
              key: `${i}-${item}`
            }
          })
        }
        cmStepData.push(obj)
      }
      this.setState({ cmStepData })
    }
  }
  onCMTreeChange = cmStepValue => {
    this.setState({ cmStepValue })
  }
  crossModuleAdd = async () => {
    this.setState({ LineCharts: [] })
    const { cmStepValue } = this.state
    const res = await getPcCm({
      singleWaferKey:this.state.singleWaferKey,
      filter: {},
      flowStep: cmStepValue
    })
    if (res && res.length>0) {
      let LineCharts = []
      res.forEach(item => {
        const series = []
        item.series.forEach(jtem => {
          series.push({
            type: jtem.name,
            data: jtem.data,
            remark: jtem.remark
          })
        })
        LineCharts.push({
          series,
          xAxis: {
            data: item.xAxisData
          },
          yAxis: null,
          step: item.step
        })
      })
      this.setState({ LineCharts })
    }
  }
  onCMremove = index => {
    const { LineCharts } = this.state
    LineCharts.splice(index, 1)
    this.setState({ LineCharts})
  }

  render() {
    const { cmStepData, cmStepValue, LineCharts } = this.state
    return (
      <StyleCrossModuleForm>
        <h4>Cross Module Chart</h4>
        <div style={{ display: 'flex' }}>
          <TreeSelect
            style={{ width: 'calc(100% - 110px)', marginRight: 10 }}
            value={cmStepValue}
            allowClear
            multiple
            treeDefaultExpandAll
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={cmStepData}
            placeholder='Please select'
            onChange={this.onCMTreeChange}
          />
          <Button type='primary' onClick={this.crossModuleAdd}>
            Add
          </Button>
        </div>
        {LineCharts.map((data, index) => (
          <CrossModuleChart name={name} data={data} index={index} key={index} onCMremove={this.onCMremove} />
        ))}
      </StyleCrossModuleForm>
        
    )
  }
}

export default CrossModuleForm
