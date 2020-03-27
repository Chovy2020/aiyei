import React from 'react'
import _ from 'lodash'
import { Form, Select, Table, Input, Button, Icon, Popconfirm, message } from 'antd'
import Highlighter from 'react-highlight-words'
import { delay } from '@/utils/web'
import moment from 'moment'
import { StyleReporting } from './style'
import { getProduct, getStep, getDoi, getMbValue, getHolList, addHol, deleteHol } from './service'
const { Option, OptGroup } = Select;

class HolSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      productArr: [],
      stepArr: [],
      truembCodeArr: [],
      falsembCodeArr: [],
      mbValueObj: {},
      formInline: {
        product: '',
        step: '',
        mbCode: [],
        mbValue: ''
      },
      showAddBtn: false,
      showDeleteBtn: false,
      tableData: [],
      rowSpan: {},
      searchText: '',
      searchedColumn: '',
    }
  }

  componentDidMount() {
    this.init()
  }

  init = async () => {
    this.getTableList()
    const productArr = await getProduct()
    const mbValueObj = await getMbValue()
    this.setState({productArr, mbValueObj})
  }
  // 获取表格数据
  getTableList = async data => {
    const initTableData = await getHolList()
    let obj = {}
    initTableData.forEach(item => {
      if(obj[item.product]){
        obj[item.product].push(item)
      }else {
        obj[item.product] = [item]
      }
    })
    let newObj = {}
    for(let i in obj) {
      newObj[i] = {}
      obj[i].forEach(jtem => {
        let j = jtem.step+','+jtem.mbValue
        if(newObj[i][j]) {
          newObj[i][j].mbCode = newObj[i][j].mbCode+','+jtem.mbCode
        }else {
          newObj[i][j] = jtem
        }
      })
    }
    let tableData = []
    let no = 0
    let rowSpan = {}
    for(let i in newObj) {
      rowSpan[no] = Object.keys(newObj[i]).length
      no = no+Object.keys(newObj[i]).length
      for(let j in newObj[i]) {
        tableData.push(newObj[i][j])
      }
    }
    this.setState({ tableData, rowSpan })
  }
  // product改变
  productChange = async value => {
    const formInline = {
      product: value,
      step: '',
      mbCode: [],
      mbValue: ''
    }
    const stepArr = await getStep(value)
    this.setState({ formInline, stepArr })
  }
  // step改变
  stepChange = async value => {
    const { formInline, tableData } = this.state
    formInline.step = value
    formInline.mbCode = []
    formInline.mbValue = ''
    // product+step+mbCode唯一, 筛选出可以添加的mbCode
    let arr = []
    tableData.forEach(item => {
      if(item.product === formInline.product && item.step === formInline.step) {
        arr = arr.concat(item.mbCode.split(','))
      }
    })
    const mbCodeArr = await getDoi(formInline.product, value)
    let truembCodeArr = []
    let falsembCodeArr = []
    mbCodeArr.forEach(item => {
      if(arr.includes(item+'')) {
        falsembCodeArr.push(item)
      }else {
        truembCodeArr.push(item)
      }
    })
    this.setState({ formInline, truembCodeArr, falsembCodeArr })
  }
  // mbCode改变
  mbCodeChange = async value => {
    const { formInline, truembCodeArr, falsembCodeArr } = this.state
    formInline.mbCode = value
    formInline.mbValue = ''
    let showAdd = 0
    let showDelete = 0
    let showAddBtn = false
    let showDeleteBtn = false
    value.forEach(item => {
      if(truembCodeArr.includes(item)) {
        showAdd++
      }
      if(falsembCodeArr.includes(item)) {
        showDelete++
      }
    })
    showAddBtn = (value.length !==0 && value.length === showAdd) ? true : false
    showDeleteBtn = (value.length !==0 && value.length === showDelete) ? true : false
    this.setState({formInline, showAddBtn, showDeleteBtn})
  }
  // mbValue改变
  mbValueChange = value => {
    const { formInline } = this.state
    formInline.mbValue = value
    this.setState({formInline})
  }
  // 增加数据到表格
  handleSubmit = async e => {
    e.preventDefault()
    const { formInline } = this.state
    formInline.mbCode = formInline.mbCode.toString()
    await addHol(formInline)
    this.getTableList()
    message.info('添加成功!')
    this.resetFormInline()
  }
  // 表格数据删除
  handleDelete = async () => {
    const { formInline } = this.state
    const { product, step, mbCode } = formInline
    await deleteHol(product, step, mbCode)
    message.info('删除成功!')
    this.getTableList()
    this.resetFormInline()
  }
  // reset表单
  resetFormInline = () => {
    const formInline = {
      product: '',
      step: '',
      mbCode: [],
      mbValue: ''
    }
    this.setState({formInline})
  }
  
  render() {
    const { rowSpan, productArr, stepArr, truembCodeArr, falsembCodeArr, mbValueObj, formInline, tableData, showAddBtn, showDeleteBtn } = this.state
    const { product, step, mbCode, mbValue } = formInline
    const columns = [
      {
        title: 'Product',
        dataIndex: 'product',
        align:'center',
        render: (value, row, index) => {
          const obj = {
            children: value,
            props: {},
          };
          obj.props.rowSpan =  rowSpan[index] || 0
          return obj;
        }
      },
      {
        title: 'Steps',
        dataIndex: 'step',
        align:'center',
      },
      {
        title: 'MB',
        dataIndex: 'mbCode',
        align:'center',
      },
      {
        title: 'MB Value',
        dataIndex: 'mbValue',
        align:'center',
        render: (text, record) => (
          <span>{mbValueObj[text]}</span>
        )
      }
    ]
    return (
      <StyleReporting>
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
            <Select style={{width: '300px'}}
              mode="multiple"
              value={mbCode}
              onChange={this.mbCodeChange}
            >
              <OptGroup label="可添加">
                {truembCodeArr.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </OptGroup>
              <OptGroup label="可删除">
                {falsembCodeArr.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </OptGroup>
            </Select>
          </Form.Item>
          <Form.Item label="MB Value">
            <Select style={{width: '200px'}}
              value={mbValue}
              onChange={this.mbValueChange}
            >
              {Object.keys(mbValueObj).map(key => (
                <Select.Option value={key} key={key}>
                  {mbValueObj[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!(product !== '' && step !== '' && showAddBtn && mbValue !== '')}>
              Add
            </Button>
          </Form.Item>
          <Form.Item>
            <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete()}>
              <Button type="danger" disabled={!(product !== '' && step !== '' && showDeleteBtn)}>
                Delete
              </Button>
            </Popconfirm>
          </Form.Item>
        </Form>
        <Table rowKey={record => `${record.product},${record.step},${record.mbCode}`} dataSource={tableData} columns={columns} bordered size='small' pagination={false}></Table>
      </StyleReporting>
    )
  }
}

export default HolSetting
