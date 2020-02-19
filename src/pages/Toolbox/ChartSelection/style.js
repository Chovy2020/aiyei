import styled from 'styled-components'
// import { Card, List } from 'antd'

export const StyleChartSelection = styled.div`
  .ant-select-selection-selected-value {
    font-size: 12px;
  }
`

export const StyleTooltip = styled.div`
  margin: 0 5px;
  display: flex;
  i {
    cursor: pointer;
    margin: 5px;
    height: 20px;
  }
  i.checked,
  i:hover {
    color: #409eff;
  }
`

export const StyleChart = styled.div`
  width: 100%;
  height: 400px;
`

export const StyleOperBtn = styled.div`
  display: flex;
`

export const StyleCrossModuleForm = styled.div`
`

export const StyleCorrelationForm = styled.div`
`

export const FormItemLabel = styled.span`
  display: inline-block;
  width: 60px;
  text-align: right;
  padding-right: 5px;
`