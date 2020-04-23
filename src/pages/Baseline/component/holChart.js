/* eslint-disable */
import React from 'react'
import echarts from 'echarts'
import moment from 'moment'
import { delay } from '@/utils/web'

class HolChart extends React.Component {
  constructor(props) {
    super(props)
    this.chartObj = null
    this.state = {
      shadowArr: [],
    }
  }

  componentDidMount() {
    const chartDom = this.refs['holChart']
    if (chartDom) {
      this.chartObj = echarts.init(chartDom)
    } else {
      console.log('chartDom not found')
    }
    // this.init()
    this.renderPareto()
  }

  toRgba = (color) => {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5), 16)
    return `rgba(${r}, ${g}, ${b}, 0.5)`
  }

  // 渲染图表
  renderPareto = async () => {
    await delay(1)
    const { data } = this.props
    if (_.isEmpty(data)) return
    const opt = {
      width: 'auto',
      title: {
        text: `${data.product}, Last ${data.lastmonth} Month`,
        textStyle: {
          fontSize: 14,
        },
        left: 'center'
      },
      legend: { type: 'scroll',top:"40" },
      tooltip: {},
      grid: {
        top: '80',
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: { 
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 90
        }, 
      },
      yAxis: { type: 'value' },
      stack: 'one',
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
    const hold = []
    const holdArr = []
    let seriesArr = []
    const xAxisData = data.pareto.xAxisData
    const series = data.pareto.series
    let legendArr = []
    if (xAxisData.length > 0) {
      xAxisData.forEach((item, index) => {
        arr[index] = [item]
      })
      if(series.length === 0) {
        seriesArr = [{type: 'bar'}]
      }else {
        series.forEach(item => {
          item.data.forEach((item, index) => {
            arr[index].push(item)
          })
          legendArr.push(item.name)
          hold.push(item.holdValue)
        })
        arr.unshift(['product', ...legendArr])
        hold.forEach((item, i) => {
          holdArr.push({
            value: item,
            xAxis: i,
            yAxis: item
          })
        })
        series.forEach((item, index) => {
          seriesArr.push({
            type: 'bar',
            markPoint: {
              data: holdArr
            },
            itemStyle: {
              color: param => {
                param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
                return data.shadow.includes(param.name + '-' + param.seriesName) ? this.toRgba(param.color) : param.color
              }
            }
          })
        })
      }
      
      
      // 填充值
      opt.dataset.source = arr
      opt.series = seriesArr 
    }
    this.chartObj.setOption(opt, true)
  }

  render() {
    this.renderPareto()
    return (
      <div style={{height: '600px'}} ref="holChart"></div>
    )
  }
}

export default HolChart
