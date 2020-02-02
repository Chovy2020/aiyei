import React from 'react'
import { BrowserRouter, Route, Switch, Redirect, Link } from 'react-router-dom'
import { Icon } from 'antd'
import { Header, Logo, Container, Menu, Main } from './style'
import { MENUS } from '@/utils/const'

// Router
import HomePage from '@/pages/Home/Loadable'
import Toolbox from '@/pages/Toolbox'
import Setup from '@/pages/Setup'
import Page404 from '@/pages/Account/404'


const routes = {
  '/toolbox': Toolbox,
  '/setup': Setup,
  '/': Toolbox,
  '/*': Page404
}

const generateRoute = (route, key) => <Route key={key} exact={route === '/'} path={route} component={routes[route]} />

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <BrowserRouter>
        <Header>
          <Logo>Aurora AI Defect</Logo>
        </Header>
        <Container>
          <Menu>
            <ul>
              {MENUS.map(m => (
                <li className='' key={m.link}>
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
        </Container>
      </BrowserRouter>
    )
  }
}

export default App
