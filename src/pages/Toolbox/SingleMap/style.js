import styled from 'styled-components'
import { Table } from 'antd'

export const StyleSingleMap = styled.div`
  .mapPareto {
    display: flex;
  }
  .single-map-table {
    margin: 20px 20px 0 0;
  }
`

export const StyleWafer = styled.div`
  display: flex;
  flex-direction: column;
  width: 428px;
  .formDropDown {
    height: 50px;
    button + button {
      margin-left: 10px;
    }
  }
  .heatmap-canvas {
    z-index: -999;
  }
  .mapContent {
    display: flex;
    .single-map-content {
      position: relative;
      width: 400px;
      height: 400px;
      border: 1px solid #ccc;
      .single-map-main {
        width: 400px;
        height: 400px;
      }
    }
    .operBtn {
      margin: 0 5px;
      display: flex;
      flex-direction: column;
      i {
        cursor: pointer;
        margin-bottom: 5px;
        height: 20px;
        font-size: 18px;
      }
      i.checked,
      i:hover {
        color: #409eff;
      }
    }
  }
  .heatRuler {
    text-align: center;
    margin: 0 5px;
  }
  .heatMapRuler {
    height: 90%;
    width: 10px;
    margin: 0 auto;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: linear-gradient(#f65656, #54ca44, #c6c6fe);
  }
`

export const StylePareto = styled.div`
  flex: 1;
  .ant-select-selection-selected-value {
    font-size: 12px;
  }
`
export const StyleDSA = styled.div`
  flex: 1;
`

export const StyleChart = styled.div`
  width: 830px;
  height: 400px;
`

export const StyleImages = styled.div`
  display: none;
  position: absolute;
  z-index: 999;
  min-width: 270px;
  height: 208px;
  max-height: 400px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 0 10px 10px 10px;
  box-shadow: 0px 0px 20px #aaa;
  &.hidden {
    display: none;
  }
  .anticon-close {
    position: absolute;
    right: 3px;
    top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    cursor: pointer;
  }
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-top: 15px solid #aaa;
    border-bottom: 15px solid transparent;
    border-right: 15px solid transparent;
  }
  .imageDetail {
    padding: 20px 10px 7px;
    height: 171px;
    .imageContent {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 0;
      li {
        box-sizing: border-box;
        width: 104px;
        margin: 2px 10px;
        display: block;
        overflow: hidden;
        border: 2px solid #eee;
        img {
          display: block;
          width: 100px;
          height: 100px;
        }
        div {
          margin: 0;
          line-height: 1;
          font-size: 12px;
          width: 200%;
          margin-left: -25%;
          -webkit-transform: scale(0.75);
          transform: scale(0.75);
          padding-left: 2px;
        }
      }
    }
  }
`

export const StyleTable = styled(Table)`
  .ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-thead > tr > th,
  .ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-tbody > tr > td {
    padding: 2px 8px;
  }
`

// bin时, 增加legend
export const StyleBinLegend = styled.div`
  width: 428px;
  height: 24px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
export const StylePrevBin = styled.div`
  height: 0;
  width: 0;
  border-top:6px solid transparent;
  border-bottom:6px solid transparent;
  border-right:6px solid #2f4554;
  cursor: pointer;
`
export const StyleNextBin = styled.div`
  height: 0;
  width: 0;
  border-top:6px solid transparent;
  border-bottom:6px solid transparent;
  border-left:6px solid #2f4554;
  cursor: pointer;
  margin-right: 5px;
`
export const StyleNextPage = styled.div`
  display: flex;
  align-items: center;
`
export const StyleBinUl = styled.span`
  list-style-type: none;
  display: flex;
  li {
    display: flex;
    align-items: center;
    font-size: 13px;
    padding: 5px;
  }
`
export const StyleBinColorBlock = styled.span`
  display: inline-block;
  height: 12px;
  width: 20px;
  border-radius: 4px;
  margin-right: 5px;
  opacity: 0.7;
`