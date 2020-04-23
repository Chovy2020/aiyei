import React from 'react'
import _ from 'lodash'
import { Collapse, Form, Select, Table, Input, InputNumber, Button, message, Icon, Popconfirm } from 'antd'
import { post  } from '@/utils/api'
import { delay } from '@/utils/web'
import { LOTHISTORYSELECTIONS, TRENDCHARTSELECTS } from './constant'
import { getHoldLotList, getMapPareto, getReportUrl, getPPTList, downloadPPT, getHistory } from './service'
import { StyleExcursion, StyleExcursionOperBtn } from './style'
import HoldLotList from './holdLotList.js'
import MapPareto from './mapPareto.js'
import LotHistory from './lotHistory.js'
import TrendChart from './trendChart.js'
import CrossModuleForm from './crossModuleFrom.js'
const { Panel } = Collapse
const { Option } = Select

class Excursion extends React.Component {
  constructor(props) {
    super(props)
    this.reportPara = {
      "waferKey":{
        "lotId":"F0001.000",
        "waferNo":"1",
        "productId":"Device01",
        "stepId":"001",
        "scanTm":"5"
      },
      "mp":{
        "map":"",
        "pareto":""
      },
      "lh": "10",
      "tc": "",
      "cm":[]
    }
    this.state = { 
      holdLotListArr: [],
      currentRow: {},
      rowRecord: [],
      defectSummaryObj: {},
      PPTList: [],
      lotHistoryValue: '10',
      historyArr: [],
      trendValue: '30',
      paretoPara: {}
    }
  }

  async componentDidMount() {
    const holdLotListArr = await getHoldLotList()
    this.onGetMapPareto(holdLotListArr[0].lotId, holdLotListArr[0].productId, holdLotListArr[0].stepId)
    this.onPPTList(holdLotListArr[0].lotId, holdLotListArr[0].productId, holdLotListArr[0].stepId)
    this.onGetHistory(holdLotListArr[0].lotId, holdLotListArr[0].productId, this.state.lotHistoryValue)
    this.setState({holdLotListArr, currentRow: holdLotListArr[0]})
  }

  // 获取Map和pareto数据
  onGetMapPareto = async (lotId, productId, stepId) => {
    const rowRecord = await getMapPareto(lotId, productId, stepId)
    this.setState({ rowRecord })
  }
  // 获取7Day PPT List数据
  onPPTList = async (lotId, productId, stepId) => {
    const PPTList = await getPPTList(lotId, productId, stepId)
    this.setState({ PPTList })
  }
  // 获取history
  onGetHistory = async (lotId, productId, lotHistoryValue) => {
    const historyArr = await getHistory(lotId, productId, lotHistoryValue)
    this.setState({ historyArr })
  }

  // 点击hold lot list行
  changeRow = async (record) => {
    this.setState({rowRecord: []})
    this.onGetMapPareto(record.lotId, record.productId, record.stepId)
    this.onPPTList(record.lotId, record.productId, record.stepId)
    this.onGetHistory(record.lotId, record.productId, this.state.lotHistoryValue)
    this.setState({ currentRow: record})
  }

  // 处理Defect Summary
  countDefectSummary = (data) => {
    const { defectSummaryObj }= this.state
    defectSummaryObj[Object.keys(data)[0]] = Object.values(data)[0]
    this.setState({ defectSummaryObj })
  }

  // lotHistory下拉框
  lotHistoryExtra = () => (
    <div onClick={event => {event.stopPropagation()}}>
      <Select style={{width: '100px',position: 'relative', top: '-4px'}}
        value={this.state.lotHistoryValue}
        onChange={this.changeLotHistoryValue}
      >
        {Object.keys(LOTHISTORYSELECTIONS).map(key => (
          <Select.Option value={key} key={key}>
            {LOTHISTORYSELECTIONS[key]}
          </Select.Option>
        ))}
      </Select>
    </div> 
  )
  changeLotHistoryValue = async (value) => {
    const { currentRow } = this.state
    this.reportPara.lh = value
    const historyArr = await getHistory(currentRow.lotId, currentRow.productId, value)
    this.setState({ historyArr, lotHistoryValue: value})
  }

  // trend下拉框
  trendExtra = () => (
    <div onClick={event => {event.stopPropagation()}}>
      <Select style={{width: '150px',position: 'relative', top: '-4px'}}
        value={this.state.trendValue}
        onChange={this.changeTrendValue}
      >
        {Object.keys(TRENDCHARTSELECTS).map(key => (
          <Select.Option value={key} key={key}>
            {TRENDCHARTSELECTS[key]}
          </Select.Option>
        ))}
      </Select>
    </div> 
  )
  changeTrendValue = async (value) => {
    this.setState({ trendValue: value})
    this.refs.trendChart.onChartInit()
  }

  changePareto = (data) => {
    this.setState({paretoPara: data.pareto})
  }

  // 下载PPT
  exportAllChart = async () => {
    this.reportPara.tc = this.refs.trendChart.exportChart()
    this.reportPara.cm = this.refs.crossModuleFrom ? this.refs.crossModuleFrom.emitUrl() : []
    const { rowRecord } = this.state
    console.log(rowRecord, 'rowRecord')
    if(rowRecord.length === 0) {
      this.reportPara.waferKey = {}
    } else {
      this.reportPara.waferKey = {
        "lotId": rowRecord[0].map.lotId,
        "waferNo": rowRecord[0].map.waferNo,
        "productId": rowRecord[0].map.productId,
        "stepId": rowRecord[0].map.stepId,
        "scanTm": rowRecord[0].map.scanTm
      }
    }
    await getReportUrl(this.reportPara)
    message.info('success')
    this.onPPTList(rowRecord[0].map.lotId, rowRecord[0].map.productId, rowRecord[0].map.stepId)
  }

  changeMP = (mp) => {
    this.reportPara.mp = mp
  }

  // 点击7day ppt list下载ppt
  downloadPPTItem = (data) => {
    downloadPPT(encodeURIComponent(data))
  }

  render() {
    const { holdLotListArr, rowRecord, PPTList, defectSummaryObj, historyArr, trendValue, paretoPara } = this.state
    return (
      <StyleExcursion>
        <Collapse defaultActiveKey={['1']}>
          <Panel header='Hold Lot List' key='1'>
            <HoldLotList holdLotListArr={holdLotListArr} emitRow={this.changeRow}/>
          </Panel>
        </Collapse>
        <StyleExcursionOperBtn>
          <Button type="primary" onClick={this.exportAllChart}>Generate Report</Button>
        </StyleExcursionOperBtn>
        {
          rowRecord.length === 0 ? '' : (
            <Collapse defaultActiveKey={['2']}>
              <Panel header='Map & Pareto' key='2'>
                {rowRecord.map((item, index) => (
                  <MapPareto ref={`singleMapPareto`} key={index} name={index+1} rowRecord={item} emitDefectSummary={this.countDefectSummary} changeMP={this.changeMP}/>
                ))}
                <div style={{display: 'flex'}}>
                  <div style={{width: '50%'}}>
                    <h3>Defect Summary:</h3>
                    {Object.keys(defectSummaryObj).map((key,index) => (
                      <div key={index} style={{display: 'flex'}}>
                        <p>{key}:</p>
                        { _.isEmpty(defectSummaryObj[key]) ? '' : (
                          <div>
                            {Object.keys(defectSummaryObj[key]).map((i, jndex) => (
                              <p key={jndex}>{i}: {defectSummaryObj[key][i]}</p>
                            ))}
                          </div>)
                        }
                      </div>
                    ))}
                  </div>
                  <div style={{width: '50%'}}>
                    <h3>Last 7 Day's cases:</h3>
                    { PPTList.map((item, index) => (
                      <p key={index} onClick={() => this.downloadPPTItem(item)} style={{color: '#1790ff', textDecoration: 'underline',cursor: 'pointer', display: 'inline-block'}} >{item}</p>
                    ))}
                  </div>
                </div>
              </Panel>
            </Collapse>
          )
        }

        <Collapse defaultActiveKey={['3']}>
          <Panel header='Lot History' key='3' extra={this.lotHistoryExtra()}>
            <LotHistory historyArr={historyArr}/>
          </Panel>
        </Collapse>

        <Collapse defaultActiveKey={['4']}>
          <Panel header='Trend Chart' key='4' extra={this.trendExtra()}>
            <TrendChart ref={`trendChart`} lastMonth={trendValue} emitPareto={this.changePareto}/>
          </Panel>
        </Collapse>

        {
          !_.isEmpty(paretoPara) && paretoPara['1stXCode'] === 'lwc' ? (
            <Collapse defaultActiveKey={['5']}>
              <Panel header='Cross Module Chart' key='5'>
                <CrossModuleForm ref="crossModuleFrom" lastMonth={trendValue} paretoPara={paretoPara}/>
              </Panel>
            </Collapse>
          ) : null
        }
        
        
      </StyleExcursion>
    )
  }
}

export default Excursion
