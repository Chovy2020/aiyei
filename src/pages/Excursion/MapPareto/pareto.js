import React from 'react'
import echarts from 'echarts'
import _ from 'lodash'
import { delay, getColor } from '@/utils/web'
class Pareto extends React.Component {
  constructor(props) {
    super(props)
    this.paretoChart = null
    this.state = {
      
    }
  }

  async componentDidMount() {
    this.onParetoChartInit()
    this.renderPareto()
  }

  // 初始化 ParetoChart, 绑定点击事件
  onParetoChartInit = () => {
    const paretoChartDom = this.refs['single-pareto']
    if (paretoChartDom) {
      this.paretoChart = echarts.init(paretoChartDom)
      this.paretoChart.on('click', params => this.onParetoChartClick(params))
    } else {
      console.log('paretoChartDom not found')
    }
  }
  // 渲染图表
  renderPareto = async () => {
    await delay(1)
    const { paretoData, selectedBar } = this.props
    if (_.isEmpty(paretoData)) return
    const opt = {
      width: 'auto',
      tooltip: {},
      color:['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      // dataZoom: [
      //   {
      //     show: true,
      //     startValue: 0,
      //     endValue: 9,
      //     xAxisIndex: [0]
      //   }
      // ],
      dataset: {
        source: []
      },
      series: []
    }
    // 处理数据
    const arr = []
    const specArr = []
    // const colorArr = []
    const seriesArr = []
    const xAxisData = paretoData.paretoValue.xAxisData
    const series = paretoData.paretoValue.series
    let legendArr = []
    if (xAxisData.length > 0 && series.length > 0) {
      xAxisData.forEach((item, index) => {
        arr[index] = [item]
      })
      series.forEach(item => {
        item.data.forEach((item, index) => {
          arr[index].push(item)
        })
        legendArr.push(item.name)
        // colorArr.push('#' + getColor(item.name))
      })
      arr.unshift(['product', ...legendArr])
      paretoData.paretoValue.series[0].spec.forEach((item, i) => {
        specArr.push({
          value: item,
          xAxis: i,
          yAxis: item
        })
      })
      // colorArr.forEach((item, index) => {
      series.forEach((item, index) => {
        seriesArr.push({
          type: 'bar',
          markPoint: {
            data: specArr,
            itemStyle: {
              color: '#f00'
            }
          },
          itemStyle: {
            color: param => {
              param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
              // return selectedBar.includes(param.name + '-' + param.seriesName) ? '#ccc' : item
              return selectedBar.includes(param.name + '-' + param.seriesName) ? '#ccc' : opt.color[param.dataIndex % 11]
            }
          },
          label: {
            normal: {
              show: true,
              position: 'top',
              formatter: params => {
                return params.data[index + 1]
              }
            }
          }
        })
      })
      // 填充值
      opt.dataset.source = arr
      opt.series = seriesArr
      // opt.color = colorArr
    }
    this.paretoChart.setOption(opt, true)
    this.exportChart()
  }

  // 点击bar
  onParetoChartClick = data => {
    const { selectedBar } = this.props
    data.seriesName = data.seriesName.substring(0, 6) === 'series' ? '' : data.seriesName
    const index = selectedBar.indexOf(data.name + '-' + data.seriesName)
    if (~index) {
      selectedBar.splice(index, 1)
    } else {
      selectedBar.push(data.name + '-' + data.seriesName)
    }
    this.props.emitSelectedBar(selectedBar)
  }

  exportChart = () => {
    this.props.emitUrl({ pareto: this.paretoChart.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
    }) })
  }

  render() {
    this.renderPareto()
    return (
      <div ref={'single-pareto'} style={{width: '100%', height: '400px'}}></div>
    )
  }
}

export default Pareto