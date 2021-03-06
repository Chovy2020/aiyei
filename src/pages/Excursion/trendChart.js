/* eslint-disable */
import React from 'react'
import { Form, Select, Tooltip, Checkbox, Button, InputNumber, Icon, TreeSelect, message,Collapse } from 'antd'
import _ from 'lodash'
import echarts from 'echarts'
import { delay, toPercent} from '@/utils/web'
import { BUTTONS, NORMALIZED } from '../Toolbox/ChartSelection/constant'
import { getX, getX2n, getY } from '../Toolbox/ChartSelection/service'
import { getTrendChart, getTrendChartBox } from './service'
import {
  StyleChartSelection,
  StyleTooltip,
  StyleChart,
  FormItemLabel
} from '../Toolbox/ChartSelection/style'
import CrossModuleForm from '../Toolbox/ChartSelection/component/CrossModuleForm'
class ChartSelection extends React.Component {
  constructor(props) {
    super(props)
    this.chartObj = null
    this.state = {
      chartSelecting: {},
      singleWaferKey: [],
      selectedAction: 'bar-chart',
      selectedStar: '',
      allBar: [],
      selectedBar: [],
      formInline: {
        xValue: 'mb',
        x2ndValue: '',
        yValue: '100',
        normalized: ''
      },
      ifAvg: 'sum',
      showLabel: true,
      yAxisOper: {
        min: 0,
        max: null,
        interval: null
      },
      x: {},
      x2n: {},
      y: {},
      showIntelligence: false,
      riseChartData: [],
      boxData: null,
      resData: null,
      newData: null,
      selectData: null,
      newNoData: null,
      selectNoData: null,
      seriesType: 'bar',
      ifStack: '',
      tips: [],
      AnalysisCondition: [],
      normShow: false,
      boxChartData: [],
      pieces: [],
    }
  }

  async componentDidMount() {
    const chartDom = document.getElementById(`trendChartDom`)
    if (!chartDom) {
      message.error('chartDom not found')
      return
    }
    this.chartObj = echarts.init(chartDom)
    this.chartObj.on('click', params => this.onChartClick(params))
    this.chartObj.on('legendselectchanged', params => this.onlegendselectchanged(params))
    this.onXInit()
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
  }

  formatter = params => {
    const { tips } = this.state
    return ['value:' + params.value[params.seriesIndex + 1], 'common:' + (tips[params.dataIndex] || '')].join('\n')
  }

  // 箱图数据
  onBoxChartInit = async (singleWaferKey,xValue, x2ndValue, yValue, normalized) => {
    await delay(1)
    const boxData = await getTrendChartBox(this.props.lastMonth, {
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: 1, centralLocation: '200,200' },
      filter: {},
      pareto: {
        '1stXCode': xValue,
        '2ndXCode': x2ndValue,
        yCode: yValue,
        // 现在不为空的时候会报错,将来normalized接口好后要修改
        normBy: normalized
      }
    })
    this.setState({ boxData })
  }

  onCommonChartInit = async (singleWaferKey,xValue, x2ndValue, yValue, normalized) => {
    const resData = await getTrendChart(this.props.lastMonth,{
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: 1, centralLocation: '200,200' },
      filter: {},
      pareto: {
        '1stXCode': xValue,
        '2ndXCode': x2ndValue,
        yCode: yValue,
        // 现在不为空的时候会报错,将来normalized接口好后要修改
        normBy: normalized
      }
    })
    const showIntelligence = resData.paretoValue.series.length !== 1
    if(!showIntelligence) {
      this.setState({
        riseChartData: resData.paretoValue.series[0].data
      }) 
    }
    this.setState({
      resData,
      showIntelligence,
    })
  }

  onChartInit = async () => {
    await delay(1)
    const { formInline } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const singleWaferKey = []
    const p1 = this.onBoxChartInit(singleWaferKey,xValue, x2ndValue, yValue, normalized)
    const p2 = this.onCommonChartInit(singleWaferKey,xValue, x2ndValue, yValue, normalized)
    Promise.all([p1,p2]).then(res => {
      this.dealData()
    })
  }
  dealData = () => {
    const arr = []
    const arrNo = []
    let AnalysisCondition = []
    const kData = []
    const allBar = []
    arr[0] = ['product']
    arrNo[0] = ['product']
    const { resData, boxData, singleWaferKey, ifAvg } = this.state
    const len = singleWaferKey.length
    if (resData.paretoValue.xAxisData.length > 0 && resData.paretoValue.series.length > 0) {
      resData.paretoValue.xAxisData.forEach((item, index) => {
        arr[index + 1] = [item]
        arrNo[index + 1] = [item]
        kData.push([])
        resData.paretoValue.series.forEach(jtem => {
          allBar.push(item + '-' + jtem.name)
        })
      })

      resData.paretoValue.series.forEach(item => {
        arr[0].push(item.name)
        arrNo[0].push(item.name)
        AnalysisCondition.push(item.name)
        item.data.forEach((jtem, j) => {
          arr[j + 1].push(ifAvg === 'avg' ? Math.round(jtem / len) : jtem)
          arrNo[j + 1].push(null)
        })
      })

      boxData.paretoValue.series.forEach(item => {
        item.data.forEach((jtem, j) => {
          kData[j].push(ifAvg === 'avg' ? Math.round(jtem / len) : jtem)
        })
      })
    }
    // 计算box图数据
    const boxArr = []
    kData.forEach(item => {
      let deleteNull = item.filter(i => i !== null)
      const sortItem = _.cloneDeep(deleteNull).sort()
      const len = sortItem.length
      const min = sortItem[0]
      const max = sortItem[len - 1]
      const math25 = sortItem[Math.floor(len / 4)]
      const math75 = len > 3 ? sortItem[Math.ceil((len * 3) / 4)-1] : max
      boxArr.push([math25, math75, min, max])
    })
    this.setState({
      AnalysisCondition,
      allBar,
      newData: _.cloneDeep(arr),
      selectData: _.cloneDeep(arr),
      newNoData: _.cloneDeep(arrNo),
      selectNoData: _.cloneDeep(arrNo),
      boxChartData: boxArr
    })
  }
  onXInit = async () => {
    const x = await getX()
    this.setState({ x })
  }
  onX2nInit = async () => {
    await delay(1)
    const { formInline } = this.state
    const { xValue } = formInline
    const x2n = await getX2n(xValue)
    this.setState({ x2n })
  }
  onYInit = async () => {
    await delay(1)
    const { formInline } = this.state
    const { xValue, x2ndValue } = formInline
    const y = await getY(xValue, x2ndValue)
    this.setState({ y })
  }
  onXchange = xValue => {
    const formInline = {
      xValue,
      x2ndValue: '',
      yValue: '100',
      normalized: 'all'
    }
    this.setState({ formInline, ifAvg: 'sum' })
    this.clearSelection()
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
    setTimeout(() => {
      this.chartObj.resize()
    },100)
    this.props.emitPareto({pareto: {'1stXCode': xValue, '2ndXCode': "", 'yCode': "100", 'normBy': "all"}})
  }
  onX2nchange = x2ndValue => {
    const { formInline } = this.state
    formInline.x2ndValue = x2ndValue
    formInline.yValue = '100'
    formInline.normalized = 'all'
    this.setState({ formInline, ifAvg: 'sum' })
    this.clearSelection()
    this.onYInit()
    this.onChartInit()
    this.props.emitPareto({pareto: {'1stXCode': formInline.xValue, '2ndXCode': x2ndValue, 'yCode': "100", 'normBy': "all"}})
  }
  onYchange = yValue => {
    const { y, formInline } = this.state
    formInline.yValue = yValue
    formInline.normalized = 'all'
    this.setState({
      normShow: y[yValue] && y[yValue].includes('NORM') ? true : false,
      formInline,
      ifAvg: 'sum'
    })
    this.clearSelection()
    this.onChartInit()
    this.props.emitPareto({pareto: {'1stXCode': formInline.xValue, '2ndXCode': formInline.x2ndValue, 'yCode': yValue, 'normBy': "all"}})
  }
  onNormalizedChange = v => {
    const { formInline } = this.state
    formInline.normalized = v
    this.setState({ formInline, ifAvg: 'sum'})
    this.clearSelection()
    this.onChartInit()
    this.props.emitPareto({pareto: {'1stXCode': formInline.xValue, '2ndXCode': formInline.x2ndValue, 'yCode': formInline.yValue, 'normBy': v}})
  }
  onYAxisOperChange = (key, value) => {
    const { yAxisOper } = this.state
    yAxisOper[key] = parseFloat(value)
    this.setState({ yAxisOper })
  }
  onAvgChange = async (ifAvg) => {
    this.setState({ ifAvg })
    await delay(1)
    await this.dealData()
    this.onGenerateChartOption()
  }
  // 切换选择条件, 清空之前选择
  clearSelection = () => {
    this.setState({ 
      selectedAction: 'bar-chart',
      seriesType: 'bar', 
      ifStack: '', 
      selectedStar: '', 
      selectedBar: []
    })
    // this.ref.correlationFrom.onCAReset()
  }
  // 切换图表
  onDoAction = func => {
    this.setState({ selectedStar: '' })
    if (func === 'trendChart') {
      this.setState({
        selectedBar: [],
        selectedAction: 'line-chart',
        seriesType: 'line',
        ifStack: ''
      })
    } else if (func === 'barChart') {
      const { newData, newNoData } = this.state
      this.setState({
        selectedAction: 'bar-chart',
        seriesType: 'bar',
        ifStack: '',
        selectedBar: [],
        selectData: _.cloneDeep(newData),
        selectNoData: _.cloneDeep(newNoData)
      })
    } else if (func === 'stackBarChart') {
      const { newData, newNoData, resData } = this.state
      let stackContent = resData.paretoValue.series.length === 1 ? '': 'one'
      this.setState({
        selectedAction: 'database',
        seriesType: 'bar',
        ifStack: stackContent,
        selectedBar: [],
        selectData: _.cloneDeep(newData),
        selectNoData: _.cloneDeep(newNoData)
      })
    } else if (func === 'boxChart') {
      this.setState({ selectedAction: 'box-plot' })
    } 
  
  }
  // 选择'选中'或'未选中'
  showSelected = star => {
    this.setState({ selectedStar: star })
  }
  // lineChart和barChart时, 点击列表显示或隐藏
  onChartClick = async data => {
    const { selectedAction, newData, selectedBar, selectedStar } = this.state
    if (selectedAction !== 'box-plot' && selectedStar === '') {
      data.seriesName = data.seriesName.substring(0, 6) === 'series' ? '' : data.seriesName
      const index = selectedBar.indexOf(data.name + '-' + data.seriesName)
      if (~index) {
        selectedBar.splice(index, 1)
      } else {
        selectedBar.push(data.name + '-' + data.seriesName)
      }
      this.setState({ selectedBar })
      // 记录选中和非选中的数据
      const { selectData, selectNoData } = this.state
      const selDataSingle = selectData[data.dataIndex + 1][data.seriesIndex + 1]
      const newDataSingle = newData[data.dataIndex + 1][data.seriesIndex + 1]
      if (selDataSingle === newDataSingle) {
        selectData[data.dataIndex + 1][data.seriesIndex + 1] = null
        selectNoData[data.dataIndex + 1][data.seriesIndex + 1] = newDataSingle
      } else {
        selectData[data.dataIndex + 1][data.seriesIndex + 1] = newDataSingle
        selectNoData[data.dataIndex + 1][data.seriesIndex + 1] = null
      }
      this.setState({ selectData, selectNoData })
    }
  }
  // 选择图例
  onlegendselectchanged(data) {
    let arr = []
    for (let key in data.selected) {
      if (data.selected[key]) {
        arr.push(key)
      }
    }
    this.setState({ AnalysisCondition: arr, chartSelecting: data.selected })
    if(arr.length === 1) {
      let data = []
      this.state.resData.paretoValue.series.forEach(item => {
        if(item.name === arr[0]) {
          data = item.data
        }
      })
      this.setState({ riseChartData: data})
    }
  }

  // 识别连续5点上升
  upData = () => {
    let arr = this.state.riseChartData
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
  onGenerateChartOption = async () => {
    await delay(100)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
    const { resData, yAxisOper, chartSelecting, selectedStar } = this.state
    if (!resData) return
    let opt = {
      legend: { type: 'scroll', selected: chartSelecting },
      tooltip: { trigger: 'item' },
      grid: {
        top: '80',
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      color:['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
      dataset: { source: [] },
      xAxis: { 
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 90
        },
      },
      yAxis: {
        max: yAxisOper.max || null,
        min: yAxisOper.min || 0,
        interval: yAxisOper.interval || null
      },
      // series: [],
      dataZoom: [{ show: true }]
    }
    const { showLabel, selectedAction, selectData, selectNoData } = this.state
    // 处理数据
    if (selectedStar !== '') {
      if (selectedStar === 'star') {
        this.showLine(opt, showLabel, selectData)
      }else {
        this.showLine(opt, showLabel, selectNoData)
      }
    } else {
      if (selectedAction === 'box-plot') {
        const { boxChartData } = this.state
        opt.xAxis.data = resData.paretoValue.xAxisData
        opt.series = [
          {
            type: 'k',
            data: boxChartData
          }
        ]
        opt.dataset.source = []
      } else {
        const seriesArr = []
        const { selectedBar, seriesType, ifStack, newData, formInline } = this.state
        const yCode = parseInt(formInline['yValue'])
        if (resData.paretoValue.xAxisData.length && resData.paretoValue.series.length) {
          if(selectedAction === 'line-chart' && (this.state.AnalysisCondition.length === 1 || !this.state.showIntelligence)) {
            await this.upData()
            if(this.state.pieces.length > 0) {
              opt = {
                ...opt,
                visualMap: {
                  show: false,
                  dimension: 0,
                  pieces: this.state.pieces
                },
              }
              opt.color = ['green']
            }
            resData.paretoValue.series.forEach((item,index) => {
              seriesArr.push({
                type: seriesType,
                stack: ifStack,
                symbolSize: 8,
                symbol : (value, param) => {
                  param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
                  const idx = selectedBar.indexOf(param.name + '-' + param.seriesName)
                  return ~idx ? 'emptyCircle' : 'arrow'
                },
                label: {
                  normal: {
                    show: showLabel,
                    position: 'top',
                    formatter: params => {
                      if (yCode >= 300) return toPercent(params.data[index+1])
                      if (yCode >= 200) return params.data[1].toFixed(2)
                      return params.data[index+1]
                    }
                  }
                }
              })
            }) 
          }else if(selectedAction === 'line-chart' && !(this.state.AnalysisCondition.length === 1 || !this.state.showIntelligence)){
            resData.paretoValue.series.forEach((item,index) => {
              seriesArr.push({
                type: seriesType,
                stack: ifStack,
                symbolSize: 8,
                symbol : (value, param) => {
                  param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
                  const idx = selectedBar.indexOf(param.name + '-' + param.seriesName)
                  return ~idx ? 'emptyCircle' : 'arrow'
                },
                label: {
                  normal: {
                    show: showLabel,
                    position: 'top',
                    formatter: params => {
                      if (yCode >= 300) return toPercent(params.data[index+1])
                      if (yCode >= 200) return params.data[1].toFixed(2)
                      return params.data[index+1]
                    }
                  }
                }
              })
            }) 
          }else {
            resData.paretoValue.series.forEach((item,index) => {
              seriesArr.push({
                type: seriesType,
                stack: ifStack,
                itemStyle: {
                  color: param => {
                    param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
                    const idx = selectedBar.indexOf(param.name + '-' + param.seriesName)
                    return ~idx ? '#ccc' : opt.color[index % 11]
                  }
                },
                label: {
                  normal: {
                    show: showLabel,
                    position: 'top',
                    formatter: params => {
                      if (yCode >= 300) return toPercent(params.data[index+1])
                      if (yCode >= 200) return params.data[1].toFixed(2)
                      return params.data[index+1]
                    }
                  }
                }
              })
            })
          }
          
        }
        // 填充值
        opt.series = seriesArr
        opt.dataset.source = _.cloneDeep(newData)
      }
    }
    if (this.chartObj) {
      this.chartObj.setOption(opt, true)
    } 
  }
  // 折线图/柱状图时，显示选中或非选中点
  showLine = (opt, showLabel, source) => {
    const seriesArr = []
    const { resData, seriesType, ifStack } = this.state
    resData.paretoValue.series.forEach((item,index) => {
      seriesArr.push({
        connectNulls: true,
        type: seriesType,
        stack: ifStack,
        label: {
          normal: { show: showLabel, position: 'top' }
        }
      })
    })
    // 填充值
    let filterNull = [source[0]]
    for(let i=1; i<source.length; i++) {
      let arr = [...new Set(source[i])]
      if(arr.length > 2 || arr[1] !== null) {
        filterNull.push(source[i])
      }
    }
    opt.series = seriesArr
    opt.dataset.source = filterNull
  }
  // 清除所有选中
  clearAllBar = () => {
    const { resData, selectedAction, newData, newNoData } = this.state
    if(selectedAction !== 'box-plot') {
      let arr = []
      resData.paretoValue.xAxisData.forEach((item, index) => {
        resData.paretoValue.series.forEach(jtem => {
          arr.push(item + '-' + jtem.name)
        })
      })
      this.setState({selectedBar: arr,
        selectData: _.cloneDeep(newNoData),
        selectNoData: _.cloneDeep(newData)})
    }
  }

  // 生成baseUrl64
  exportChart = () => {
    return this.chartObj.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
    })
  }

  render() {
    const { singleWaferKey, formInline, x, x2n, y, normShow, showLabel , ifAvg} = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const { selectedAction, selectedStar } = this.state
    this.onGenerateChartOption()

    return (
      <StyleChartSelection>
        <Form layout='vertical' labelCol={{ span: 6, offset: 14}}>
          <Form.Item>
            <FormItemLabel>X:</FormItemLabel>
            <Select size='small' onChange={this.onXchange} value={xValue} style={{ width: 120, marginRight: 10 }}>
              {Object.keys(x).map(key => (
                <Select.Option value={key} key={key}>
                  {x[key]}
                </Select.Option>
              ))}
            </Select>
            <FormItemLabel>2nd X:</FormItemLabel>
            <Select size='small' onChange={this.onX2nchange} value={x2ndValue} style={{ width: 120, marginRight: 10 }}>
              <Select.Option value={''}>None</Select.Option>
              {Object.keys(x2n).map(key => (
                <Select.Option value={key} key={key}>
                  {x2n[key]}
                </Select.Option>
              ))}
            </Select>
            <FormItemLabel>Y:</FormItemLabel>
            <Select size='small' onChange={this.onYchange} value={yValue} style={{ width: 225, marginRight: 10 }}>
              {Object.keys(y).map(key => (
                <Select.Option value={key} key={key}>
                  {y[key]}
                </Select.Option>
              ))}
            </Select>
            {normShow ? (
              <>
                <FormItemLabel>Normalized by:</FormItemLabel>
                <Select
                  size='small'
                  defaultValue={normalized}
                  style={{ width: 120, marginRight: 10 }}
                  onChange={this.onNormalizedChange}
                >
                  {Object.keys(NORMALIZED).map(key => (
                    <Select.Option value={key} key={key}>
                      {NORMALIZED[key]}
                    </Select.Option>
                  ))}
                </Select>
              </>
            ) : null}
            {singleWaferKey.length > 1 ? (
              <Select size='small' onChange={this.onAvgChange} value={ifAvg} style={{ width: 70 }}>
                <Select.Option value='sum'>SUM</Select.Option>
                <Select.Option value='avg'>AVG</Select.Option>
              </Select>
            ) : null}
          </Form.Item>
          <Form.Item>
            <FormItemLabel>Min:</FormItemLabel>
            <InputNumber
              size='small' 
              onChange={value => this.onYAxisOperChange('min', value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <FormItemLabel>Max:</FormItemLabel>
            <InputNumber
              size='small' 
              onChange={value => this.onYAxisOperChange('max', value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <FormItemLabel>Interval:</FormItemLabel>
            <InputNumber
              size='small' 
              onChange={value => this.onYAxisOperChange('interval', value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <Checkbox checked={showLabel} onChange={e => this.setState({ showLabel: e.target.checked })}>
              Show Value
            </Checkbox>
            <Button type="dashed" size="small" onClick={this.clearAllBar}>clear</Button>
          </Form.Item>
        </Form>

        <StyleTooltip>
          {BUTTONS.map(item => (
            <Tooltip key={item.func} className='item' placement='top' title={item.content}>
              <Icon
                onClick={() => this.onDoAction(item.func)}
                className={`fa fa-${item.i} ${selectedAction === item.i ? 'checked' : ''}`}
                type={item.i}
              />
            </Tooltip>
          ))}
          {selectedAction !== 'box-plot' ? (
            <div>
              <Tooltip className='item' placement='top' title='显示选中'>
                <Icon
                  onClick={() => this.showSelected('star')}
                  className={`fa ${selectedStar === 'star' ? 'checked' : ''}`}
                  type='check-circle'
                />
              </Tooltip>
              <Tooltip className='item' placement='top' title='显示非选中'>
                <Icon
                  onClick={() => this.showSelected('star-o')}
                  className={`fa ${selectedStar === 'star-o' ? 'checked' : ''}`}
                  type='close-circle'
                />
              </Tooltip>
            </div>
          ) : null}
        </StyleTooltip>

        <StyleChart id={`trendChartDom`} style={(formInline.xValue === 'st' || formInline.xValue === 'lwc') ? {height: '600px'} : {height: '400px'}}/>

      </StyleChartSelection>
    )
  }
}

export default ChartSelection
