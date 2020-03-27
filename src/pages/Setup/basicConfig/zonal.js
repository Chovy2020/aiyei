import React from 'react'
import _ from 'lodash'
import echarts from 'echarts'
import { Form, Radio, Input, InputNumber, Select, Button, Modal, message, Table, Popconfirm, Icon } from 'antd'
import { delay } from '@/utils/web'
import moment from 'moment'
import { getZone, updateZone } from './service'
import { LayoutInline, LayoutVertical, DiePitch, StyleCluster } from './style'

const { Option } = Select
const { Column } = Table

class HorizontalLoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      pieChart: null,
      cfgDbPrimaryKeys: '',
      productStepId: [],
      productId: '',
      stepId: '',
      visible: false,
      addSubdieProduct: '',
      addSubdieStepId: '',
      tableData: [],
      annularZone: 1,
      radialZone: 1,
      radial: 360,
      radiusArr: [{ seq: 1, value: '' }],
      theaterArr: [{ seq: 1, value: '' }],
      generateType: '',
      waferSize: '',
      zones: null }
  }

  componentDidMount() {
    getZone({}).then(data => {
      const arr = []
      data.forEach(item => {
        arr.push({ productId: item.productId, stepId: item.stepId })
      })
      this.setState({ productStepId: arr })
    })
  }

  showModal = () => {
    this.setState({ visible: true, addSubdieProduct: '', addSubdieStepId: '' })
  }

  handleOk = () => {
    const { addSubdieProduct, addSubdieStepId, productStepId } = this.state
    if (addSubdieProduct !== '' && addSubdieStepId !== '') {
      const newData = { productId: addSubdieProduct, stepId: addSubdieStepId }
      this.setState({ visible: false, productStepId: [...productStepId, newData], cfgDbPrimaryKeys: `${addSubdieProduct}-${addSubdieStepId}` })
      console.log(productStepId)
      updateZone({
        "cfgZoneDefinitions": [{
          "waferSize": 150,
          "generateType": 'Automatic',
          "annular": 1,
          "zoneCount": 1,
          "productId": addSubdieProduct, 
          "stepId": addSubdieStepId,
          "technology": "default",
          "createBy": "XRJ",
          "remarks": null,
          "updateTm": moment().format('YYYY-MM-DD HH:mm:ss') }]})
    } else {
      message.warning('Product和Step Id不能为空')
    }
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  changeCfgDbPrimaryKeys = e => {
    this.setState({ cfgDbPrimaryKeys: `${[this.state.productStepId[e]].productId}-${[this.state.productStepId[e]].stepId}` })
    getZone({ cfgDbPrimaryKeys: [this.state.productStepId[e]] }).then(res => {
      if(res.length) {
        this.setState({ 
          waferSize: res[0].waferSize, 
          generateType: res[0].generateType,
          annularZone: res[0].generateType === 'Manual' ? 1 : res[0].annular,
          radialZone: res[0].generateType === 'Manual' ? 1 : res[0].zoneCount,
          productId: res[0].productId,
          stepId: res[0].stepId,
          zones: res[0].generateType === 'Manual' ? res[0].zones : null
        })
        if(res[0].generateType === 'Manual' && res[0].zones !== null) {
          let radiusGroup = []
          let theaterGroup = []
          res[0].zones.forEach(item => {
            radiusGroup.splice(0,0,...item.radius.split("-"))
            theaterGroup.splice(0,0,...item.central.split("-"))
          })
          let newRadiusGroup = [...new Set(radiusGroup)].sort((a,b) => a-b) 
          let newTheaterGroup = [...new Set(theaterGroup)].sort((a,b) => a-b) 
          let radiusArr = []
          let theaterArr = []
          newRadiusGroup.forEach((item, index) => {
            if(index) {
              radiusArr.push({seq: index, value: item/1000})
            }
          })
          newTheaterGroup.forEach((item, index) => {
            theaterArr.push({seq: index+1, value: item})
          })
          this.setState({radiusArr,theaterArr})
        }
        this.drawPie()
      }
    })

  }

  changeSubProduct = e => {
    this.setState({ addSubdieProduct: e.target.value })
  }

  changeSubStepId = e => {
    this.setState({ addSubdieStepId: e.target.value })
  }

  addTable = (arr, objName) => {
    let seq = arr[arr.length - 1].seq
    let newRow = { seq: seq + 1,value: '' }
    this.setState({ [objName]: [...arr, newRow] })
  }

  handleDelete = (seq, arr, objName) => {
    let newRow = _.cloneDeep(arr)
    newRow.splice(seq-1, 1)
    let newArr = newRow.map((item, index) => {
      return {seq: index+1, value: item.value}
    })
    this.setState({[objName]: newArr})
  }

  changeCell = (value, id, cellName) => {
    const newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id - 1][cellName] = value
    this.setState({ tableData: newTableData })
  }

  changeValue = (value, id) => {
    const arr = _.cloneDeep(this.state.radiusArr)
    arr[id - 1].value = value
    this.setState({ radiusArr: arr })
  }

  changeTheaterValue = (value, id) => {
    const arr = _.cloneDeep(this.state.theaterArr)
    arr[id - 1].value = value
    this.setState({ theaterArr: arr })
  }

  changeRadialZone = value => {
    this.setState({ radialZone: value, radial: 360 / value })
  }

  changeAnnularZone= value => {
    this.setState({ annularZone: value })
  }
  changeGenerateType = e => {
    this.setState({ generateType: e.target.value })
  }
  changeWaferSize = value => {
    this.setState({ waferSize: value})
  }
  drawPie = async () => {
    const {waferSize,generateType,annularZone,radialZone,productId,stepId,zones} = this.state
    if(productId === '' && stepId === '') {
      message.warn('请先选择product和step!')
    }else {
      const pieDom = document.getElementById('pieChart')
      this.state.pieChart = echarts.init(pieDom)
      let opt = {
        width: waferSize,
        height: waferSize,
        series: []
      }
      let zonesArr = zones
      if(generateType === 'Automatic') {
        if(annularZone === null || radialZone === null) {
          message.warn('请填写完整!')
          return
        }
        let angel = opt.width/this.state.annularZone
        let num = 1
        for(let i=0; i<this.state.annularZone; i++) {
          opt.series.push({
            type: 'pie',
            label: {
              position: 'inner'
            },
            center: [200, 200],
            color: '#7099c9',
            hoverAnimation:false,
            itemStyle: {
              normal: {
                  borderWidth: 2,
                  borderColor: '#235894'
              }
            },
            radius: [],
            data: [],
          })
          opt.series[i].radius = [i*angel, (i+1)*angel ]
          for(let j=0; j<this.state.radialZone; j++) {
            opt.series[i].data.push({value:1,name:num})
            num++
          }
        }
        updateZone({
          "cfgZoneDefinitions": [{
            waferSize,
            generateType,
            productId, 
            stepId,
            "annular": annularZone,
            "zoneCount": radialZone,
            "technology": "default",
            "createBy": "XRJ",
            "remarks": null,
            "updateTm": moment().format('YYYY-MM-DD HH:mm:ss') }]})
      }else {
        for(let i=0; i<this.state.radiusArr.length; i++) {
          if(this.state.radiusArr[i].value === ''){
            message.warn('请填写完整半径!')
            return
          }
        }
        for(let i=0; i<this.state.theaterArr.length; i++) {
          if(this.state.theaterArr[i].value === ''){
            message.warn('请填写完整分割角度!')
            return
          }
        }
        zonesArr = []
        let num = 1
        let no = 1
        let firstReg = this.state.theaterArr[0].value
        if(this.state.radiusArr[this.state.radiusArr.length-1].value !== waferSize) {
          this.setState({radiusArr: [...this.state.radiusArr, {seq: this.state.radiusArr.length+1, value: waferSize}]})
        }
        await delay(1)
        this.state.radiusArr.forEach((item, index) => {
          opt.series.push({
            type: 'pie',
            label: {
              position: 'inner'
            },
            center: [200, 200],
            color: '#7099c9',
            hoverAnimation:false,
            itemStyle: {
              normal: {
                  borderWidth: 2,
                  borderColor: '#235894'
              }
            },
            clockwise: false,
            startAngle: firstReg,
            radius: [index === 0 ? 0 : this.state.radiusArr[index-1].value, item.value],
            data: [],
          })
          let totalPercent = 0
          let radius = index === 0 ? "0-"+item.value*1000 : this.state.radiusArr[index-1].value*1000+'-'+item.value*1000
          this.state.theaterArr.forEach((jtem, jdx) => {
            zonesArr.push({
              "zoneName": no++ + '',
              radius,
              central: jdx === this.state.theaterArr.length-1 ? jtem.value+'-'+this.state.theaterArr[0].value : jtem.value+'-'+this.state.theaterArr[jdx+1].value
            })
            if(jdx > 0) {
              const lastValue = this.state.theaterArr[jdx-1].value
              const currentPercent = (jtem.value-lastValue)/360
              opt.series[index].data.push({value: currentPercent, name: num})
              num++
              totalPercent += currentPercent
            }
          })
          opt.series[index].data.push({value: 1-totalPercent, name: num++})
        })
          updateZone({
            "cfgZoneDefinitions": [{
              waferSize,
              generateType,
              productId, 
              stepId,
              zones: zonesArr,
              "annular": annularZone,
              "zoneCount": radialZone,
              "technology": "default",
              "createBy": "XRJ",
              "remarks": null,
              "updateTm": moment().format('YYYY-MM-DD HH:mm:ss') }]})
        
      }
      if(this.state.pieChart) {this.state.pieChart.setOption(opt,true)}
    }
  }

  render() {
    const formItemLayout = { labelCol: { span: 8 },wrapperCol: { span: 14 } }
    return (
      <div>
        <Form layout='inline'>
          <Form.Item label='Product - Step ID'>
            <Select style={{ width: 400 }} defaultValue={this.state.cfgDbPrimaryKeys} onChange={this.changeCfgDbPrimaryKeys}>
              {this.state.productStepId.map((item, index) => <Option key={index}>{`${item.productId}-${item.stepId}`}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type='default' onClick={this.showModal}>
              New
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title='Please Key-in:'
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form layout='horizontal'>
            <Form.Item {...formItemLayout} label='Product'>
              <Input value={this.state.addSubdieProduct} onChange={this.changeSubProduct} />
            </Form.Item>
            <Form.Item {...formItemLayout} label='Step ID'>
              <Input value={this.state.addSubdieStepId} onChange={this.changeSubStepId} />
            </Form.Item>
          </Form>
        </Modal>
        <LayoutInline>
          <LayoutVertical>
            <Form {...formItemLayout}>
              <Form.Item label='Annular Selection'>
                <Radio.Group onChange={this.changeGenerateType} value={this.state.generateType}>
                  <Radio value='Automatic'>Automatic</Radio>
                  <Radio value='Manual'>Manual</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label='Wafer Size'>
                <Select style={{ width: 400 }} value={this.state.waferSize} onChange={this.changeWaferSize}>
                  <Option value='100'>100</Option>
                  <Option value='150'>150</Option>
                </Select>
              </Form.Item>
              { this.state.generateType === 'Automatic' && 
                <div>
                  <Form.Item label='Number of annular zones'>
                    <InputNumber value={this.state.annularZone} min={1} onChange={this.changeAnnularZone} />
                  </Form.Item>
                  <Form.Item label='Number of radial zones'>
                    <InputNumber value={this.state.radialZone} min={1} onChange={this.changeRadialZone} />
                    <Input style={{ width: '50px', marginLeft: '10px' }} disabled value={this.state.radial} />
                  </Form.Item>
                </div> }
            </Form>
            {this.state.generateType === 'Manual' &&  
            <LayoutInline>
              <StyleCluster style={{width: '45%'}}>
                <h4>Radius</h4>
                <Table dataSource={this.state.radiusArr} bordered rowKey={record => record.seq} pagination={false}>
                  <Column title='SEQ' dataIndex='seq' key='seq' />
                  <Column
                    title='Value'
                    dataIndex='value'
                    key='value'
                    align='center'
                    render={(text, record) => (
                      <InputNumber max={+this.state.waferSize} value={text} onChange={value => this.changeValue(value, record.seq, 'value')} />
                    )}
                  />
                  <Column
                    title='Action'
                    key='action'
                    align="center"
                    render={(text, record) => (
                      <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record.seq,this.state.radiusArr, 'radiusArr')}>
                        <Icon type='delete' />
                      </Popconfirm>
                    )}
                  />
                </Table>
                <Button type='default' onClick={() => this.addTable(this.state.radiusArr, 'radiusArr')}><Icon type='plus' /></Button>
              </StyleCluster>
              <StyleCluster style={{width: '45%'}}>
                <h4>Theater</h4>
                <Table dataSource={this.state.theaterArr} bordered rowKey={record => record.seq} pagination={false}>
                  <Column title='SEQ' dataIndex='seq' key='seq' />
                  <Column
                    title='Value'
                    dataIndex='value'
                    key='value'
                    align='center'
                    render={(text, record) => (
                      <InputNumber max={360} value={text} onChange={value => this.changeTheaterValue(value, record.seq, 'value')} />
                    )}
                  />
                  <Column
                    title='Action'
                    key='action'
                    align="center"
                    render={(text, record) => (
                      <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record.seq,this.state.theaterArr,'theaterArr')}>
                        <Icon type='delete' />
                      </Popconfirm>
                    )}
                  />
                </Table>
                <Button type='default' onClick={()=>this.addTable(this.state.theaterArr,'theaterArr')}><Icon type='plus' /></Button>
              </StyleCluster>
            </LayoutInline>} 
            <Button style={{width:'100px',margin: 'auto 20px auto auto'}} type="default" onClick={this.drawPie}>Save</Button>
          </LayoutVertical>

          <DiePitch>
            <div id="pieChart" style={{width: '400px',height: '400px'}}/>
          </DiePitch>
        </LayoutInline>
      </div>
    )
  }
}

const WrappedHorizontalLoginForm = Form.create({ name: 'horizontal_login' })(HorizontalLoginForm)
class Zonal extends React.Component {
  render() {
    return (
      <WrappedHorizontalLoginForm />
    )
  }
}

export default Zonal
