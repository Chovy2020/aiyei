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

export const StyleCluster = styled.div`
  display: flex;
  flex-direction: column;
`
export const DiePitch = styled.div`
  height: 400px;
  width: 400px;
  border: 1px solid #e8e8e8;
  box-sizing: content-box;
  overflow: hidden;
  position: relative;
`
export const LayoutInline = styled.div`
  display: flex;
  justify-content: space-around;
`
export const LayoutVertical = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 420px);
`
export const DivStyle = styled.div`
  position: absolute;
  border: 1px solid rgb(204, 204, 204);
  display: flex;
  align-items: center;
  justify-content: center;
`
