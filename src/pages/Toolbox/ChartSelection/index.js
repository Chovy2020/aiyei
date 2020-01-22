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
  StyleCorrelationForm
} from './style'
import CrossModuleChart from './component/CrossModuleChart'

let chart = null
const CA_DATA_MAPPING = { WAT: 'wat' }

class ChartSelection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      singleWaferKey: [],
      btns: [
        { content: 'Trend Chart', i: 'line-chart', func: 'trendChart' },
        { content: 'Bar Chart', i: 'bar-chart', func: 'barChart' },
        { content: 'Stack Bar Chart', i: 'database', func: 'stackBarChart' },
        { content: 'Box Chart', i: 'box-plot', func: 'boxChart' }
      ],
      selectedAction: 'line-chart',
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
      series: [
        {
          type: 'line',
          label: {
            show: true,
            position: 'top',
            formatter: this.formatter
          }
        }
      ],
      seriesType: 'line',
      ifStack: '',
      colorArr: [],
      addRemark: false,
      remark: '',
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

  componentDidMount() {
    const { name } = this.props
    const chartDom = document.getElementById(`chart-${name}`)
    if (chartDom) {
      chart = echarts.init(chartDom)
      chart.on('click', params => this.onChartClick(params))
      chart.on('dblclick', params => this.onChartDbclick(params))
    } else {
      console.log('chartDom not found')
    }
    const singleWaferKey = [
      {
        lotId: 'B0001.000',
        stepId: 'P1_ASI',
        waferNo: '1',
        productId: 'Device01',
        scanTm: '2018-06-05 12:30:35',
        defects: [],
        defectIdRedisKey: '35f83fe7-c255-4c59-87b8-b02a9272f66e'
      },
      {
        lotId: 'B0001.000',
        stepId: 'M3_CMP',
        waferNo: '1',
        productId: 'Device01',
        scanTm: '2018-06-05 12:30:35',
        defects: [],
        defectIdRedisKey: '5862214d-7a94-456f-9c80-3fe8cd7d392e'
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
    const AnalysisCondition = []
    const kData = []
    arr[0] = ['product']
    arrNo[0] = ['product']
    const { resData } = this.state
    if (resData.paretoValue.xAxisData.length > 0 && resData.paretoValue.series.length > 0) {
      resData.paretoValue.xAxisData.forEach((item, index) => {
        arr[index + 1] = [item]
        arrNo[index + 1] = [item]
        kData.push([])
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
    // console.log('onYAxisOperChange', value)
    yAxisOper[key] = parseInt(value)
    this.setState({ yAxisOper })
  }

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
      this.setState({
        selectedAction: 'cube',
        series: [
          {
            type: 'k',
            data: [
              [20, 30, 10, 35],
              [40, 35, 30, 55],
              [33, 38, 33, 40],
              [40, 40, 32, 42]
            ]
          }
        ]
      })
    }
  }

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

  onChartDbclick = data => {
    const { tips } = this.state
    const index = data.dataIndex
    let remark = ''
    if (tips[index]) {
      remark = tips[index]
    }
    this.setState({
      addRemark: true,
      index,
      remark
    })
  }

  onGenerateChartOption = async () => {
    const { resData, yAxisOper } = this.state
    if (!resData) return
    const opt = {
      legend: { type: 'scroll' },
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
    } else if (selectedAction === 'cube') {
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
    if (chart) chart.setOption(opt)
  }
  // 折线图时，显示选中或非选中点
  showLine = (opt, labelShow, source) => {
    // console.log('showLine', opt, labelShow, source)
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

  onAddRemarkOk = () => {
    const { tips, index, remark } = this.state
    tips[index] = remark
    this.setState({
      addRemark: false,
      tips,
      remark: ''
    })
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
    const res = await getPcCmStep({ singleWaferKey })
    if (res) {
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

  onBarClear = () => {}

  /* Correlation Analysis */
  onCAInit = async () => {
    const { singleWaferKey } = this.state
    const res = await getCaWatTreeData({ singleWaferKey })
    if (res) {
      const caWatTreeData = []
      for (const i in res) {
        caWatTreeData.push({
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
    const filter = {}
    filter[formInline.x2ndValue] = AnalysisCondition
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
      },
    })
  }

  render() {
    const { name } = this.props
    const { formInline, x, x2n, y, Normalized, normShow } = this.state
    const { xValue, x2ndValue, yValue, normalized } = formInline
    const { btns, selectedAction, addRemark, remark } = this.state
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
      caIFTimeRages
    } = this.state

    return (
      <StyleChartSelection>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item>
            <span>X轴:</span>
            <Select onChange={this.onXchange} value={xValue} style={{ width: 120, marginRight: 10 }}>
              {Object.keys(x).map(key => (
                <Select.Option value={key} key={key}>
                  {x[key]}
                </Select.Option>
              ))}
            </Select>
            <span>2nd X:</span>
            <Select onChange={this.onX2nchange} value={x2ndValue} style={{ width: 120, marginRight: 10 }}>
              {Object.keys(x2n).map(key => (
                <Select.Option value={key} key={key}>
                  {x2n[key]}
                </Select.Option>
              ))}
            </Select>
            <span>Y轴:</span>
            <Select onChange={this.onYchange} value={yValue} style={{ width: 120, marginRight: 10 }}>
              {Object.keys(y).map(key => (
                <Select.Option value={key} key={key}>
                  {y[key]}
                </Select.Option>
              ))}
            </Select>
            {normShow ? (
              <div>
                <span>Normalized by:</span>
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
              </div>
            ) : null}
            <Checkbox.Group onChange={this.onShowLabelChange}>
              <Checkbox value='Show Value'>Show Value</Checkbox>
              <Checkbox value='Show Common'>Show Common</Checkbox>
            </Checkbox.Group>
            <Button onClick={this.onBarClear} type='dashed'>
              Clear
            </Button>
          </Form.Item>
          <Form.Item label='操作Y轴:'>
            <span>Min:</span>
            <Input
              onChange={e => this.onYAxisOperChange('min', e.target.value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <span>Max:</span>
            <Input
              onChange={e => this.onYAxisOperChange('max', e.target.value)}
              style={{ width: 120, marginRight: 10 }}
            />
            <span>Interval:</span>
            <Input
              onChange={e => this.onYAxisOperChange('interval', e.target.value)}
              style={{ width: 120, marginRight: 10 }}
            />
          </Form.Item>
        </Form>

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
          {['star', 'star-o', 'line-chart'].includes(selectedAction) ? (
            <>
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
            </>
          ) : null}
        </StyleTooltip>

        <StyleChart id={`chart-${name}`} />

        <Modal
          title='添加备注'
          visible={addRemark}
          onOk={this.onAddRemarkOk}
          onCancel={() => this.setState({ addRemark: false })}
          okText='确认'
          cancelText='取消'
        >
          <Input onChange={e => this.setState({ remark: e.target.value })} value={remark} />
        </Modal>

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
                style={{ width: 'calc(100% - 110px)' }}
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
              <CrossModuleChart name={name} data={data} index={index} key={index} />
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
                <Button onClick={this.onCASearch} type='primary'>Search</Button>
                <Button onClick={this.onCAReset} type='danger'>Reset</Button>
              </Form.Item>
            </Form>
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
