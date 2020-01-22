import React from 'react'
import _ from 'lodash'
import { delay } from '@/utils/web'
import { Form,Input,InputNumber, Select, Button,Modal,message,Table} from 'antd'
import { getZone } from './service'

const { Option } = Select;
const { Column, ColumnGroup } = Table;

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
      tableData: []
    }
  }
  componentDidMount() {
    getZone({}).then(data => {
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
    getZone({cfgDbPrimaryKeys:[this.state.productStepId[e]]}).then(response => {
      this.setState({tableData: response[0].subDieIds})
    })
  }
  changeSubProduct = (e) => {
    this.setState({addSubdieProduct:e.target.value})
  }
  changeSubStepId = (e) => {
    this.setState({addSubdieStepId:e.target.value})
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
            <Button type="primary" onClick={this.showModal}>
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
        <div>
          
        </div>
      </div>
      
    );
  }
}

const WrappedHorizontalLoginForm = Form.create({ name: 'horizontal_login' })(HorizontalLoginForm);
class Zonal extends React.Component {
  render() {
    return (
      <WrappedHorizontalLoginForm/>
    )
  }
}

export default Zonal
