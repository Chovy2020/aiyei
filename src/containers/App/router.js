import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

// Home
import HomePage from '@/pages/Home/Loadable'

const routes = { '/': HomePage }

const generateRoute = (route, key) => <Route key={key} exact={route === '/'} path={route} component={routes[route]} />

const AppRouter = () => (
  <BrowserRouter>
    <Switch>
      {Object.keys(routes).map((route, key) => generateRoute(route, key))}
      <Route exact path='' component={HomePage} />
      <Redirect to='' />
    </Switch>
  </BrowserRouter>
)

export default AppRouter
