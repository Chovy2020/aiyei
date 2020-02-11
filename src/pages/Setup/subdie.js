/* eslint-disable */
import React from 'react'
import _ from 'lodash'
import { delay } from '@/utils/web'
import { Form,Input,InputNumber, Select, Button,Icon,Modal,message,Table} from 'antd'
import { getSubDie } from './service'
import {DiePitch,LayoutInline,LayoutVertical,DivStyle} from './style'

const { Option } = Select;
const { Column, ColumnGroup } = Table;
const ButtonGroup = Button.Group;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

class HorizontalLoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cfgDbPrimaryKeys: {},
      productStepId: [],
      visible: false,
      addSubdieProduct:'',
      addSubdieStepId: '',
      diePitchTable: [{x: '40000',y:'30000'}],
      ratio: 1,
      tableData: [],
      boxArr: [],
    }
  }
  componentDidMount() {
    getSubDie({}).then(data => {
      let arr = []
      data.forEach(item => {
        arr.push({productId:item.productId,stepId:item.stepId})
      })
      this.setState({productStepId:arr})
    })
  }

  showModal = () => {
    this.setState({visible: true,addSubdieProduct: '',addSubdieStepId: ''})
  }

  handleOk = () => {
    let {addSubdieProduct,addSubdieStepId,productStepId} = this.state
    if(addSubdieProduct !== '' && addSubdieStepId !== '') {
      let newData = {productId: addSubdieProduct, stepId: addSubdieStepId}
      this.setState({visible: false,productStepId:[...productStepId,newData],cfgDbPrimaryKeys:addSubdieProduct+'-'+addSubdieStepId})
      console.log(productStepId)
    }else {
      message.warning('Product和Step Id不能为空');
    }
  }

  handleCancel = () => {
    this.setState({visible: false})
  }
  changeCfgDbPrimaryKeys = (e) => {
    this.setState({cfgDbPrimaryKeys: [this.state.productStepId[e]].productId+'-'+[this.state.productStepId[e]].stepId})
    getSubDie({cfgDbPrimaryKeys:[this.state.productStepId[e]]}).then(response => {
      this.setState({tableData: response[0].subDieIds})
    })
  }
  changeSubProduct = (e) => {
    this.setState({addSubdieProduct:e.target.value})
  }
  changeSubStepId = (e) => {
    this.setState({addSubdieStepId:e.target.value})
  }

  changeDiePatchX = (value) => {
    let y = this.state.diePitchTable[0].y
    this.setState({diePitchTable: [{x: value, y }]})
  }

  changeDiePatchY = (value) => {
    let x = this.state.diePitchTable[0].x
    this.setState({diePitchTable: [{x, y:value }]})
  }

  addTableCell = () => {
    let endId = this.state.tableData[this.state.tableData.length-1].subDieId
    let newCell = {
      subDieId: endId+1,
      subDieName: '',
      startX: '',
      endX: '',
      startY: '',
      endY: ''
    }
    this.setState({tableData: [...this.state.tableData,newCell]})
  }

  saveTable = () => {
    let diePitch = this.state.diePitchTable[0]
    this.setState({ratio: Math.max(diePitch.x , diePitch.y)/400, boxArr: this.state.tableData})
  }
  
  changeCell = (value, id, cellName) => {
    let newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id-1][cellName] = value
    this.setState({tableData: newTableData})
  }
  render() {
    return (
      <div>
        <Form layout="inline">
          <Form.Item label="Product - Step ID">
            <Select style={{ width: 400 }} defaultValue={this.cfgDbPrimaryKeys} onChange={this.changeCfgDbPrimaryKeys}>
    {this.state.productStepId.map((item, index) => <Option key={index}>{item.productId+'-'+item.stepId}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={this.showModal}>
              New
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title="Please Key-in:"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form layout="horizontal">
            <Form.Item {...formItemLayout} label="Product">
              <Input value={this.state.addSubdieProduct} onChange={this.changeSubProduct}/>
            </Form.Item>
            <Form.Item {...formItemLayout} label="Step ID">
              <Input value={this.state.addSubdieStepId} onChange={this.changeSubStepId}/>
            </Form.Item>
          </Form>
        </Modal>
        <LayoutInline>
          <LayoutVertical>
            <Table dataSource={this.state.diePitchTable} rowKey={record => record.x} bordered size="small">
              <ColumnGroup title="Die Pitch" align="center">
                <Column title="X" dataIndex="x" align="center" render={(text) => (
                  <Input value={text} onChange={(e) => this.changeDiePatchX(e.target.value)} />
                )}/>
                <Column title="Y" dataIndex="y" align="center" render={(text) => (
                  <Input value={text} onChange={(e) => this.changeDiePatchY(e.target.value)} />
                )}/>
              </ColumnGroup>
            </Table>
            <Table dataSource={this.state.tableData} rowKey={record => record.subDieId} bordered>
              <Column title="ID" dataIndex="subDieId" key="subDieId" />
              <Column title="Name" dataIndex="subDieName" key="subDieName" render={(text, record) => (
                <Input value={text} onChange={(e) => this.changeCell(e.target.value,record.subDieId,'subDieName')}/>
              )}/>
              <ColumnGroup title="LL Coordinate" align="center">
                <Column title="X" dataIndex="startX" key="startX"  align="center" render={(text, record) => (
                <InputNumber value={text} onChange={(value) => this.changeCell(value,record.subDieId,'startX')}/>
              )}/>
                <Column title="Y" dataIndex="startY" key="startY"  align="center" render={(text, record) => (
                <InputNumber value={text} onChange={(value) => this.changeCell(value,record.subDieId,'startY')}/>
              )}/>
              </ColumnGroup>
              <ColumnGroup title="UR Coordinate" align="center">
                <Column title="X" dataIndex="endX" key="endX"  align="center" render={(text, record) => (
                <InputNumber value={text} onChange={(value) => this.changeCell(value,record.subDieId,'endX')}/>
              )}/>
                <Column title="Y" dataIndex="endY" key="endY"  align="center" render={(text, record) => (
                <InputNumber value={text} onChange={(value) => this.changeCell(value,record.subDieId,'endY')}/>
              )}/>
              </ColumnGroup>
              <Column
                title="Action"
                key="action"
                render={(text, record) => (
                  <span>
                    <a>Delete</a>
                  </span>
                )}
              />
            </Table>
            <ButtonGroup>
              <Button type="default" onClick={this.addTableCell}><Icon type="plus" /></Button>
              <Button type="default" onClick={this.saveTable}>Save</Button>
            </ButtonGroup>
          </LayoutVertical>
          <DiePitch>
            <div style={{border: '1px solid #aaa', height: this.state.diePitchTable[0].y/this.state.ratio+'px', width: this.state.diePitchTable[0].x/this.state.ratio+'px',left:0,top:(400-this.state.diePitchTable[0].y/this.state.ratio)+'px', position: 'absolute', boxSizing: 'border-box'}}></div>
            {
              this.state.boxArr.map((item, index) => {
                let divPostion = {
                  left: item.startX/this.state.ratio+'px',
                  top: (400-item.endY/this.state.ratio)+'px',
                  width: (item.endX/this.state.ratio-item.startX/this.state.ratio)+'px',
                  height: (item.endY/this.state.ratio-item.startY/this.state.ratio)+'px'
                }
                return (<DivStyle key={index} className="divStyle" style={divPostion}>{item.subDieName}</DivStyle>)
              })
            }
          </DiePitch>
        </LayoutInline>
      </div>
      
    );
  }
}

const WrappedHorizontalLoginForm = Form.create({ name: 'horizontal_login' })(HorizontalLoginForm);
class SubDie extends React.Component {
  render() {
    return (
      <WrappedHorizontalLoginForm/>
    )
  }
}

export default SubDie
