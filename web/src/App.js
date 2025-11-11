
import React, {  } from 'react';
import { withRouter } from "react-router";
import { connect } from 'react-redux'
import { Switch, Route } from 'react-router-dom';
import Home from './components/home'
import Setting from './components/Setting'
import Container from '@mui/material/Container';
import MenuAppBar from './header';
import Search from './components/Search';

const pages = [
  {to: '/setting', route: <Setting/>, name: "Setting"},
  {to: '/search', route: <Search/>, name: "Search"},
];

const App = ({}) => {
  return (
    <>      

      <MenuAppBar pages={pages}/>
      <Container maxWidth="false">
        <Switch>
        {
            pages.map((p, i) => <Route 
                key={`route_${i}`} 
                path={p.to}
                allow={true}>
                  {p.route}
            </Route>)
          }
          <Route to="/">
            <Home></Home>
          </Route>
        </Switch>
      </Container>
    </>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}
export default connect(mapStateToProps, {})(withRouter(App)) 
