/* eslint-disable */
import React from 'react'
import echarts from 'echarts'
import moment from 'moment'
import { delay } from '@/utils/web'

class KeyDefectChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartObj: null,
      pieces: []
    }
  }

  componentDidMount() {
    const chartDom = this.refs['keyDefectChart']
    if (chartDom) {
      this.state.chartObj = echarts.init(chartDom)
    } else {
      console.log('chartDom not found')
    }
    this.dealData()
    this.init()
  }

  init = async () => {
    const { data, yValue } = this.props
    const addDay = data.lastmonth*(-30)
    let opt = {
      title: {
        text: `${data.product},${data.step},${data.mb},${yValue},`+ moment().add(addDay, 'day').format('YYYY.MM.DD') + '-' + moment().format('YYYY.MM.DD'),
        textStyle: {
          fontSize: 14,
        },
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      grid: {
        top: '80',
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      color: 'green',
      // legend: {
      //   data: this.props.name,
      //   x: 'center',
      //   y: '30'
      // },
      xAxis: {
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 90
          },
          data: data.series.name
      },
      yAxis: { 
        type: 'value',
        max: (value) => {
          return Math.max(value.max, data.spec)
        }
      },
      series: {
        name: '',
        type: 'line',
        data: data.series.data
      }
    }
    if(data.spec) {
      opt.series = {
        ...opt.series,
        markLine: {
          silent: true,
          lineStyle: {
            color: '#c23531',
            width: 3,
          },
          data: [{
            yAxis: data.spec
          }]
        }
      }
    }
    if(this.state.pieces.length > 0) {
      opt.visualMap = {
        show: false,
        dimension: 0,
        pieces: this.state.pieces
      }
    } 
    if (this.state.chartObj) this.state.chartObj.setOption(opt, true)
  }
  // 识别连续上升5个以上的点
  dealData = () => {
    let arr = this.props.data.series.data
    let newArr = []
    let total = 1
    for(let i=0; i<arr.length; i++) {
      if(arr[i]<arr[i+1]) {
        total++
      }else {
        if(total >=5){
          newArr.push([i-total+1,i])
        }
        total = 1
      }
    }
    if(newArr.length>0) {
      let pieces = [{
        lte: newArr[0][0],
        color: 'green'
      },{
        gt: newArr[newArr.length-1][1],
        color: 'green'
      }]
      newArr.forEach((item, index) => {
        pieces.push({
          gt: item[0],
          lte: item[1],
          color: 'red'
        })
        if(newArr[index+1]) {
          pieces.push({
            gt: item[1],
            lte: newArr[index+1][0],
            color: 'green'
          })
        }
      })
      this.setState({pieces})
    }
  }

  render() {
    this.init()
    return (
      <div style={{height: '600px'}} ref="keyDefectChart"></div>
    )
  }
}

export default KeyDefectChart
