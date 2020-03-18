/* eslint-disable */
import React from 'react'
import { Form, Select, Checkbox, Button, InputNumber, TreeSelect } from 'antd'
import { delay } from '@/utils/web'
import { CA_DATA_SOURCES, CA_METROLOGY_PRODUCTS } from '../constant'
import { StyleCorrelationForm } from '../style'
import { getCaWatTreeData, searchCA } from '../service'
import CorrelationChart from './CorrelationChart'
class CorrelationForm extends React.Component {
  constructor(props) {
    super(props)                                                                                                                                         
    this.state = {
      caDataSource: [],
      caMetrologySteps: [],
      caMetrologyParameters: [],
      caMetrology: {
        product: [],
        step: [],
        parameter: []
      },
      caWatTreeData: null,
      caWat: {
        product: [],
        tree: []
      },
      caCpProducts: [],
      caCpBins: [],
      caCp: {
        product: [],
        bin: []
      },
      caIFTools: [],
      caIFParameters: [],
      caIFTimeRages: [],
      caIF: {
        tool: [],
        parameter: [],
        timeRage: []
      },
      caRegression: {
        checked: false,
        value: null
      },
      caCharts: []
    }
  }

  componentDidMount() {
    this.onCAInit()
  }
  onCAInit = async () => {
    await delay(100)
    const singleWaferKey = this.props.singleWaferKey
    let res = await getCaWatTreeData({ singleWaferKey })
    if (res) {
      const caWatTreeData = []
      for (const i in res) {
        const arr = _.uniq(res[i])
        caWatTreeData.push({
          title: i,
          value: i,
          key: i,
          selectable: false,
          children: arr.map(item => {
            return {
              title: item,
              value: item,
              key: `${i}-${item}`
            }
          })
        })
      }
      this.setState({ caWatTreeData })
    }
  }
  onCADataSourceChange = caDataSource => {
    this.setState({ caDataSource })
  }
  onCAMetrologyChange = (key, value) => {
    const { caMetrology } = this.state
    caMetrology[key] = value
    this.setState({ caMetrology })
  }
  onCAWatProductChange = value => {
    const { caWat } = this.state
    caWat.product = value
    this.setState({ caWat })
  }
  onCACPChange = (key, value) => {
    const { caCp } = this.state
    caCp[key] = value
    this.setState({ caCp })
  }
  onCAWatTreeChange = value => {
    const { caWat } = this.state
    caWat.tree = value
    this.setState({ caWat })
  }
  onCAIFChange = (key, value) => {
    const { caIF } = this.state
    caIF[key] = value
    this.setState({ caIF })
  }
  onCARegressionChange = (key, value) => {
    const { caRegression } = this.state
    caRegression[key] = value
    this.setState({ caRegression })
  }
  onCASearch = async () => {
    this.setState({ caCharts: [] })
    const { caWat, caRegression } = this.state
    const { singleWaferKey, formInline } = this.props
    const correlation = {
      wat: caWat.tree
    }
    if (caRegression.checked) correlation.greaterThanValue = caRegression.value
    const filter = {
      add: ['Y']
    }
    // filter[formInline.x2ndValue] = AnalysisCondition
    const pareto = {
      '1stXCode': formInline.xValue,
      '2ndXCode': formInline.x2ndValue,
      yCode: formInline.yValue
    }
    const caCharts = await searchCA({
      singleWaferKey,
      filter,
      pareto,
      correlation
    })
    this.setState({ caCharts })
  }
  onCAReset = () => {
    this.setState({
      caDataSource: [],
      caCharts: [],
      caMetrology: {
        product: [],
        step: [],
        parameter: []
      },
      caWat: {
        product: [],
        tree: []
      },
      caCp: {
        product: [],
        bin: []
      },
      caIF: {
        tool: [],
        parameter: [],
        timeRage: []
      },
      caRegression: {
        checked: false,
        value: null
      }
    })
  }

  render() {
    const {
      caDataSource,
      caMetrologySteps,
      caMetrologyParameters,
      caWat,
      caWatTreeData,
      caCpProducts,
      caCpBins,
      caIFTools,
      caIFParameters,
      caIFTimeRages,
      caCharts
    } = this.state
    const {caWatProducts} = this.props
    return (
      <StyleCorrelationForm>
        <h4>Correlation Analysis</h4>
        <Form layout='vertical' labelCol={{ span: 2 }}>
          <Form.Item label='Data Source:'>
            <Checkbox.Group options={CA_DATA_SOURCES} value={this.state.caDataSource} onChange={this.onCADataSourceChange} />
          </Form.Item>
          {caDataSource.includes('Metrology') ? (
            <Form.Item label='Metrology:'>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCAMetrologyChange('product', v)}
              >
                {CA_METROLOGY_PRODUCTS.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCAMetrologyChange('step', v)}
              >
                {caMetrologySteps.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCAMetrologyChange('parameter', v)}
              >
                {caMetrologyParameters.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}
          {caDataSource.includes('WAT') ? (
            <Form.Item label='WAT:'>
              <Select
                allowClear
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={this.onCAWatProductChange}
              >
                {caWatProducts.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
              <TreeSelect
                style={{ width: 610, marginLeft: 10 }}
                value={caWat.tree}
                allowClear
                multiple
                treeDefaultExpandAll
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={caWatTreeData}
                placeholder='Please select'
                onChange={this.onCAWatTreeChange}
              />
            </Form.Item>
          ) : null}
          {caDataSource.includes('iEMS/FDC') ? (
            <Form.Item label='iEMS/FDC:'>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCAIFChange('tool', v)}
              >
                {caIFTools.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCAIFChange('parameter', v)}
              >
                {caIFParameters.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCAIFChange('timeRage', v)}
              >
                {caIFTimeRages.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}
          {caDataSource.includes('CP') ? (
            <Form.Item label='CP:'>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCACPChange('product', v)}
              >
                {caCpProducts.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
              <Select
                allowClear
                mode='multiple'
                style={{ width: 300 }}
                placeholder='Please select'
                onChange={v => this.onCACPChange('bin', v)}
              >
                {caCpBins.map(item => (
                  <Select.Option key={item}>{item}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item label='Regression:'>
            <Checkbox checked={this.state.caRegression.checked} onChange={e => this.onCARegressionChange('checked', e.target.checked)}>
              Filter in R-Squared >=
            </Checkbox>
            <InputNumber value={this.state.caRegression.value} min={0} max={1} step={0.01} onChange={v => this.onCARegressionChange('value', v)} />
          </Form.Item>
          <Form.Item label=' '>
            <Button onClick={this.onCASearch} type='primary'>
              Search
            </Button>
            <Button onClick={this.onCAReset} type='danger'>
              Reset
            </Button>
          </Form.Item>
        </Form>
        {caCharts.map((chart, index) => (
          <CorrelationChart data={chart} name={name} key={index} index={index} />
        ))}
      </StyleCorrelationForm>
    )
  }
}

export default CorrelationForm
