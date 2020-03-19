/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Select, Tooltip, Checkbox, Button, InputNumber, Icon, TreeSelect, message,Collapse } from 'antd'
import _ from 'lodash'
import echarts from 'echarts'
import { injectReducer } from '@/utils/store'
import { delay, toPercent} from '@/utils/web'
import { changeChartSelected, changeChartWafers, changeChartParams } from './action'
import { BUTTONS, NORMALIZED } from './constant'
import reducer from './reducer'
import { getX, getX2n, getY, getChartData, getboxChartData, getPcCmStep, getPcCm} from './service'
import {
  StyleChartSelection,
  StyleTooltip,
  StyleChart,
  StyleOperBtn,
  StyleCrossModuleForm,
  FormItemLabel
} from './style'
// import CrossModuleForm from './component/CrossModuleForm'
import CorrelationForm from './component/CorrelationForm'
import CrossModuleChart from './component/CrossModuleChart'
import RiseChart from './component/RiseChart'
const { Panel } = Collapse
class ChartSelection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartObj: null,
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
      riseChartxAxis: [],
      riseChartName: '',
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
      showCrossModule: false,
      showCorrelation: false,
      boxChartData: [],
      cmStepData: null,
      cmStepValue: [],
      cmStepArr: [],
      /* LineCharts */
      LineCharts: [],
      /* Correlation Analysis */
      caWatProducts: []
    }
  }

  // /api/swp/defects
  changeChartParamsBar = bars => {
    const { chartParams, name } = this.props
    const params = chartParams[name] || {}
    params.bars = bars || []
    this.props.changeChartParams({ name, params })
  }

  // 从store取出当前页的selected
  getSelected = () => {
    const { chartSelected, name } = this.props
    return chartSelected[name] || []
  }
  // 从store取出当前页的wafers
  getWafers = () => {
    const { chartWafers, name } = this.props
    return chartWafers[name] || []
  }

  async componentDidMount() {
    // 如果前一个页面是chartSelection，获取params
    const { name, prevPage } = this.props
    if (prevPage && prevPage.type === 'Single Map') {
      const { params } = this.props
      const formInline = {
        xValue: params.x,
        x2ndValue: params.x2n,
        yValue: params.y,
        normalized: ''
      }
      this.setState({ formInline, selectedBar: params.bars })
      this.props.changeChartParams({
        name,
        params: {
          x: formInline['1stXCode'],
          x2n: formInline['2ndXCode'],
          y: formInline['yCode'],
          bars: formInline.bars
        }
      })
    } else {
      const { formInline } = this.state
      this.props.changeChartParams({
        name,
        params: {
          x: formInline.xValue,
          x2n: formInline.x2ndValue,
          y: formInline.yValue,
          bars: []
        }
      })
    }
    // 将页面传递的wafers(or bars) 存储在当前页面，后续该页面addTab需要使用(当前页面无选择操作，追溯前一个页面的wafers)
    let { wafers } = this.props
    if (wafers.length === 0) {
      wafers = [
        {
          lotId: 'B0001.000',
          stepId: 'M4_CMP',
          waferNo: '1',
          productId: 'Device01',
          scanTm: '2018-06-07 12:30:35',
          defects: [],
          defectCache: '5255f356-0558-414c-ba28-6a4a88774f0e'
        }
      ]
    }
    let existDefects = false
    for (const wafer of wafers) {
      if (wafer.defects.length > 0) {
        existDefects = true
        break
      }
    }
    this.setState({ existDefects })
    wafers = wafers.map(w => {
      const { lotId, stepId, waferNo, productId, scanTm, defects } = w
      return {
        lotId,
        stepId,
        waferNo,
        productId,
        scanTm,
        currentDefects: existDefects ? defects : null,
        defects: []
      }
    })
    this.props.changeChartWafers({ name, wafers })
    const chartDom = document.getElementById(`chart-${name}`)
    if (!chartDom) {
      message.error('chartDom not found')
      return
    }
    this.state.chartObj = echarts.init(chartDom)
    this.state.chartObj.on('click', params => this.onChartClick(params))
    this.state.chartObj.on('legendselectchanged', params => this.onlegendselectchanged(params))
    this.onXInit()
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
    let watProductArr = []
    wafers.forEach(item => {
      watProductArr.push(item.productId)
    })
    this.setState({caWatProducts:[...new Set(watProductArr)]})
  }

  formatter = params => {
    const { tips } = this.state
    return ['value:' + params.value[params.seriesIndex + 1], 'common:' + (tips[params.dataIndex] || '')].join('\n')
  }

  onSelectChange = (key, value) => {
    const { formInline } = this.state
    formInline[key] = value
    this.setState({ formInline })
  }

  onBoxChartInit = async (singleWaferKey,xValue, x2ndValue, yValue, normalized) => {
    // 箱图数据
    const boxData = await getboxChartData({
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: 1, centralLocation: '200,200' },
      filter: {},
      pareto: {
        '1stXCode': xValue,
        '2ndXCode': x2ndValue,
        yCode: yValue,
        normBy: normalized
      }
    })
    this.setState({ boxData })
  }

  onCommonChartInit = async (singleWaferKey,xValue, x2ndValue, yValue, normalized) => {
    const resData = await getChartData({
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: 1, centralLocation: '200,200' },
      filter: {},
      pareto: {
        '1stXCode': xValue,
        '2ndXCode': x2ndValue,
        yCode: yValue,
        normBy: normalized
      }
    })
    const showIntelligence = resData.paretoValue.series.length !== 1
    const riseChartxAxis = resData.paretoValue.xAxisData
    if(!showIntelligence) {
      this.setState({
        riseChartName: resData.paretoValue.series[0].name,
        riseChartData: resData.paretoValue.series[0].data
      }) 
    }
    this.setState({
      resData,
      showCrossModule: false,
      showCorrelation: false,
      showIntelligence,
      riseChartxAxis
    })
  }

  onChartInit = async () => {
    await delay(1)
    const { formInline } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    // 每次请求接口前，将x,2x,y存储到Store，页面若跳转到singleMap，+selectedBar，可还原柱状图
    const { chartParams, name } = this.props
    const params = chartParams[name] || {}
    params.x = xValue
    params.x2n = x2ndValue
    params.y = yValue
    if (!params.bars) params.bars = []
    this.props.changeChartParams({ name, params })
    const singleWaferKey = this.getWafers()
    this.setState({singleWaferKey})
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
    const { resData, boxData } = this.state
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
          arr[j + 1].push(jtem)
          arrNo[j + 1].push(null)
        })
      })

      boxData.paretoValue.series.forEach(item => {
        item.data.forEach((jtem, j) => {
          kData[j].push(jtem)
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
      yValue: '100'
    }
    this.setState({ formInline })
    this.clearSelection()
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
    setTimeout(() => {
      this.state.chartObj.resize()
    },100)
  }
  onX2nchange = x2ndValue => {
    const { formInline } = this.state
    formInline.x2ndValue = x2ndValue
    formInline.yValue = '100'
    this.setState({ formInline })
    this.clearSelection()
    this.onYInit()
    this.onChartInit()
  }
  onYchange = yValue => {
    const { y, formInline } = this.state
    formInline.yValue = yValue
    formInline.normalized = 'All Defect'
    this.setState({
      normShow: y[yValue] && y[yValue].includes('NORM') ? true : false,
      formInline,
    })
    this.clearSelection()
    this.onChartInit()
  }
  onNormalizedChange = v => {
    const { formInline } = this.state
    formInline.normalized = v
    this.setState({ formInline})
    this.clearSelection()
    this.onChartInit()
  }
  onYAxisOperChange = (key, value) => {
    const { yAxisOper } = this.state
    yAxisOper[key] = parseFloat(value)
    this.setState({ yAxisOper })
  }
  // 切换选择条件, 清空之前选择
  clearSelection = () => {
    this.setState({ 
      selectedAction: 'bar-chart',
      seriesType: 'bar', 
      ifStack: '', 
      selectedStar: '', 
      LineCharts: [], 
      cmStepValue: []
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
      this.changeChartParamsBar([])
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
      this.changeChartParamsBar([])
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
      this.changeChartParamsBar([])
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
      this.changeChartParamsBar(selectedBar)
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
      this.setState({riseChartName: arr[0], riseChartData: data})
    }
  }

  onGenerateChartOption = async () => {
    await delay(1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    const { resData, yAxisOper, chartSelecting, selectedStar } = this.state
    if (!resData) return
    const opt = {
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
        // 填充值
        opt.series = seriesArr
        opt.dataset.source = _.cloneDeep(newData)
      }
    }
    if (this.state.chartObj) this.state.chartObj.setOption(opt, true)
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
      this.changeChartParamsBar(arr)
    }
  }

  /* crossModuleForm */
  crossModuleAnalysis = () => {
    this.setState({ showCrossModule: true })
    this.onCMInit()
  }
  correlationAnalysis = () => {
    this.setState({ showCorrelation: true })
  }
  onCMInit = async () => {
    await delay(1)
    const singleWaferKey = this.getWafers()
    const res = await getPcCmStep({ singleWaferKey })
    // const res = {"FLOW1":{"M1":["M1NBK","M1TEOS","M1PH","M1ET","M1ECP","M1CMP"]}}
    if (res) {
      // res = _.uniq(res)
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
    const { formInline, filter, cmStepValue, cmStepArr } = this.state
    const singleWaferKey = this.getWafers()
    const filter1 = {}
    let arr = [...new Set(cmStepValue, cmStepArr)]
    this.setState({cmStepArr: arr})
    filter1[formInline.x2ndValue] = filter
    const res = await getPcCm({
      singleWaferKey,
      filter: filter1,
      flowStep: arr
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
    const { name } = this.props
    const { formInline, x, x2n, y, normShow, showLabel } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const { selectedAction, selectedStar } = this.state
    const { AnalysisCondition, showCrossModule, showCorrelation } = this.state
    const { cmStepData, cmStepValue, LineCharts,singleWaferKey } = this.state
    const { caWatProducts } = this.state
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
                    <Select.Option value={NORMALIZED[key]} key={key}>
                      {NORMALIZED[key]}
                    </Select.Option>
                  ))}
                </Select>
              </>
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

        <StyleChart id={`chart-${name}`} style={(formInline.xValue === 'st' || formInline.xValue === 'lwc') ? {height: '600px'} : {height: '400px'}}/>

        {!(this.state.AnalysisCondition.length !== 1 && this.state.showIntelligence) ? 
          <Collapse defaultActiveKey={['1']} style={{margin: '10px 0'}}>
            <Panel header="Trend chart 智能识别" key="1">
              <RiseChart xAxis={ this.state.riseChartxAxis } name={this.state.riseChartName} data={this.state.riseChartData}/>
            </Panel>
          </Collapse> : null}

        <StyleOperBtn>
          <Button
            type='primary'
            onClick={this.crossModuleAnalysis}
            disabled={formInline.xValue !== 'lwc' || AnalysisCondition.length !== 1}
          >
            Cross Module Analysis
          </Button>
          <Button
            type='primary'
            onClick={this.correlationAnalysis}
            disabled={formInline.xValue !== 'lwc' || AnalysisCondition.length !== 1}
          >
            Correlation Analysis
          </Button>
        </StyleOperBtn>
        

        {showCrossModule ? (
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
        ) : null}

        {showCorrelation ? (
          <CorrelationForm caWatProducts={caWatProducts} singleWaferKey={singleWaferKey} formInline={formInline}/>
        ) : null}
      </StyleChartSelection>
    )
  }
}

injectReducer('ChartSelection', reducer)
const mapStateToProps = state => ({
  ...state.Init,
  ...state.ChartSelection
})
const mapDispatchToProps = {
  changeChartSelected,
  changeChartWafers,
  changeChartParams
}
export default connect(mapStateToProps, mapDispatchToProps)(ChartSelection)
