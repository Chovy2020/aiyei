/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Select, Tooltip, Checkbox, Button, Input, InputNumber, Modal, Icon, TreeSelect, message } from 'antd'
import _ from 'lodash'
import echarts from 'echarts'
import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
import { changeChartSelected, changeChartWafers, changeChartParams } from './action'
import { BUTTONS, CA_DATA_SOURCES, NORMALIZED, CA_METROLOGY_PRODUCTS } from './constant'
import reducer from './reducer'
import { getX, getX2n, getY, getChartData, getPcCmStep, getPcCm, getCaWatTreeData, searchCA } from './service'
import { StyleChartSelection, StyleTooltip, StyleChart, StyleOperBtn, StyleCrossModuleForm, StyleCorrelationForm, FormItemLabel } from './style'
import CrossModuleChart from './component/CrossModuleChart'
import CorrelationChart from './component/CorrelationChart'

let chart = null
let chartOpt = {}

class ChartSelection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartSelecting: {},
      singleWaferKey: [],
      selectedAction: 'bar-chart',
      allBar: [],
      selectedBar: [],
      formInline: {
        xValue: 'lwc',
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
      resData: null,
      newData: null,
      selectData: null,
      newNoData: null,
      selectNoData: null,
      seriesType: 'bar',
      ifStack: '',
      colorArr: [],
      tips: [],
      AnalysisCondition: [],
      normShow: false,
      showCrossModule: false,
      showCorrelation: false,
      boxChartData: [],
      cmStepData: null,
      cmStepValue: [],
      /* LineCharts */
      LineCharts: [],
      /* Correlation Analysis */
      caDataSource: [],
      caMetrologySteps: [],
      caMetrologyParameters: [],
      caMetrology: {
        product: [],
        step: [],
        parameter: []
      },
      caWatTreeData: null,
      caWatProducts: [],
      caWat: {
        product: [],
        tree: []
      },
      caCpProducts: [],
      caCpBins: [],
      caCp: {
        product: [],
        bin: []
      },
      caIFTools: [],
      caIFParameters: [],
      caIFTimeRages: [],
      caIF: {
        tool: [],
        parameter: [],
        timeRage: []
      },
      caRegression: {
        checked: false,
        value: 0
      },
      caCharts: []
    }
  }

  // /api/swp/defects
  changeChartParamsBar = bars => {
    const { chartParams, name } = this.props
    const params = chartParams[name] || {}
    params.bars = bars || []
    this.props.changeChartParams({ name, params})
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
    // 将页面传递的wafers(or bars) 存储在当前页面，后续该页面addTab需要使用(当前页面无选择操作，追溯前一个页面的wafers)
    let { wafers, name } = this.props
    if (wafers.length === 0) {
      wafers = [
        {
          lotId: "B0001.000",
          stepId: "M4_CMP",
          waferNo: "1",
          productId: "Device01",
          scanTm: "2018-06-07 12:30:35",
          defects: [],
          defectCache: "5255f356-0558-414c-ba28-6a4a88774f0e"
        },
        // {
        //   lotId: "B0001.000",
        //   stepId: "M1_CMP",
        //   waferNo: "1",
        //   productId: "Device01",
        //   scanTm: "2018-05-31 12:30:35",
        //   defects: [],
        //   defectCache: "f87bae15-d431-474b-8f4e-e6f6b9babab6"
        // }
      ]
    }
    this.props.changeChartWafers({ name, wafers })
    const chartDom = document.getElementById(`chart-${name}`)
    if (!chartDom) {
      message.error('chartDom not found')
      return
    }
    chart = echarts.init(chartDom)
    chart.on('click', params => this.onChartClick(params))
    chart.on('legendselectchanged', params => this.onlegendselectchanged(params))
    this.onXInit()
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
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
    this.setState({
      resData,
      showCrossModule: false,
      showCorrelation: false
    })
    this.dealData()
  }
  dealData = () => {
    const arr = []
    const arrNo = []
    const colorArr = []
    let AnalysisCondition = []
    const kData = []
    const allBar = []
    arr[0] = ['product']
    arrNo[0] = ['product']
    const { resData } = this.state
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
        colorArr.push('#' + this.getColor(item.name))
        item.data.forEach((jtem, j) => {
          arr[j + 1].push(jtem)
          arrNo[j + 1].push(null)
          kData[j].push(jtem)
        })
      })
    }
    // 计算box图数据
    const boxArr = []
    kData.forEach(item => {
      const sortItem = _.cloneDeep(item).sort()
      const len = sortItem.length
      const min = sortItem[0]
      const max = sortItem[len - 1]
      const math25 = sortItem[Math.floor(len / 4)]
      const math75 = len > 3 ? sortItem[Math.ceil((len * 3) / 4)] : max
      boxArr.push([math25, math75, min, max])
    })
    this.setState({
      colorArr,
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
    this.setState({ formInline,selectedAction: 'bar-chart',seriesType: 'bar',ifStack: '', })
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
  }
  onX2nchange = x2ndValue => {
    const { formInline } = this.state
    formInline.x2ndValue = x2ndValue
    formInline.yValue = '100'
    this.setState({ formInline,selectedAction: 'bar-chart',seriesType: 'bar',ifStack: '', })
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
      selectedAction: 'bar-chart',seriesType: 'bar',ifStack: '',
    })
    this.onChartInit()
  }
  onNormalizedChange = v => {
    const { formInline } = this.state
    formInline.normalized = v
    this.setState({ formInline,selectedAction: 'bar-chart',seriesType: 'bar',ifStack: '', })
    this.onChartInit()
  }
  onYAxisOperChange = (key, value) => {
    const { yAxisOper } = this.state
    yAxisOper[key] = parseInt(value)
    this.setState({ yAxisOper })
  }
  // 切换图表
  onDoAction = func => {
    if (func === 'trendChart') {
      const { selectedAction } = this.state
      if (selectedAction !== 'star' && selectedAction !== 'star-o') {
        this.setState({ selectedBar: [] })
        this.changeChartParamsBar([])
      }
      this.setState({
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
      this.changeChartParamsBar([])
    } else if (func === 'stackBarChart') {
      const { newData, newNoData, resData } = this.state
      console.log(resData.paretoValue.series)
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
    } else if (func === 'star') {
      this.setState({ selectedAction: 'star' })
    } else if (func === 'star-o') {
      this.setState({ selectedAction: 'star-o' })
    }
  }
  // lineChart和barChart时, 点击列表显示或隐藏
  onChartClick = async data => {
    const { selectedAction, newData } = this.state
    if (['line-chart', 'bar-chart', 'database'].includes(selectedAction)) {
      const { selectedBar } = this.state
      data.seriesName = data.seriesName.substring(0, 6) === 'series' ? '' : data.seriesName
      const index = selectedBar.indexOf(data.name + '-' + data.seriesName)
      if (~index) {
        selectedBar.splice(index, 1)
      } else {
        selectedBar.push(data.name + '-' + data.seriesName)
      }
      this.setState({ selectedBar })
      this.changeChartParamsBar(selectedBar)
    }
    if (selectedAction === 'line-chart') {
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
  }

  onGenerateChartOption = async () => {
    const { resData, yAxisOper, chartSelecting } = this.state
    if (!resData) return
    const opt = {
      legend: { type: 'scroll', selected: chartSelecting },
      tooltip: { trigger: 'item' },
      color: this.state.colorArr,
      dataset: { source: [] },
      xAxis: { type: 'category',data: [] },
      yAxis: {
        max: yAxisOper.max || null,
        min: yAxisOper.min || 0,
        interval: yAxisOper.interval || null
      },
      // series: [],
      dataZoom: [{ show: true }]
    }
    opt.xAxis.data = resData.paretoValue.xAxisData
    const { showLabel, selectedAction, selectData, selectNoData } = this.state
    // 处理数据
    if (selectedAction === 'star') {
      this.showLine(opt, showLabel, selectData)
    } else if (selectedAction === 'star-o') {
      this.showLine(opt, showLabel, selectNoData)
    } else if (selectedAction === 'box-plot') {
      const { boxChartData } = this.state
      opt.series = [
        {
          type: 'k',
          data: boxChartData
        }
      ]
      opt.dataset.source = []
    } else {
      const seriesArr = []
      const { colorArr, selectedBar, seriesType, ifStack, newData } = this.state
      if (resData.paretoValue.xAxisData.length && resData.paretoValue.series.length) {
        colorArr.forEach(item => {
          seriesArr.push({
            type: seriesType,
            stack: ifStack,
            itemStyle: {
              color: param => {
                param.seriesName = param.seriesName.substring(0, 6) === 'series' ? '' : param.seriesName
                const idx = selectedBar.indexOf(param.name + '-' + param.seriesName)
                return ~idx ? '#ccc' : item
              }
            },
            lineStyle: { color: item },
            label: {
              normal: {
                show: showLabel,
                position: 'top'
              }
            }
          })
        })
      }
      // 填充值
      opt.series = seriesArr
      opt.dataset.source = _.cloneDeep(newData)
    }
    // console.log(opt)
    chartOpt = opt
    if (chart) chart.setOption(opt, true)
    // let unSelectedBar = this.state.allBar.filter(item => {
    //   return !this.state.selectedBar.includes(item)
    // })
    // console.log(this.state.selectedBar, this.state.allBar, unSelectedBar)
  }
  // 折线图时，显示选中或非选中点
  showLine = (opt, showLabel, source) => {
    const seriesArr = []
    const { colorArr } = this.state
    colorArr.forEach(item => {
      seriesArr.push({
        connectNulls: true,
        type: 'line',
        itemStyle: { color: item },
        lineStyle: { color: item },
        label: {
          normal: { show: showLabel, position: 'top' }
        }
      })
    })
    // console.log(seriesArr, source, '123')
    // 填充值
    opt.series = seriesArr
    opt.dataset.source = source
  }

  // 随机生成颜色
  getColor = str => {
    let hash = 1315423911
    for (let i = str.length - 1; i >= 0; i--) {
      let ch = str.charCodeAt(i)
      hash ^= (hash << 5) + ch + (hash >> 2)
    }
    return (hash & 0x7fffff).toString(16)
  }

  /* crossModuleForm */
  crossModuleAnalysis = () => {
    this.setState({ showCrossModule: true })
    this.onCMInit()
  }
  correlationAnalysis = () => {
    this.setState({ showCorrelation: true })
    this.onCAInit()
  }
  onCMInit = async () => {
    await delay(1)
    const singleWaferKey = this.getWafers()
    const res = await getPcCmStep({ singleWaferKey })
    if (res) {
      // res = _.uniq(res)
      const cmStepData = []
      for (const i in res) {
        const obj = {
          title: i,
          value: i,
          key: i,
          selectable: false,
          children: []
        }
        for (const j in res[i]) {
          obj.children.push({
            title: j,
            value: j,
            key: `${i}-${j}`,
            selectable: false,
            children: res[i][j].map(item => {
              return {
                title: item,
                value: item,
                key: `${i}-${j}-${item}`
              }
            })
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
    const { formInline, filter, cmStepValue } = this.state
    const singleWaferKey = this.getWafers()
    const filter1 = {}
    filter1[formInline.x2ndValue] = filter
    const res = await getPcCm({
      singleWaferKey,
      filter: filter1,
      flowStep: cmStepValue
    })
    if (res && res.series) {
      const series = []
      res.series.forEach(item => {
        series.push({
          type: item.name,
          data: item.data,
          remark: item.remark
        })
      })
      const { LineCharts } = this.state
      LineCharts.push({
        series,
        xAxis: {
          data: res.xAxisData
        },
        yAxis: null
      })
      this.setState({ LineCharts })
    }
  }
  onCMremove = index => {
    const { LineCharts } = this.state
    LineCharts.splice(index, 1)
    this.setState({ LineCharts })
  }

  /* Correlation Analysis */
  onCAInit = async () => {
    const singleWaferKey = this.getWafers()
    let res = await getCaWatTreeData({ singleWaferKey })
    if (res) {
      const caWatTreeData = []
      for (const i in res) {
        const arr = _.uniq(res[i])
        caWatTreeData.push({
          title: i,
          value: i,
          key: i,
          selectable: false,
          children: arr.map(item => {
            return {
              title: item,
              value: item,
              key: `${i}-${item}`
            }
          })
        })
      }
      this.setState({ caWatTreeData })
    }
  }
  onCADataSourceChange = caDataSource => {
    this.setState({ caDataSource })
  }
  onCAMetrologyChange = (key, value) => {
    const { caMetrology } = this.state
    caMetrology[key] = value
    this.setState({ caMetrology })
  }
  onCAWatProductChange = value => {
    const { caWat } = this.state
    caWat.product = value
    this.setState({ caWat })
  }
  onCACPChange = (key, value) => {
    const { caCp } = this.state
    caCp[key] = value
    this.setState({ caCp })
  }
  onCAWatTreeChange = value => {
    const { caWat } = this.state
    caWat.tree = value
    this.setState({ caWat })
  }
  onCAIFChange = (key, value) => {
    const { caIF } = this.state
    caIF[key] = value
    this.setState({ caIF })
  }
  onCARegressionChange = (key, value) => {
    const { caRegression } = this.state
    caRegression[key] = value
    this.setState({ caRegression })
  }
  onCASearch = async () => {
    const { caWat, caRegression, formInline } = this.state
    const singleWaferKey = this.getWafers()
    const correlation = {
      wat: caWat.tree
    }
    if (caRegression.checked) correlation.greaterThanValue = caRegression.value
    const filter = {
      add: ['Y']
    }
    // filter[formInline.x2ndValue] = AnalysisCondition
    const pareto = {
      '1stXCode': formInline.xValue,
      '2ndXCode': formInline.x2ndValue,
      yCode: formInline.yValue
    }
    const caCharts = await searchCA({
      singleWaferKey,
      filter,
      pareto,
      correlation
    })
    this.setState({ caCharts })
  }
  onCAReset = () => {
    this.setState({
      caDataSource: [],
      caMetrology: {
        product: [],
        step: [],
        parameter: []
      },
      caWat: {
        product: [],
        tree: []
      },
      caCp: {
        product: [],
        bin: []
      },
      caIF: {
        tool: [],
        parameter: [],
        timeRage: []
      },
      caRegression: {
        value: false,
        filter: 0
      }
    })
  }

  render() {
    const { name } = this.props
    const { formInline, x, x2n, y, normShow, showLabel } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const { selectedAction } = this.state
    const { AnalysisCondition, showCrossModule, showCorrelation } = this.state
    const { cmStepData, cmStepValue, LineCharts } = this.state
    this.onGenerateChartOption()

    const {
      caDataSource,
      caMetrologySteps,
      caMetrologyParameters,
      caWatProducts,
      caWat,
      caWatTreeData,
      caCpProducts,
      caCpBins,
      caIFTools,
      caIFParameters,
      caIFTimeRages,
      caCharts
    } = this.state

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
            <Checkbox checked={showLabel} onChange={e => this.setState({ showLabel: e.target.checked })}>Show Value</Checkbox>
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
          {['star', 'star-o', 'line-chart'].includes(selectedAction) ? (
            <div>
              <Tooltip className='item' placement='top' title='显示选中'>
                <Icon
                  onClick={() => this.onDoAction('star')}
                  className={`fa ${selectedAction === 'star' ? 'checked' : ''}`}
                  type='check-circle'
                />
              </Tooltip>
              <Tooltip className='item' placement='top' title='显示非选中'>
                <Icon
                  onClick={() => this.onDoAction('star-o')}
                  className={`fa ${selectedAction === 'star-o' ? 'checked' : ''}`}
                  type='close-circle'
                />
              </Tooltip>
            </div>
          ) : null}
        </StyleTooltip>

        <StyleChart id={`chart-${name}`} />

        <StyleOperBtn>
          <Button type='primary' onClick={this.crossModuleAnalysis}>
            Trend chart 智能识别
          </Button>
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
          <StyleCorrelationForm>
            <h4>Correlation Analysis</h4>
            <Form layout='vertical' labelCol={{ span: 2 }}>
              <Form.Item label='Data Source:'>
                <Checkbox.Group options={CA_DATA_SOURCES} onChange={this.onCADataSourceChange} />
              </Form.Item>
              {caDataSource.includes('Metrology') ? (
                <Form.Item label='Metrology:'>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCAMetrologyChange('product', v)}
                  >
                    {CA_METROLOGY_PRODUCTS.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCAMetrologyChange('step', v)}
                  >
                    {caMetrologySteps.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCAMetrologyChange('parameter', v)}
                  >
                    {caMetrologyParameters.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null}
              {caDataSource.includes('WAT') ? (
                <Form.Item label='WAT:'>
                  <Select
                    allowClear
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={this.onCAWatProductChange}
                  >
                    {caWatProducts.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                  <TreeSelect
                    style={{ width: 610, marginLeft: 10 }}
                    value={caWat.tree}
                    allowClear
                    multiple
                    treeDefaultExpandAll
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={caWatTreeData}
                    placeholder='Please select'
                    onChange={this.onCAWatTreeChange}
                  />
                </Form.Item>
              ) : null}
              {caDataSource.includes('iEMS/FDC') ? (
                <Form.Item label='iEMS/FDC:'>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCAIFChange('tool', v)}
                  >
                    {caIFTools.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCAIFChange('parameter', v)}
                  >
                    {caIFParameters.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCAIFChange('timeRage', v)}
                  >
                    {caIFTimeRages.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null}
              {caDataSource.includes('CP') ? (
                <Form.Item label='CP:'>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCACPChange('product', v)}
                  >
                    {caCpProducts.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                  <Select
                    allowClear
                    mode='multiple'
                    style={{ width: 300 }}
                    placeholder='Please select'
                    onChange={v => this.onCACPChange('bin', v)}
                  >
                    {caCpBins.map(item => (
                      <Select.Option key={item}>{item}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null}
              <Form.Item label='Regression:'>
                <Checkbox onChange={e => this.onCARegressionChange('checked', e.target.value)}>
                  Filter in R-Squared >=
                </Checkbox>
                <InputNumber min={0} max={1} step={0.01} onChange={v => this.onCARegressionChange('value', v)} />
              </Form.Item>
              <Form.Item label=' '>
                <Button onClick={this.onCASearch} type='primary'>
                  Search
                </Button>
                <Button onClick={this.onCAReset} type='danger'>
                  Reset
                </Button>
              </Form.Item>
            </Form>
            {caCharts.map((chart, index) => (
              <CorrelationChart data={chart} name={name} key={index} index={index} />
            ))}
          </StyleCorrelationForm>
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
