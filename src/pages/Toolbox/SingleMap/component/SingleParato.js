/* eslint-disable */
import React from 'react'
import { Tooltip, Button, Table, Icon } from 'antd'
import echarts from 'echarts'
import styled from 'styled-components'
import { delay } from '@/utils/web'
import { StylePareto, StyleChart } from './style'

const StyleBarChart = styled.div``

let chart = null

class SinglePareto extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      singleMapColors: {}
    }
  }

  componentDidMount() {
    const { wafers, name } = this.props
    // const chartDom = document.getElementById(`chart-${name}-${index}`)
    console.log('SinglePareto', wafers)
    this.onParetoCreated()
  }

  componentDidUpdate(prevProps, prevState) {
    const { wafers } = this.props
    if (wafers.length > 0 && wafers !== prevProps.wafers) {
      console.log('wafers changed', wafers)
    }
  }

  // 初始化 ParetoChart, 绑定点击事件
  onParetoCreated = () => {
    const { name } = this.props
    const paretoDom = document.getElementById(`single-pareto-${name}`)
    if (paretoDom) {
      paretoChart = echarts.init(paretoDom)
      paretoChart.on('click', params => this.onParetoChartClick(params))
    } else {
      console.log('paretoDom not found')
    }
  }
  // Pareto 创建
  onParetoCreated = async () => {
    // const { paretoParams } = this.state
    // const x = await getX()
    // const x2n = await getX2nd(paretoParams['1stXCode'])
    // x2n[''] = 'None'
    // const y = await getY(paretoParams['1stXCode'], paretoParams['2ndXCode'])
    // this.setState({ x, x2n, y })
    this.onParetoInit()
  }
  // Parato 初始化 (包含pareto 和 dsaParato)
  onParetoInit = async () => {
    const { dsa } = this.state
    const formData = this.getFormData()
    const paretoData = await post('swp', formData)
    console.log('paretoData', paretoData)
    // 计算颜色
    // const { singleMapColors } = this.state
    // if (paretoData && paretoData.paretoValue && paretoData.paretoValue.series.length > 0) {
    //   paretoData.paretoValue.series.forEach(({ name }) => {
    //     if (!singleMapColors[name]) singleMapColors[name] = '#' + getColor(name)
    //   })
    // }
    // this.setState({ paretoData, singleMapColors })
    // this.renderPareto()
  }
  // 渲染图表
  renderPareto = async () => {
    await delay(1)
    const { paretoData, x, y, paretoParams, ifAvg, selectedBar } = this.state
    if (_.isEmpty(paretoData)) return
    const wafers = this.getWafers()
    const len = wafers.length
    const opt = {
      width: 'auto',
      legend: { type: 'scroll' },
      tooltip: {},
      xAxis: { type: 'category', name: x[paretoParams['1stXCode']] },
      yAxis: { type: 'value', name: y[paretoParams['yCode']] },
      dataZoom: [
        {
          show: true,
          startValue: 0,
          endValue: 9,
          xAxisIndex: [0]
        }
      ],
      dataset: {
        source: []
      },
      series: []
    }
    // 处理数据
    const arr = []
    const hold = []
    const holdArr = []
    const colorArr = []
    const seriesArr = []
    const xAxisData = paretoData.paretoValue.xAxisData
    const series = paretoData.paretoValue.series
    let legendArr = []
    const yCode = parseInt(paretoParams['yCode'])
    if (xAxisData.length > 0 && series.length > 0) {
      xAxisData.forEach((item, index) => {
        arr[index] = [item]
      })
      series.forEach(item => {
        item.data.forEach((item, index) => {
          arr[index].push(ifAvg === 'avg' ? Math.round(item / len) : item)
        })
        legendArr.push(item.name)
        hold.push(item.holdValue)
        colorArr.push('#' + getColor(item.name))
      })
      arr.unshift(['product', ...legendArr])
      hold.forEach((item, i) => {
        holdArr.push({
          value: item,
          xAxis: i,
          yAxis: item
        })
      })
      colorArr.forEach((item, index) => {
        seriesArr.push({
          type: 'bar',
          markPoint: {
            data: holdArr
          },
          itemStyle: {
            color: param => {
              param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
              return selectedBar.includes(param.name + '-' + param.seriesName) ? '#ccc' : item
            }
          },
          label: {
            normal: {
              show: true,
              position: 'top',
              formatter: params => {
                if (yCode >= 300) return toPercent(params.data[index + 1])
                if (yCode >= 200) return params.data[1].toFixed(2)
                return params.data[index + 1]
              }
            }
          }
        })
      })
      // 填充值
      opt.dataset.source = arr
      opt.series = seriesArr
      opt.color = colorArr
    }
    paretoChart.setOption(opt)
  }

  render() {
    const { name, wafers } = this.props
    // console.log('SinglePareto', wafers)

    return (
      <StylePareto>
        {/* <Form layout='inline' style={{ height: 59, marginTop: -9 }}>
          <Form.Item label='X' style={{ width: 160 }}>
            <Select size='small' onChange={this.onChangeX} value={paretoParams['1stXCode']} style={{ width: 130 }}>
              {Object.keys(x).map(key => (
                <Select.Option key={key} value={key}>
                  {x[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='2nd X' style={{ width: 180 }}>
            <Select size='small' onChange={this.onChangeX2nd} value={paretoParams['2ndXCode']} style={{ width: 120 }}>
              {Object.keys(x2n).map(key => (
                <Select.Option key={key} value={key}>
                  {x2n[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item size='small' label='Y' style={{ width: 200 }}>
            <Select size='small' onChange={this.onChangeY} value={paretoParams['yCode']} style={{ width: 170 }}>
              {Object.keys(y).map(key => (
                <Select.Option style={{ fontSize: 12 }} key={key} value={key}>
                  {y[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button size='small' onClick={this.onParetoSearch} type='primary' style={{ marginRight: 10, minWidth: 50 }}>
              Search
            </Button>
            <Button size='small' onClick={this.onParetoClear} type='dashed' style={{ minWidth: 50 }}>
              Clear
            </Button>
          </Form.Item>
          {singleWaferKey.length > 1 ? (
            <Form.Item>
              <Select size='small' onChange={this.onAvgChange} value={ifAvg} style={{ width: 70 }}>
                <Select.Option value='sum'>SUM</Select.Option>
                <Select.Option value='avg'>AVG</Select.Option>
              </Select>
            </Form.Item>
          ) : null}
        </Form>
        <StyleChart id={`single-pareto-${name}`} style={{ display: `${dsa ? 'none' : 'block'}` }} /> */}
        <StyleChart id={`single-pareto-${name}`} />
        <h1>SinglePareto</h1>
      </StylePareto>
    )
  }
}

export default SinglePareto
