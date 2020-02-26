/* eslint-disable */
import React from 'react'
import { Tooltip, Button, Table, Icon } from 'antd'
import echarts from 'echarts'
import styled from 'styled-components'
import { delay } from '@/utils/web'

const StyleLineChart = styled.div``
const StyleChart = styled.div`
  width: 100%;
  height: 400px;
`

class CorrelationChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartObj: null
    }
  }

  componentDidMount() {
    const { data, name, index } = this.props
    const chartDom = this.refs[`chart-${name}-${index}`]
    if (chartDom) {
      this.state.chartObj = echarts.init(chartDom)
      this.state.chartObj.setOption({
        xAxis: {},
        yAxis: {},
        series: [
          {
            symbolSize: 20,
            data: data.data,
            type: 'scatter'
          }
        ]
      })
    } else {
      console.log('chartDom not found')
    }
  }

  render() {
    const { name, index, data } = this.props

    return (
      <StyleLineChart>
        <div>Parameter = {data.paraId}</div>
        <div>
          R<sup>2</sup>= {data.correlationValue}
        </div>
        <StyleChart ref={`chart-${name}-${index}`} />
      </StyleLineChart>
    )
  }
}

export default CorrelationChart
