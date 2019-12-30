import React from 'react'
import { Header, Logo, Container } from './style'
import '@/assets/styles/App.css'

function Layout() {
  return (
    <div>
      <Header>
        <Logo>Aurora AI Defect</Logo>
        <div className='oper-title'>
          <div>
            <i className='el-icon-user-solid' /> Admin
          </div>
          <div>
            <i className='el-icon-switch-button' /> Logout
          </div>
        </div>
      </Header>
      <Container>
        AAA
      </Container>
    </div>
  )
}

export default Layout
