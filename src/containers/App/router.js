import React from 'react'
import { BrowserRouter, Route, Switch, Redirect, Link } from 'react-router-dom'
import { Icon } from 'antd'
import { Header, Logo, Container, Menu, Main } from './style'

// Router
import HomePage from '@/pages/Home/Loadable'
import DataQuery from '@/pages/Toolbox/DataQuery/Loadable'

const routes = {
  '/toolbox': DataQuery,
  '/': HomePage
}

// Menu
const MENU = [
  {
    link: 'excursion',
    title: 'Excursion',
    icon: 'dashboard'
  },
  {
    link: 'baseline',
    icon: 'file-image',
    title: 'Baseline Reporting'
  },
  {
    link: 'toolbox',
    icon: 'tool',
    title: 'Toolbox'
  },
  {
    link: 'setup',
    icon: 'setting',
    title: 'Set Up'
  }
]

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
              {MENU.map(m => (
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
              <Redirect to='' />
            </Switch>
          </Main>
        </Container>
      </BrowserRouter>
    )
  }
}

export default App
