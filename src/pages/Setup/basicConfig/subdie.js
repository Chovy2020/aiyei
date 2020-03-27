/* eslint-disable */
import React from 'react'
import _ from 'lodash'
import { delay } from '@/utils/web'
import { Form,Input,InputNumber, Select, Button,Icon,Modal,message,Table, Popconfirm} from 'antd'
import moment from 'moment'
import { getSubDie, updateSubDie, deleteSubDie } from './service'
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
      cfgDbPrimaryKeys: '',
      productStepId: [],
      productId: '',
      stepId: '',
      visible: false,
      addSubdieProduct:'',
      addSubdieStepId: '',
      diePitchTable: [{id:1, x: '40000',y:'40000'}],
      ratio: 1,
      tableData: [],
      boxArr: [],
    }
  }
  componentDidMount() {
    this.initSubDie()
  }

  initSubDie = () => {
    getSubDie({}).then(data => {
      let arr = []
      data.forEach(item => {
        arr.push({productId:item.productId,stepId:item.stepId})
      })
      data
      this.setState({productStepId:arr})
      console.log(data,'data')
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
      updateSubDie({
        "cfgSubDies": [
          {
              "productId": addSubdieProduct,
              "stepId": addSubdieStepId,
              "technology": "T1",
              "subDieIds": [
                  {
                      "subDieId": 1,
                      "subDieName": "",
                      "startX": null,
                      "endX": null,
                      "startY": null,
                      "endY": null
                  }
              ],
              "createBy": "XRJ",
              "remarks": null,
              "updateTm": moment().format('YYYY-MM-DD HH:mm:ss')
          }
      ]
      }).then(data => {
        this.initSubDie()
      })
    }else {
      message.warning('Product和Step Id不能为空');
    }
  }

  changeCfgDbPrimaryKeys = (e) => {
    this.setState({cfgDbPrimaryKeys: [this.state.productStepId[e]].productId+'-'+[this.state.productStepId[e]].stepId})
    getSubDie({cfgDbPrimaryKeys:[this.state.productStepId[e]]}).then(res => {
      let subDieIds = res[0].subDieIds
      if(subDieIds.length>0) {
        this.setState({
          tableData: subDieIds, 
          diePitchTable: [{id:1, x: subDieIds[0].x === 0 ? 40000 : subDieIds[0].x, y:subDieIds[0].y === 0 ? 40000 :  subDieIds[0].y}],
          productId: res[0].productId,
          stepId: res[0].stepId,
          boxArr: subDieIds,
          ratio: Math.max(subDieIds[0].x === 0 ? 40000 : subDieIds[0].x , subDieIds[0].y === 0 ? 40000 : subDieIds[0].y)/400
        })
      } 
    })
  }
  changeSubProduct = (e) => {
    this.setState({addSubdieProduct:e.target.value})
  }
  changeSubStepId = (e) => {
    this.setState({addSubdieStepId:e.target.value})
  }

  changeDiePatch = (value,id, cellName) => {
    let newTableData = _.cloneDeep(this.state.diePitchTable)
    newTableData[id-1][cellName] = value
    this.setState({diePitchTable: newTableData})
  }

  addTableCell = () => {
    if(this.state.tableData.length === 0) {
      message.warning('请先选择Product - Step ID');
    }else {
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
  }

  saveTable = () => {
    if(this.state.tableData.length === 0) {
      message.warning('请先选择Product - Step ID');
    }else {
      let { productId, stepId, diePitchTable, tableData } = this.state
      let diePitch = diePitchTable[0]
      this.setState({ratio: Math.max(diePitch.x , diePitch.y)/400, boxArr: tableData})
      let newTable = []
      tableData.forEach(item => {
        let newObj = {}
        Object.assign( newObj, item, {x: diePitchTable[0].x, y: diePitchTable[0].y } )
        newTable.push(newObj)
      })
      updateSubDie({
        "cfgSubDies": [
          {
              "productId": productId,
              "stepId": stepId,
              "technology": "T1",
              "subDieIds": newTable,
              "createBy": "XRJ",
              "remarks": null,
              "updateTm": moment().format('YYYY-MM-DD HH:mm:ss')
          }
        ]
      })
    }
  }

  handleDelete = record => {
    const { productId, stepId } = this.state
    deleteSubDie({
      "cfgSubDies": [
        {
            "productId": productId,
            "stepId": stepId,
            "technology": "T1",
            "subDieIds": record,
            "createBy": "XRJ",
            "remarks": null,
            "updateTm": moment().format('YYYY-MM-DD HH:mm:ss')
        }
    ]
    })
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
            <Select style={{ width: 400 }} defaultValue={this.state.cfgDbPrimaryKeys}  onChange={this.changeCfgDbPrimaryKeys}>
    {this.state.productStepId.map((item, index) => <Option key={index}>{item.productId+'-'+item.stepId}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={this.showModal}>New</Button>
            {/* <Button type="dashed" onClick={this.deleteId}>Delete</Button> */}
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
            <Table dataSource={this.state.diePitchTable} rowKey={record => record.id} bordered size="small">
              <ColumnGroup title="Die Pitch" align="center">
                <Column title="X" dataIndex="x" align="center" render={(text, record) => (
                  <InputNumber style={{width:"150px"}} value={text} onChange={(value) => this.changeDiePatch(value,record.id, 'x')} />
                )}/>
                <Column title="Y" dataIndex="y" align="center" render={(text, record) => (
                  <InputNumber style={{width:"150px"}} value={text} onChange={(value) => this.changeDiePatch(value,record.id, 'y')} />
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
