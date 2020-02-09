/* eslint-disable */
import React from 'react'
import { Tooltip, Button, Table, Icon } from 'antd'
import echarts from 'echarts'
import styled from 'styled-components'
import { delay } from '@/utils/web'

const StyleCrossModuleChart = styled.div``
const StyleOperBtn = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
  button {
    width: 100px;
  }
`
const StyleTooltip = styled.div`
  margin: 0 5px;
  display: flex;
  i {
    cursor: pointer;
    margin: 5px;
    height: 20px;
  }
  i.checked,
  i:hover {
    color: #409eff;
  }
`
const StyleChart = styled.div`
  width: 100%;
  height: 400px;
`

let chart = null

class CrossModuleChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      legendData: [],
      seriesData: [],
      btns: [
        { content: 'Trend Chart', i: 'line-chart', func: 'lineChart' },
        { content: 'Stack Bar Chart', i: 'database', func: 'stackBarChart' },
        { content: 'Box Chart', i: 'box-plot', func: 'boxChart' }
      ],
      selectedAction: 'line-chart',
      tableData: []
    }
  }

  componentDidMount() {
    const { data, name, index } = this.props
    const chartDom = document.getElementById(`chart-${name}-${index}`)
    if (chartDom) {
      chart = echarts.init(chartDom)
      // chart.on('click', params => this.onChartClick(params))
      // chart.on('dblclick', params => this.onChartDbclick(params))
    } else {
      console.log('chartDom not found')
    }
    this.init('line-chart')
    const legendData = []
    const tableData = []
    data.series.forEach((item, index) => {
      legendData.push(item.type)
      let singleData = _.cloneDeep(item.data)
      let newSingleData = singleData.filter(item => item !== null)
      let total = 0
      newSingleData.forEach(item => {
        total += item
      })
      tableData.push({
        key: index,
        name: item.type,
        sampleCount: newSingleData.length,
        avg: Math.round(total / newSingleData.length),
        max: Math.max(...newSingleData),
        min: Math.min(...newSingleData)
      })
    })
    this.setState({ legendData, tableData })
  }

  init = type => {
    const { data } = this.props
    let seriesData = []
    if (type === 'line-chart') {
      data.series.forEach(item => {
        seriesData.push({
          connectNulls: true,
          name: item.type,
          type: 'line',
          data: item.data,
          markPoint: {
            data: []
          }
        })
      })
    } else if (type === 'database') {
      data.series.forEach(item => {
        seriesData.push({
          type: 'bar',
          stack: 'one',
          data: item.data,
          markPoint: {
            data: []
          }
        })
      })
    } else if (type === 'cube') {
      const kData = []
      data.series[0].data.forEach(() => {
        kData.push([])
      })
      data.series.forEach(item => {
        item.data.forEach((jtem, j) => {
          kData[j].push(jtem)
        })
      })
      // 计算box图数据
      const boxArr = []
      kData.forEach(item => {
        let sortItem = _.cloneDeep(item).sort()
        let len = sortItem.length
        let min = sortItem[0]
        let max = sortItem[len - 1]
        let math25 = sortItem[Math.floor(len / 4)]
        let math75 = len > 3 ? sortItem[Math.ceil((len * 3) / 4)] : max
        boxArr.push([math25, math75, min, max])
      })
      seriesData = [
        {
          type: 'k',
          data: boxArr
        }
      ]
    }
    this.setState({ seriesData })
    this.generateCMChartOption()
  }
  generateCMChartOption = async () => {
    await delay(1)
    const { data } = this.props
    const { seriesData } = this.state
    const opt = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: this.legendData,
        x: 'center',
        y: '30'
      },
      grid: {
        top: '80',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 90
        },
        data: data.xAxis.data
      },
      yAxis: {
        type: 'value'
      },
      series: seriesData
    }
    if (chart) chart.setOption(opt)
  }

  onCMshowPM = () => {
    const { data, legendData, seriesData } = this.props
    data.series.forEach((item, index) => {
      const remark = []
      if (item.remark) {
        item.remark.forEach((i, idx) => {
          legendData.push(item.type)
          if (i === 'PM') {
            remark.push({
              value: 'PM',
              xAxis: idx,
              yAxis: item.data[idx]
            })
          }
        })
        seriesData[index].markPoint.data = remark
      }
    })
    this.setState({ legendData, seriesData })
  }

  onDoAction = func => {
    if (func === 'lineChart') {
      this.setState({
        selectedAction: 'line-chart'
      })
      this.init('line-chart')
    } else if (func === 'stackBarChart') {
      this.setState({
        selectedAction: 'database'
      })
      this.init('database')
    } else if (func === 'boxChart') {
      this.setState({
        selectedAction: 'cube'
      })
      this.init('cube')
    }
  }

  render() {
    const { name, index, onCMremove } = this.props
    const { btns, selectedAction, tableData } = this.state
    const cmTableColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Sample Count',
        dataIndex: 'sampleCount',
        key: 'sampleCount'
      },
      {
        title: 'Avg',
        dataIndex: 'avg',
        key: 'avg'
      },
      {
        title: 'Max',
        dataIndex: 'max',
        key: 'max'
      },
      {
        title: 'Min',
        dataIndex: 'min',
        key: 'min'
      }
    ]

    return (
      <StyleCrossModuleChart>
        <StyleOperBtn>
          {selectedAction !== 'cube' ? (
            <Button type='primary' onClick={this.onCMshowPM}>
              Show PM
            </Button>
          ) : null}
          <Button type='danger' onClick={() => onCMremove(index)}>
            Remove
          </Button>
        </StyleOperBtn>
        <StyleTooltip>
          {btns.map(item => (
            <Tooltip key={item.func} className='item' placement='top' title={item.content}>
              <Icon
                onClick={() => this.onDoAction(item.func)}
                className={`fa fa-${item.i} ${selectedAction === item.func ? 'checked' : ''}`}
                type={item.i}
              />
            </Tooltip>
          ))}
        </StyleTooltip>
        <StyleChart id={`chart-${name}-${index}`} />
        {selectedAction !== 'cube' ? <Table columns={cmTableColumns} dataSource={tableData} /> : null}
      </StyleCrossModuleChart>
    )
  }
}

export default CrossModuleChart
