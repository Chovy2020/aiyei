/* eslint-disable */
import React from 'react'
import { delay } from '@/utils/web'
import { Card, Form, Select, InputNumber, Button, Icon, Popconfirm, message } from 'antd'
import { getProduct, addHol, getHolList, deleteHol } from './service'
import { StyleBaseline, StyleBtn } from './style'
const { Option } = Select;

import HolChart from './component/holChart.js'

class Hol extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      holList: [],
      productArr: [],
      formInline: {
        product: '',
        time: ''
      },
    }
  }

  componentDidMount() {
    this.init()
  }

  init = async () => {
    this.getHolArr()
    const productArr = await getProduct()
    this.setState({productArr})
  }
  getHolArr = async () => {
    const holList = await getHolList()
    delay(100)
    this.setState({ holList })
  }
  // product改变
  productChange = async value => {
    const formInline = {
      product: value,
      time: ''
    }
    this.setState({ formInline })
  }
  // time改变
  timeChange = value => {
    const { formInline } = this.state
    formInline.time = value
    this.setState({formInline})
  }
  // 增加chart
  handleSubmit = async e => {
    e.preventDefault()
    const { formInline } = this.state
    const {product, time} = formInline
    const res = await addHol(product, time)
    if(!_.isEmpty(res)) {
      this.getHolArr()
      message.info('添加成功!')
      this.resetFormInline()
    } else {
      message.warning('未查到数据!')
    }
  }
  // 重置表单
  resetFormInline = () => {
    const formInline = {
      product: '',
      time: ''
    }
    this.setState({formInline})
  }
  // 删除
  deleteItem = async item => {
    const {product, lastmonth} = item
    await deleteHol(product, lastmonth)
    this.getHolArr()
    message.info('删除成功!')
  }
  render() {
    const { productArr, formInline, holList } = this.state
    const { product, time } = formInline
    return (
      <StyleBaseline>
        <Card title='Hol Chart' headStyle={{backgroundColor: '#8bc5ff'}}>
          <Form layout="inline" onSubmit={this.handleSubmit} style={{marginBottom: '20px'}}>
            <Form.Item label="Product">
              <Select style={{width: '120px'}}
                value={product}
                onChange={this.productChange}
              >
                {productArr.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Time">
              Last<InputNumber min={0} step={1} precision={0} value={ time } onChange={this.timeChange} style={{margin: '0 5px'}}/>month
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={!(product !== '' && time !== '')}>
                Add
              </Button>
            </Form.Item>
          </Form>

          {
            holList.map((item, index) => (
              <div key={index}>
                <StyleBtn>
                  <Popconfirm title='Sure to delete?' onConfirm={() => this.deleteItem(item)}>
                    <Button type="danger">Delete</Button>
                  </Popconfirm>
                </StyleBtn>
                <HolChart data={item}/>
              </div>
            ))
          }
        </Card>
      </StyleBaseline>
    )
  }
}

export default Hol