import React from 'react'
import _ from 'lodash'
import { Table, Input, InputNumber, Button, Icon, Popconfirm } from 'antd'
import Highlighter from 'react-highlight-words'
import { StyleCluster } from './style'
import { getCluster, updateCluster } from './service'

const ButtonGroup = Button.Group

class Cluster extends React.Component {
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
    getCluster({}).then(response => {
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
      distance: 0,
      minimalCnt: 0 }
    this.setState({ tableData: [...this.state.tableData, newCell] })
  }

  handleDelete = key => {
    const newData = _.cloneDeep(this.state.tableData)
    newData.splice(key, 1)
    const resData = _.cloneDeep(newData).map((item, idx) => {
      item.key = idx
      return item
    })
    this.setState({ tableData: resData })
  }

  saveTable = () => {
    const cfgClusterDefinitions = this.state.tableData.map(item => ({ productId: item.productId,
      stepId: item.stepId,
      technology: 'T1',
      distance: item.distance,
      minimalCnt: item.minimalCnt,
      createBy: 'xrj',
      remarks: null,
      updateTm: null }))
    updateCluster({ cfgClusterDefinitions }).then(response => {
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
        title: 'Distance',
        dataIndex: 'distance',
        key: 'distance',
        align:'center',
        render: (text, record) => (
          <InputNumber value={text} onChange={value => this.changeCell(value, record.key, 'distance')} />
        )
      },
      {
        title: 'Minimal Cnt',
        dataIndex: 'minimalCnt',
        key: 'minimalCnt',
        align:'center',
        render: (text, record) => (
          <InputNumber value={text} onChange={value => this.changeCell(value, record.key, 'minimalCnt')} />
        )
      },
      {
        title:'Action',
        key:'action',
        render:(text, record) => (
          <Popconfirm title='Sure to delete?' onConfirm={() => this.handleDelete(record.key)}>
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

export default Cluster
