/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { Form, Select, Tooltip, Checkbox, Button, Input, InputNumber, Modal, Icon, TreeSelect, message } from 'antd'
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import _ from 'lodash'
//按需导入
import echarts from 'echarts'
// import { injectReducer } from '@/utils/store'
import { delay } from '@/utils/web'
// import { changeForm, changeItems } from './action'
// import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'
import { getX, getX2n, getY, getChartData, getPcCmStep, getPcCm, getCaWatTreeData, searchCA } from './service'
import {
  StyleChartSelection,
  StyleTooltip,
  StyleChart,
  StyleOperBtn,
  StyleCrossModuleForm,
  StyleCorrelationForm,
  FormItemLabel
} from './style'
import CrossModuleChart from './component/CrossModuleChart'
import CorrelationChart from './component/CorrelationChart'

console.log(StyleChart, 'StyleChart')
let chart = null
let chartOpt = {};
class ChartSelection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartSelected: {},
      singleWaferKey: [],
      btns: [
        { content: 'Trend Chart', i: 'line-chart', func: 'trendChart' },
        { content: 'Bar Chart', i: 'bar-chart', func: 'barChart' },
        { content: 'Stack Bar Chart', i: 'database', func: 'stackBarChart' },
        { content: 'Box Chart', i: 'box-plot', func: 'boxChart' }
      ],
      selectedAction: 'line-chart',
      allBar: [],
      selectedBar: [],
      formInline: {
        xValue: 'lwc',
        x2ndValue: '',
        yValue: '100',
        normalized: ''
      },
      showLabel: [],
      yAxisOper: {
        min: 0,
        max: null,
        interval: null
      },
      x: {},
      x2n: {},
      y: {},
      Normalized: {
        all: 'All Defect',
        rb: 'Rough Bin',
        ab: 'ADC Bin',
        clu: 'Cluster',
        sdi: 'Sub Die ID',
        tid: 'Test ID',
        steps: 'Steps',
        zid: 'Zone ID'
      },
      resData: null,
      newData: null,
      selectData: null,
      newNoData: null,
      selectNoData: null,
      seriesType: 'line',
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
      caDataSources: ['Metrology', 'WAT', 'iEMS/FDC', 'CP'],
      caDataSource: [],
      caMetrologyProducts: ['a', 'b', 'c'],
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
  onChartLegendselected(params) {
    console.log(params,'1')
  }
  componentDidMount() {
    console.log('componentDidMount');
    const { name } = this.props
    const chartDom = document.getElementById(`chart-${name}`)
    if (chartDom) {
      chart = echarts.init(chartDom)
      chart.on('click', params => this.onChartClick(params))
      chart.on('legendselectchanged', params => this.onlegendselectchanged(params))
      // chart.on('brushselected', params => this.onChartLegendselected(params))
    } else {
      console.log('chartDom not found')
    }
    const singleWaferKey = [
      {
        lotId: 'B0001.000',
        stepId: 'M5_CMP',
        waferNo: '1',
        productId: 'Device01',
        scanTm: '2018-06-09 12:30:35',
        defects: [],
        defectIdRedisKey: '81fb0163-fa13-4f54-baec-4e8fceb32b6b'
      },
      {
        lotId: 'B0002.000',
        stepId: 'M1_CMP',
        waferNo: '1',
        productId: 'Device01',
        scanTm: '2018-06-01 12:30:35',
        defects: [],
        defectIdRedisKey: 'a6775cb9-dbd3-4184-8da8-21992756a93f'
      }
    ]
    this.setState({ singleWaferKey })
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

  onShowLabelChange = showLabel => {
    this.setState({ showLabel })
  }

  onChartInit = async () => {
    await delay(1)
    const { singleWaferKey, formInline } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const resData = await getChartData({
      singleWaferKey,
      canvas: { canvasSize: 400, magnification: 1, centralLocation: '200,200' },
      canvasSize: 400,
      magnification: 1,
      centralLocation: '200,200',
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
          allBar.push(item+'-'+jtem.name)
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
    this.setState({ formInline })
    this.onX2nInit()
    this.onYInit()
    this.onChartInit()
  }
  onX2nchange = x2ndValue => {
    const { formInline } = this.state
    formInline.x2ndValue = x2ndValue
    formInline.yValue = '100'
    this.setState({ formInline })
    this.onYInit()
    this.onChartInit()
  }
  onYchange = yValue => {
    const { y, formInline } = this.state
    formInline.yValue = yValue
    formInline.normalized = 'All Defect'
    this.setState({
      normShow: y[yValue] && y[yValue].includes('NORM') ? true : false,
      formInline
    })
    this.onChartInit()
  }
  onNormalizedChange = v => {
    const { formInline } = this.state
    formInline.normalized = v
    this.setState({ formInline })
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
    } else if (func === 'stackBarChart') {
      const { newData, newNoData } = this.state
      this.setState({
        selectedAction: 'database',
        seriesType: 'bar',
        ifStack: 'one',
        selectedBar: [],
        selectData: _.cloneDeep(newData),
        selectNoData: _.cloneDeep(newNoData)
      })
    } else if (func === 'boxChart') {
      this.setState({selectedAction: 'box-plot'})
    } else if (func === 'star') {
      this.setState({selectedAction: 'star'})
    } else if (func === 'star-o') {
      this.setState({selectedAction: 'star-o'})
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
      // this.syncWaferSelected({ page: this.name, wafers: this.singleWaferKey, selectedBar: bar })
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
    this.setState({AnalysisCondition: arr, chartSelected: data.selected})
  }

  onGenerateChartOption = async () => {
    const { resData, yAxisOper,chartSelected } = this.state
    if (!resData) return
    const opt = {
      legend: { type: 'scroll', selected: chartSelected },
      tooltip: { trigger: 'item' },
      dataset: { source: [] },
      xAxis: { type: 'category', data: [] },
      yAxis: {
        max: yAxisOper.max || null,
        min: yAxisOper.min || 0,
        interval: yAxisOper.interval || null
      },
      series: [],
      dataZoom: [{ show: true }]
    }
    opt.xAxis.data = resData.paretoValue.xAxisData
    let labelShow = false
    const { showLabel, selectedAction, selectData, selectNoData } = this.state
    if (showLabel.length > 0) {
      labelShow = true
    }
    // 处理数据
    if (selectedAction === 'star') {
      this.showLine(opt, labelShow, selectData)
    } else if (selectedAction === 'star-o') {
      this.showLine(opt, labelShow, selectNoData)
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
                show: labelShow,
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
    if (chart) chart.setOption(opt,true)
    let unSelectedBar = this.state.allBar.filter(item => {
      return !this.state.selectedBar.includes(item)
    })
    console.log(this.state.selectedBar, this.state.allBar, unSelectedBar)
  }
  // 折线图时，显示选中或非选中点
  showLine = (opt, labelShow, source) => {
    const seriesArr = []
    const { colorArr } = this.state
    colorArr.forEach(item => {
      seriesArr.push({
        connectNulls: true,
        type: 'line',
        itemStyle: { color: item },
        lineStyle: { color: item },
        label: {
          normal: { show: labelShow, position: 'top' }
        }
      })
    })
    console.log(seriesArr, source,'123')
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
    const { singleWaferKey } = this.state
    let res = await getPcCmStep({ singleWaferKey })
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
    const { singleWaferKey, formInline, filter, cmStepValue } = this.state
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
    const { singleWaferKey } = this.state
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
    const { singleWaferKey, caWat, caRegression, formInline, AnalysisCondition } = this.state
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
    const { formInline, x, x2n, y, Normalized, normShow } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const { btns, selectedAction } = this.state
    const { AnalysisCondition, showCrossModule, showCorrelation } = this.state
    const { cmStepData, cmStepValue, LineCharts } = this.state
    this.onGenerateChartOption()

    const {
      caDataSources,
      caDataSource,
      caMetrologyProducts,
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
        <Form layout='vertical' labelCol={{ span: 3 }}>
          <Form.Item>
            <FormItemLabel>X轴:</FormItemLabel>
            <Select onChange={this.onXchange} value={xValue} style={{ width: 120, marginRight: 10 }}>
              {Object.keys(x).map(key => (
                <Select.Option value={key} key={key}>
                  {x[key]}
                </Select.Option>
              ))}
            </Select>
            <FormItemLabel>2nd X:</FormItemLabel>
            <Select onChange={this.onX2nchange} value={x2ndValue} style={{ width: 120, marginRight: 10 }}>
              <Select.Option value={''}>None</Select.Option>
              {Object.keys(x2n).map(key => (
                <Select.Option value={key} key={key}>
                  {x2n[key]}
                </Select.Option>
              ))}
            </Select>
            <FormItemLabel>Y轴:</FormItemLabel>
            <Select onChange={this.onYchange} value={yValue} style={{ width: 120, marginRight: 10 }}>
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
                  defaultValue={normalized}
                  style={{ width: 60, marginRight: 10 }}
                  onChange={this.onNormalizedChange}
                >
                  {Object.keys(Normalized).map(key => (
                    <Select.Option value={Normalized[key]} key={key}>
                      {key}
                    </Select.Option>
                  ))}
                </Select>
              </>
            ) : null}
            <Checkbox.Group onChange={this.onShowLabelChange}>
              <Checkbox value='Show Value'>Show Value</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <FormItemLabel>Min:</FormItemLabel>
            <InputNumber
              onChange={value => this.onYAxisOperChange('min', value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <FormItemLabel>Max:</FormItemLabel>
            <InputNumber
              onChange={value => this.onYAxisOperChange('max', value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <FormItemLabel>Interval:</FormItemLabel>
            <InputNumber
              onChange={value => this.onYAxisOperChange('interval', value)}
              style={{ width: 120, marginRight: 10 }}
            />
          </Form.Item>
        </Form>

        <StyleTooltip>
          {btns.map(item => (
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
                <Checkbox.Group options={caDataSources} onChange={this.onCADataSourceChange} />
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
                    {caMetrologyProducts.map(item => (
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

// injectReducer('ChartSelection', reducer)
const mapStateToProps = state => ({
  ...state.Init
})
const mapDispatchToProps = {}
export default connect(mapStateToProps, mapDispatchToProps)(ChartSelection)
