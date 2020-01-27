/* eslint-disable */
import React from 'react'
import { delay } from '@/utils/web'
import { Form,Input, Select, Button,Modal,message,Table} from 'antd'
import { getSubDie } from './service'

const { Option } = Select;
const { Column, ColumnGroup } = Table;
const data = []

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
      addSubdieStepId: ''
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
  };

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
    getSubDie({cfgDbPrimaryKeys:[this.state.productStepId[e]]}).then(data => {
      console.log(data)
    })
  }
  changeSubProduct = (e) => {
    this.setState({addSubdieProduct:e.target.value})
  }
  changeSubStepId = (e) => {
    this.setState({addSubdieStepId:e.target.value})
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
        <Table dataSource={data}>
          <Column title="ID" dataIndex="id" key="id" />
          <Column title="Name" dataIndex="name" key="name" />
          <ColumnGroup title="LL Coordinate">
            <Column title="X" dataIndex="startX" key="startX" />
            <Column title="Y" dataIndex="startY" key="startY" />
          </ColumnGroup>
          <ColumnGroup title="UR Coordinate">
            <Column title="X" dataIndex="endX" key="endX" />
            <Column title="Y" dataIndex="endY" key="endY" />
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
