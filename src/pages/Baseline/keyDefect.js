/* eslint-disable */
import React from 'react'
import { delay } from '@/utils/web'
import { Card, Form, Select, InputNumber, Button, Icon, Popconfirm, message } from 'antd'
import { getProduct, getStep, getMb, getY, getKeyDefectList, addKeyDefectList, deleteKeyDefectList } from './service'
import { StyleBaseline, StyleBtn } from './style'
const { Option } = Select;

import KeyDefectChart from './component/keyDefectChart.js'

class KeyDefect extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      productArr: [],
      stepArr: [],
      mbArr: [],
      yObj: {},
      formInline: {
        product: '',
        step: '',
        mb: '',
        yValue: '',
        time: ''
      },
      keyDefectList: []
    }
  }

  componentDidMount() {
    this.init()
  }

  init = async () => {
    this.getKeyDefectArr()
    const productArr = await getProduct()
    const yObj = await getY()
    this.setState({productArr, yObj})
    console.log(this.state.keyDefectList,'list')
  }

  getKeyDefectArr = async () => {
    const keyDefectList = await getKeyDefectList()
    delay(100)
    this.setState({ keyDefectList })
  }

  // product改变
  productChange = async value => {
    const formInline = {
      product: value,
      step: '',
      mb: '',
      yValue: '',
      time: ''
    }
    const stepArr = await getStep(value)
    this.setState({ formInline, stepArr })
  }
  // step改变
  stepChange = async value => {
    const { formInline } = this.state
    formInline.step = value
    formInline.mb = []
    formInline.yValue = ''
    const mbArr = await getMb(formInline.product, value)
    this.setState({ formInline, mbArr })
  }
  // mb改变
  mbChange = async value => {
    const { formInline } = this.state
    formInline.mb = value
    formInline.yValue = ''
    this.setState({ formInline })
  }
  // yValue改变
  yValueChange = value => {
    const { formInline } = this.state
    formInline.yValue = value
    this.setState({formInline})
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
    const {product, step, mb, yValue, time} = formInline
    const res = await addKeyDefectList(product, step, mb, yValue, time)
    if(res.length > 0) {
      this.getKeyDefectArr()
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
      step: '',
      mb: '',
      yValue: '',
      time: ''
    }
    this.setState({formInline})
  }
  // 删除
  deleteItem = async item => {
    const {product, step, mb, yxais, lastmonth} = item
    await deleteKeyDefectList(product, step, mb, yxais, lastmonth)
    this.getKeyDefectArr()
    message.info('删除成功!')
  }

  render() {
    const { productArr, stepArr, mbArr, yObj, formInline, keyDefectList } = this.state
    const { product, step, mb, yValue, time } = formInline
    return (
      <StyleBaseline>
        <Card title='Key Defect Trend Chart' headStyle={{backgroundColor: '#8bc5ff'}}>
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
            <Form.Item label="Step">
              <Select style={{width: '120px'}}
                value={step}
                onChange={this.stepChange}
              >
                {stepArr.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="MB">
              <Select style={{width: '120px'}}
                value={mb}
                onChange={this.mbChange}
              >
                {mbArr.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Y">
              <Select style={{width: '200px'}}
                value={yValue}
                onChange={this.yValueChange}
              >
                {Object.keys(yObj).map(key => (
                  <Select.Option value={key} key={key}>
                    {yObj[key]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Time">
              过去<InputNumber min={0} step={1} precision={0} value={ time } onChange={this.timeChange} style={{margin: '0 5px'}}/>月
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={!(product !== '' && step !== '' && mb !== '' && yValue !== '' && time !== '')}>
                Add
              </Button>
            </Form.Item>
          </Form>
          
          {
            keyDefectList.map((item, index) => (
              <div key={index}>
                <StyleBtn>
                  <Popconfirm title='Sure to delete?' onConfirm={() => this.deleteItem(item)}>
                    <Button type="danger">Delete</Button>
                  </Popconfirm>
                </StyleBtn>
                <KeyDefectChart data={item} yValue={yObj[item.yxais]}/>
              </div>
            ))
          }
        
        </Card>
      </StyleBaseline>
    )
  }
}

export default KeyDefect
