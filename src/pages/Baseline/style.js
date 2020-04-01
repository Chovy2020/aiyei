import styled from 'styled-components'

export const StyleBaseline = styled.div`
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
export const StyleBtn = styled.div`
  display: flex;
  flex-direction: row-reverse;
`