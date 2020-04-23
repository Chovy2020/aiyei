import React from 'react'
import _ from 'lodash'
import {  Select, Button, Modal } from 'antd'
import Highlighter from 'react-highlight-words'
import moment from 'moment'
import { StyleMapPareto, StyleMPOper } from './style'
import { post, download  } from '@/utils/api'
import { delay } from '@/utils/web'
import { getY, changeMapPareto, getMoreMap } from './service'
import Map from './MapPareto/Map.js'
import Pareto from './MapPareto/pareto.js'
import ImgList from './MapPareto/imgList.js'
import MoreMap from './MapPareto/moreMap.js'

class MapPareto extends React.Component {
  constructor(props) {
    super(props)
    this.transUrls = {}
    this.state = { 
      changeData: {},
      moreMapData: [],
      selectedBar: [],
      yObj: {},
      yValue: '100',
      visible: false,
      mp: {}
    }
  }

  componentDidMount() {
    this.init()
  }

  init = async () => {
    const mapData = this.props.rowRecord.map
    const yObj = await getY()
    const moreMapData = await getMoreMap(mapData.lotId, mapData.waferNo, mapData.productId)
    this.setState({ yObj, moreMapData })
    this.countSummary(this.props.rowRecord)
  }

  // yValue改变
  yValueChange = async (value) => {
    const mapData = this.props.rowRecord.map
    const changeData = await changeMapPareto(mapData.lotId, mapData.waferNo, mapData.productId, mapData.stepId, value)
    this.setState({ yValue: value, changeData, selectedBar: [] })
    this.countSummary(changeData)
  }

  // Defect Summary
  countSummary = (summaryData) => {
    let obj = {
      [`Defect${this.props.name}`]: {}
    }
    const waferNo = summaryData.map.waferNo
    const xAxis = summaryData.pareto.paretoValue.xAxisData
    const data = summaryData.pareto.paretoValue.series[0].data
    const spec = summaryData.pareto.paretoValue.series[0].spec 
    spec.forEach((item, index) => {
      if(item !== null && item < data[index]) {
        obj[`Defect${this.props.name}`][xAxis[index]] = `#${waferNo}-${this.state.yObj[this.state.yValue]}-${data[index]}`
      }
    })
    this.props.emitDefectSummary(obj)
  }

  // exportAllChart = () => {
  //   this.refs.map.exportChart()
  //   this.refs.pareto.exportChart()
  // }

  changeEmitUrl = (url) => {
    this.transUrls = {...this.transUrls, ...url}
    if(Object.keys(this.transUrls).length === 2) {
      this.props.changeMP(this.transUrls)
    }
  }

  changeSelectedBar = (data) => {
    this.setState({selectedBar : data})
  }
  // More Map
  moreMap = () => {
    this.setState({visible: true})
  }

  handleCancel = () => {
    this.setState({visible: false})
  }

  render() {
    const rowRecord = _.isEmpty(this.state.changeData) ? this.props.rowRecord : this.state.changeData
    const mapData = rowRecord.map
    const paretoData = rowRecord.pareto
    const imgInfo = rowRecord.pareto.paretoValue.series[0].imgInfo
    const { selectedBar, yValue, yObj, moreMapData } = this.state
    return (
      <div>
        <StyleMapPareto>
          <StyleMPOper>
            <div>
              W#{rowRecord.map.waferNo}
              <Select style={{width: '300px'}}
                value={yValue}
                onChange={this.yValueChange}
              >
                {Object.keys(yObj).map(key => (
                  <Select.Option value={key} key={key}>
                    {yObj[key]}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <Button type="link" onClick={this.moreMap}>More>></Button>
          </StyleMPOper>
          <div style={{display: 'flex', width: '100%'}}>
            <Map mapData={ mapData } emitUrl={this.changeEmitUrl} selectedBar = {selectedBar} ref={`map`}/>
            <div style={{width: 'calc(100% - 402px)'}}>
              <ImgList imgInfo={imgInfo}/>
              <Pareto paretoData={ paretoData } selectedBar = {selectedBar} emitSelectedBar={this.changeSelectedBar} emitUrl={this.changeEmitUrl} ref={`pareto`}/>
            </div>
          </div>
        </StyleMapPareto>
        <Modal
          title="More Map"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <MoreMap moreMapData={moreMapData}/>
        </Modal>
      </div>
      
    )
  }
}

export default MapPareto

