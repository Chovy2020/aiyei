/* eslint-disable */
import React from 'react'
import _ from 'lodash'
import echarts from 'echarts'
import { Form, Radio, Input, InputNumber, Select, Button, Modal, message, Table, Popconfirm, Icon } from 'antd'
import { delay } from '@/utils/web'
import { getZone } from './service'
import { LayoutInline, LayoutVertical, DiePitch, StyleCluster } from './style'

const { Option } = Select
const { Column, ColumnGroup } = Table

let pieChart = null

class HorizontalLoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = { cfgDbPrimaryKeys: {},
      productStepId: [],
      visible: false,
      addSubdieProduct: '',
      addSubdieStepId: '',
      tableData: [],
      annularZone: 1,
      radialZone: 1,
      radial: 360,
      radiusArr: [{ seq: 1, value: '' }],
      theaterArr: [{ seq: 1, value: '' }],
      annularSelect: 'a',
      waferSize: '150' }
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
    } else {
      message.warning('Product和Step Id不能为空')
    }
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  changeCfgDbPrimaryKeys = e => {
    this.setState({ cfgDbPrimaryKeys: `${[this.state.productStepId[e]].productId}-${[this.state.productStepId[e]].stepId}` })
    getZone({ cfgDbPrimaryKeys: [this.state.productStepId[e]] }).then(response => {
      this.setState({ tableData: response[0].subDieIds })
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

  saveTable = () => {

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
  changeAnnularSelect = e => {
    this.setState({ annularSelect: e.target.value })
  }
  changeWaferSize = value => {
    this.setState({ waferSize: value})
  }
  drawPie = () => {
    const pieDom = document.getElementById('pieChart')
    pieChart = echarts.init(pieDom)
    let opt = {
      width: this.state.waferSize,
      height: this.state.waferSize,
      series: [
        // {
        //   type: 'pie',
        //   label: {
        //     position: 'inner'
        //   },
        //   color: '#7099c9',
        //   hoverAnimation:false,
        //   itemStyle: {
        //     normal: {
        //       borderWidth: 2,
        //       borderColor: '#235894'
        //     }
        //   },
        //   radius: [0, '30%'],
        //   data: [
        //     {value: 335, name: '1'},
        //     {value: 679, name: '2'},
        //     {value: 1548, name: '3'}
        //   ],
        // },
        // {
        //   type: 'pie',
        //   radius: ['30%', '55%'],
        //   label: {
        //     position: 'inner'
        //   },
        //   data: [
        //     {value: 335, name: '4'},
        //     {value: 679, name: '5'},
        //     {value: 1548, name: '6'}
        //   ],
        //   color: '#7099c9',
        //   hoverAnimation:false,
        //   itemStyle: {
        //     normal: {
        //         borderWidth: 2,
        //         borderColor: '#235894'
        //     }
        //   }
        // }
    ]
    }
    if(this.state.annularSelect === 'a') {
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
    }else {
      let num = 1
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
          radius: [index === 0 ? 0 : this.state.radiusArr[index-1].value, item.value],
          data: [],
        })
        this.state.theaterArr.forEach(jtem => {
          opt.series[index].data.push({value: jtem.value, name: num})
          num++
        })
      })
    }
    
    console.log(opt)
    if(pieChart) {pieChart.setOption(opt,true)}
  }

  render() {
    const formItemLayout = { labelCol: { span: 8 },wrapperCol: { span: 14 } }
    return (
      <div>
        <Form layout='inline'>
          <Form.Item label='Product - Step ID'>
            <Select style={{ width: 400 }} defaultValue={this.cfgDbPrimaryKeys} onChange={this.changeCfgDbPrimaryKeys}>
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
                <Radio.Group onChange={this.changeAnnularSelect} value={this.state.annularSelect}>
                  <Radio value='a' checked>Automatic</Radio>
                  <Radio value='m'>Manual</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label='Wafer Size'>
                <Select style={{ width: 400 }} defaultValue={this.state.waferSize} onChange={this.changeWaferSize}>
                  <Option value='100'>100</Option>
                  <Option value='150'>150</Option>
                </Select>
              </Form.Item>
              { this.state.annularSelect === 'a' && 
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
            {this.state.annularSelect === 'm' &&  
            <LayoutInline>
              <StyleCluster>
                <h4>Radius</h4>
                <Table dataSource={this.state.radiusArr} bordered rowKey={record => record.seq}>
                  <Column title='SEQ' dataIndex='seq' key='seq' />
                  <Column
                    title='Value'
                    dataIndex='value'
                    key='value'
                    align='center'
                    render={(text, record) => (
                      <InputNumber value={text} onChange={value => this.changeValue(value, record.seq, 'value')} />
                    )}
                  />
                  <Column
                    title='Action'
                    key='action'
                    render={(text, record) => (
                      <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record.seq,this.state.radiusArr, 'radiusArr')}>
                        <Icon type='delete' />
                      </Popconfirm>
                    )}
                  />
                </Table>
                <Button type='default' onClick={() => this.addTable(this.state.radiusArr, 'radiusArr')}><Icon type='plus' /></Button>
              </StyleCluster>
              <StyleCluster>
                <h4>Theater</h4>
                <Table dataSource={this.state.theaterArr} bordered rowKey={record => record.seq}>
                  <Column title='SEQ' dataIndex='seq' key='seq' />
                  <Column
                    title='Value'
                    dataIndex='value'
                    key='value'
                    align='center'
                    render={(text, record) => (
                      <InputNumber value={text} onChange={value => this.changeTheaterValue(value, record.seq, 'value')} />
                    )}
                  />
                  <Column
                    title='Action'
                    key='action'
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
            <Button type="default" onClick={this.drawPie}>Save</Button>
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
