import React from 'react'
import _ from 'lodash'
import { Form, Select, Table, Input, Button, Icon, Popconfirm, message } from 'antd'
import Highlighter from 'react-highlight-words'
import { delay } from '@/utils/web'
import moment from 'moment'
import { StyleReporting } from './style'
import { getProduct, getStep, getDoi, getDoiList, addDoi, editDoi, getEditList, deleteDoi } from './service'
import AddDoiModal from './Modal/addDoiTable'
const { Option } = Select;

class DoiHandling extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      productArr: [],
      stepArr: [],
      doiArr: [],
      formInline: {
        product: '',
        step: '',
        doi: []
      },
      showEditBtn: false,
      showAddDoiModal: false,
      modalTitle: '',
      addDoiData: [],
      tableData: [],
      selectedRowKeys: [],
      selectedRows: [],
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
    this.setState({productArr})
  }
  // 获取表格数据
  getTableList = async data => {
    const tableData = await getDoiList()
    this.setState({ tableData })
  }
  // product改变
  productChange = async value => {
    const formInline = {
      product: value,
      step: '',
      doi: []
    }
    const stepArr = await getStep(value)
    this.setState({ formInline, stepArr })
  }
  // step改变
  stepChange = async value => {
    const { formInline, tableData } = this.state
    formInline.step = value
    formInline.doi = []
    // product+step+doi唯一, 筛选出可以添加的doi
    const arr = []
    tableData.forEach(item => {
      if(item.product === formInline.product && item.layer === formInline.step) {
        arr.push(item.doi)
      }
    })
    const doiArr = await getDoi(formInline.product, value)
    const trueDoiArr = []
    const falseDoiArr = []
    doiArr.forEach(item => {
      if(arr.includes(item+'')) {
        trueDoiArr.push({value: item, disabled: true})
      }else {
        falseDoiArr.push({value: item, disabled: false})
      }
    })
    this.setState({ formInline, doiArr: falseDoiArr.concat(trueDoiArr) })
  }
  // doi改变
  doiChange = async value => {
    const { formInline } = this.state
    formInline.doi = value
    this.setState({formInline})
  }
  // Modal增加数据
  handleSubmit = e => {
    e.preventDefault()
    const { formInline } = this.state
    const { product, step, doi } = formInline
    let arr = []
    doi.forEach((item, index) => {
      arr.push({
        key: index,
        product,
        layer: step,
        doi: item,
        cntSpec: '',
        normCntSpec: '',
        densitySpec: '',
        normDensitySpce: '',
        dDSpec: '',
        normDDSpec: '',
        kr: ''
      })
    })
    this.setState({ addDoiData: arr, modalTitle: 'Add DOI Handling', showAddDoiModal: true })
  }
  // modal传值的操作及回填
  changeAddModal = async data => {
    const { modalTitle } = this.state
    if(data) {
      if(modalTitle === 'Add DOI Handling'){
        await addDoi(data)
        message.info('添加成功!')
        this.getTableList()
        const formInline = {
          product: '',
          step: '',
          doi: []
        }
        const stepArr = []
        const doiArr = []
        this.setState({ showAddDoiModal: false, formInline, stepArr, doiArr })
      }else {
        await editDoi(data)
        message.info('修改成功!')
        this.getTableList()
        this.setState({ showEditBtn: false, selectedRowKeys: [], selectedRows: []})
      } 
    }
    this.setState({ showAddDoiModal: false })
  }
  // 多选
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let arr = []
    selectedRows.forEach(item => {
      arr.push(item.product+','+item.layer)
    })
    let newArr = [...new Set(arr)]
    if( newArr.length === 1 ) {
      this.setState({showEditBtn: true, selectedRowKeys, selectedRows})
    } else {
      this.setState({ showEditBtn: false, selectedRowKeys, selectedRows })
    }
  };
  // 单条数据删除
  handleDelete = async record => {
    await deleteDoi(record.product, record.layer, record.doi)
    this.getTableList()
  }
  //单条数据编辑
  editDoiList = async record => {
    const addDoiData = await getEditList(record.product, record.layer, record.doi)
    let newAddDoiData = [{key: 0, ...addDoiData}]
    this.setState({ showAddDoiModal: true, addDoiData: newAddDoiData, modalTitle: 'Edit DOI Handling' })
  }
  // 多条数据编辑
  editMoreDoiList = selectedRows => {
    let addDoiData = []
    selectedRows.forEach((item, index) => {
      addDoiData.push({key: index, ...item})
    })
    this.setState({ showAddDoiModal: true, addDoiData, modalTitle: 'Edit DOI Handling' })
  }
  changeCell = (value, id, cellName) => {
    const newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id][cellName] = value
    this.setState({ tableData: newTableData })
  }

  // 筛选功能
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
    console.log(this.state)
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };
  render() {
    const { productArr, stepArr, doiArr, formInline, showAddDoiModal, modalTitle, addDoiData, tableData, selectedRowKeys, selectedRows, showEditBtn } = this.state
    const { product, step, doi } = formInline
    const columns = [
      {
        title: 'Product',
        dataIndex: 'product',
        align:'center',
        ...this.getColumnSearchProps('product')
      },
      {
        title: 'Step',
        dataIndex: 'layer',
        align:'center',
        ...this.getColumnSearchProps('layer')
      },
      {
        title: 'MB',
        dataIndex: 'doi',
        align:'center',
        ...this.getColumnSearchProps('doi')
      },
      {
        title: 'Add True Defect Count',
        dataIndex: 'cntSpec',
        align:'center'
      },
      {
        title: 'Norm. Add True Defect Count',
        dataIndex: 'normCntSpec',
        align:'center'
      },
      {
        title: 'Add True Defect Density',
        dataIndex: 'densitySpec',
        align:'center'
      },
      {
        title: 'Norm. Add True Defect Density',
        dataIndex: 'normDensitySpce',
        align:'center'
      },
      {
        title: 'DD%',
        dataIndex: 'dDSpec',
        align:'center',
        render:(text, record) => (<span>{text}%</span>)
      },
      {
        title: 'Norm. DD%',
        dataIndex: 'normDDSpec',
        align:'center',
        render:(text, record) => (<span>{text}%</span>)
      },
      {
        title: 'KR',
        dataIndex: 'kr',
        align:'center'
      },
      {
        title:'Action',
        width: 100,
        align:'center',
        render:(text, record) => (
          <div>
            <Button type="primary" shape="circle" icon="edit" onClick={() => this.editDoiList(record)}/>
            <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record)}>
              <Button type="danger" shape="circle" icon="delete"/>
            </Popconfirm>
          </div>
        )
      }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <StyleReporting>
        <Form layout="inline" onSubmit={this.handleSubmit} style={{marginBottom: '20px'}}>
          <Form.Item label="Product">
            <Select style={{width: '150px'}}
              value={product}
              onChange={this.productChange}
            >
              {productArr.map((item, index) => (
                <Option value={item} key={index}>{item}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Step">
            <Select style={{width: '150px'}}
              value={step}
              onChange={this.stepChange}
            >
              {stepArr.map((item, index) => (
                <Option value={item} key={index}>{item}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="DOI">
            <Select style={{width: '300px'}}
              mode="multiple"
              value={doi}
              onChange={this.doiChange}
            >
              {doiArr.map((item, index) => (
                <Option value={item.value} key={index} disabled={item.disabled}>{item.value}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!(product !== '' && step !== '' && doi.length !== 0)}>
              Add
            </Button>
            <Button type="primary" disabled={!showEditBtn} onClick={() => this.editMoreDoiList(selectedRows)}>
              Edit
            </Button>
          </Form.Item>
        </Form>
        {showAddDoiModal ? <AddDoiModal showAddDoiModal={ showAddDoiModal } title={modalTitle} addDoiData = { addDoiData } changeAddModal={(tableData) => {this.changeAddModal(tableData)}}/> : null }
        <Table rowSelection={rowSelection} rowKey={record => `${record.product},${record.layer},${record.doi}`} dataSource={tableData} columns={columns} bordered size='small'></Table>
      </StyleReporting>
    )
  }
}

export default DoiHandling
