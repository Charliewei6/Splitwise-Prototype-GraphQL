import React, { Component } from 'react';
import './App.css';
import Main from './components/Main';
import {BrowserRouter} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
//App Component
const client = new ApolloClient({
  uri: `http://localhost:3001/graphql`
});
class App extends Component {
  render() {
    return (
      //Use Browser Router to route to different pages
      <ApolloProvider client={client}> 

      <BrowserRouter>
          {/* App Component Has a Child Component called Main*/}
          <Main/>
      </BrowserRouter>
      </ApolloProvider>
    );
  }
}
//Export the App component so that it can be used in index.js
export default App;
