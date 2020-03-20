/* eslint-disable */
import React from 'react'
import echarts from 'echarts'
import { delay } from '@/utils/web'

class RiseChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartObj: null,
      pieces: []
    }
  }

  componentDidMount() {
    const chartDom = this.refs['riseChart']
    if (chartDom) {
      this.state.chartObj = echarts.init(chartDom)
    } else {
      console.log('chartDom not found')
    }
    this.dealData()
  }

  init = () => {
    let opt = {
      title: {
        text: '数据连续上升图例'
      },
      tooltip: {
        trigger: 'item'
      },
      color: 'green',
      legend: {
        data: this.props.name,
        x: 'center',
        y: '30'
      },
      xAxis: {
          type: 'category',
          data: this.props.xAxis
      },
      yAxis: { type: 'value'},
      series: [
        {
          name: '',
          type: 'line',
          data: this.props.data,
        }
      ]
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
    let arr = this.props.data
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
          let: item[1],
          color: 'red'
        })
        if(newArr[index+1]) {
          pieces.push({
            gt: item[1],
            let: newArr[index+1][0],
            color: 'green'
          })
        }
      })
      this.setState({pieces})
    }
  }

  render() {
    this.init ()
    return (
      <div style={{height: '400px'}} ref="riseChart"></div>
    )
  }
}

export default RiseChart
