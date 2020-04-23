import styled from 'styled-components'

export const StyleExcursion = styled.div`
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
export const StyleExcursionOperBtn = styled.div`
  display: flex;
  flex-direction: row-reverse;
`

export const StyleMapPareto = styled.div`
  display: flex;
  flex-direction: column;
  >div {
    margin-bottom: 20px;
  }
`

export const StyleMPOper = styled.div`
  display: flex;
  justify-content: space-between;
`
export const StyleImgList = styled.ul`
  display: flex;
  width: 80%;
  margin: 0 auto;
  height: 50px;
  list-style: none;
  li {
    height: 100%;
    width: 100%;
    text-align: center;
  }
  img {
    cursor: pointer;
    width: 80%;
    height: 80%;
    margin: 0 auto;
  }
`