import React,{Fragment} from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch, Redirect, Link } from 'react-router-dom'
import { Icon,Tooltip } from 'antd'
import { Header, Logo, Container, Menu, Main, LoginMes } from './style'
import { changeMenu, changeUser } from '@/utils/action'
import { MENUS } from '@/utils/constant'

// Router
import Login from '@/pages/Login'
import HomePage from '@/pages/Home/Loadable'
import Baseline from '@/pages/Baseline'
import Toolbox from '@/pages/Toolbox'
import Setup from '@/pages/Setup'
import Reporting from '@/pages/Setup/reporting'
import BasicConfig from '@/pages/Setup/basicConfig'
import Page404 from '@/pages/Account/404'

// Test
import TestHotkeys from '@/pages/Test/Hotkeys'

const routes = {
  '/login': Login,
  '/baseline': Baseline,
  '/toolbox': Toolbox,
  '/setup': Setup,
  '/reporting': Reporting,
  '/basicConfig': BasicConfig,
  '/': Toolbox,
  '/test/hotkeys': TestHotkeys,
  '/*': Page404
}

const generateRoute = (route, key) => <Route key={key} exact={route === '/'} path={route} component={routes[route]} />

class App extends React.Component {

  componentDidMount() {
    const path = window.location.pathname || ''
    let activeMenu = localStorage.getItem("activeMenu") || 'toolbox'
    for (const menu of MENUS) {
      if (path.indexOf(menu.link) >= 0) {
        activeMenu = menu.link
      }
    }
    this.props.changeMenu(activeMenu)
    let username = localStorage.getItem("username") || ''
    this.props.changeUser(username)
  }

  onMenuChange = activeMenu => {
    this.props.changeMenu(activeMenu)
  }

  onUsernameChange = () => {
    let username = ''
    this.props.changeUser(username)
    localStorage.setItem("username", '')
  }

  render() {
    const { activeMenu, username } = this.props 
    return (
      <BrowserRouter>
        <Header>
          <Logo>Aurora AI Defect</Logo>
          { 
            username !== '' ? 
            <LoginMes>
              <Icon type="user" style={{margin:"0 10px"}}/>Hi, {username}
              <Tooltip placement="bottom" title="退出">
                <Icon type="rollback" style={{marginLeft:"10px"}} onClick={this.onUsernameChange}/>
              </Tooltip>
            </LoginMes> : null
          }
        </Header>
        <Container>
          { 
            username === '' ? 
            (<Route path="/" component={Login} />) : 
            (
              <Fragment>
                <Menu>
                  <ul>
                    {MENUS.map(m => (
                      <li
                        onClick={() => this.onMenuChange(m.link)}
                        className={activeMenu === m.link ? 'active' : ''}
                        key={m.link}
                      >
                        <Link to={m.link}>
                          <Icon type={m.icon} />
                          <span>{m.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Menu>
                <Main>
                  <Switch>
                    {Object.keys(routes).map((route, key) => generateRoute(route, key))}
                    <Route exact path='' component={HomePage} />
                    <Redirect form='/*' to='/404' />
                  </Switch>
                </Main>
              </Fragment> 
            )
          }
        </Container>
      </BrowserRouter>
    )
  }
}

const mapStateToProps = state => ({ ...state.Init })
const mapDispatchToProps = { changeMenu, changeUser }
export default connect(mapStateToProps, mapDispatchToProps)(App)
