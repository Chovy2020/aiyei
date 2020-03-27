import styled from 'styled-components'

export const StyleSetUp = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  >div {
    margin-bottom: 20px;
  }
  >.ant-collapse > .ant-collapse-item > .ant-collapse-header {
    background: #8bc5ff;
  }
`

export const StyleReporting = styled.div`
  display: flex;
  flex-direction: column;

  .ant-btn {
    min-width: 0;
  }
`
