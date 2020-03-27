/* eslint-disable */
import React from 'react'
import store from '@/utils/store'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Icon } from 'antd'
import styled from 'styled-components'
import { changePage } from '@/utils/action'

export const MODULES = [
  {
    title: 'Key Defect Trend Chart',
    link: '/keyDefect',
    icon: 'line-chart',
  },
  {
    title: 'HOL Chart',
    link: '/hol',
    icon: 'bar-chart',
  }
]
const StyleModuleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(243, 249, 251);
  height: 100%;
  width: 100%;
  & > ul {
    display: flex;
  }
  li {
    list-style: none;
    height: 160px;
    width: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: 20px;
    cursor: pointer;
    a {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      line-height: 65px;
    }
  }
`
const StyleModule = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 16px;
  height: 100%;
  background-color: #fff;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  padding: 30px 0 0;
  &:hover {
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);
  }
`


class Baseline extends React.Component {
  onChangePage = link => {
    this.props.changePage(link.substr(1))
    localStorage.setItem("activeMenu",'baseline')
  }
  render() {
    return (
      <StyleModuleContainer>
        <ul>
          {MODULES.map(m => (
            <li key={m.title}>
              <StyleModule to={m.link} onClick={() => this.onChangePage(m.link)}>
                <Icon type={m.icon} style={{color: '#389eeb', fontSize: '45px' }}></Icon>
                <h3>{m.title}</h3>
              </StyleModule>
            </li>
          ))}
        </ul>
      </StyleModuleContainer>
        
    )
  }
}

const mapStateToProps = state => ({ ...state.Init })
const mapDispatchToProps = { changePage }
export default connect(mapStateToProps, mapDispatchToProps)(Baseline)
