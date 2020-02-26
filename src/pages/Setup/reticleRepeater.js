import React from 'react'
import _ from 'lodash'
import { Table, Input, InputNumber, Button, Icon, Popconfirm } from 'antd'
import Highlighter from 'react-highlight-words'
import { StyleCluster } from './style'
import { getRepeater, updateRepeater, deleteRepeater } from './service'

const ButtonGroup = Button.Group

class ReticleRepeater extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      tableData: [],
      searchText: '',
      searchedColumn: ''
    }
  }

  componentDidMount() {
    this.init()
  }

  init = () => {
    getRepeater({}).then(response => {
      const resData = _.cloneDeep(response).map((item, idx) => ({ key: idx, disabled: true, ...item }))
      this.setState({ tableData: resData })
    })
  }

  changeCell = (value, id, cellName) => {
    const newTableData = _.cloneDeep(this.state.tableData)
    newTableData[id][cellName] = value
    this.setState({ tableData: newTableData })
  }

  addTableCell = () => {
    const newCell = { key: this.state.tableData.length,
      productId: '',
      stepId: '',
      reticleSize: '',
      originalReticleDie: '',
      tolerance: 0,
      dieCount: 0 }
    this.setState({ tableData: [...this.state.tableData, newCell] })
  }

  handleDelete = record => {
    deleteRepeater({"cfgDbPrimaryKeys": [{"productId": record.productId,"stepId": record.stepId}]}).then(response => {
      this.init()
    })
  }

  saveTable = () => {
    const cfgRepeaters = this.state.tableData.map(item => ({ 
      "technology": 'default',
      productId: item.productId,
      stepId: item.stepId,
      reticleSize: item.reticleSize,
      originalReticleDie: item.originalReticleDie,
      tolerance: item.tolerance,
      dieCount: item.dieCount,
      createBy: 'xrj',
      remarks: null,
      updateTm: null }))
    updateRepeater({ cfgRepeaters }).then(response => {
      this.init()
    })
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
    const columns = [
      {
        title: 'Product',
        dataIndex: 'productId',
        key: 'productId',
        ...this.getColumnSearchProps('productId'),
        render: (text, record) => (
          <Input value={text} onChange={e => this.changeCell(e.target.value, record.key, 'productId')} disabled={record.disabled} />
        )
      },
      {
        title: 'Step',
        dataIndex: 'stepId',
        key: 'stepId',
        ...this.getColumnSearchProps('stepId'),
        render: (text, record) => (
          <Input value={text} onChange={e => this.changeCell(e.target.value, record.key, 'stepId')} disabled={record.disabled} />
        )
      },
      {
        title:'Reticle size',
        dataIndex:'reticleSize',
        key:'reticleSize',
        align:'center',
        render: (text, record) => (
          <Input value={text} onChange={e => this.changeCell(e.target.value, record.key, 'reticleSize')} />
        )
      },
      {
        title:'Original Reticle Die',
        dataIndex:'originalReticleDie',
        key:'originalReticleDie',
        align:'center',
        render:(text, record) => (
          <Input value={text} onChange={e => this.changeCell(e.target.value, record.key, 'originalReticleDie')} />
        )
      },
      {
        title: 'Tolerance',
        dataIndex: 'tolerance',
        key: 'tolerance',
        align:'center',
        render: (text, record) => (
          <InputNumber value={text} onChange={value => this.changeCell(value, record.key, 'tolerance')} />
        )
      },
      {
        title: 'Count',
        dataIndex: 'dieCount',
        key: 'dieCount',
        align:'center',
        render: (text, record) => (
          <InputNumber value={text} onChange={value => this.changeCell(value, record.key, 'dieCount')} />
        )
      },
      {
        title:'Action',
        key:'action',
        render:(text, record) => (
          <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record)}>
            <Icon type='delete' />
          </Popconfirm>
        )
      }
    ]
    return (
      <StyleCluster>
        <Table dataSource={this.state.tableData} columns={columns} bordered size='small' pagination={{ pageSize: 5 }}></Table>
        <ButtonGroup>
          <Button type='default' onClick={this.addTableCell}><Icon type='plus' /></Button>
          <Button type='default' onClick={this.saveTable}>Save</Button>
        </ButtonGroup>
      </StyleCluster>
    )
  }
}

export default ReticleRepeater
