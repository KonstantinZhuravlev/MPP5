import React, { Component } from 'react';
import '../css/App.css';
import AuthorizationForm from './authorizationForm';
import ChatField from './chatField';
import ProfileInfo from '../extraFiles/profileInfo';
import {serverAddress, authServerAddress} from "../extraFiles/serverAddressInfo";

class App extends Component {

  state = { 
    authorized: false,
    responseBody: {
      status: 0,
      data: null
    },
	token: null,
    currentUser: null,
  }

  render() { 
    return ( 
      <div className="app">
          { this.renderAuthorizationForm() }
          { this.renderChatField() }
      </div>
    );
  }

  renderAuthorizationForm = () => {
    if(!this.state.authorized){
      return <AuthorizationForm requestRes={ this.state.responseBody } 
        logInButtonClick= { (login, password) => { this.handleLogInButtonClick(login, password) } }/>
    }
  }

  renderChatField = () => {
    if(this.state.authorized){
      return (
        <ChatField currentUser={ this.state.currentUser }
          getMessageRequest={ this.getMessageRequest }
		  unauthorizedCodeWasReceived={ this.unauthorizedCodeWasReceived }/>
      );
    }
  }

  handleLogInButtonClick = (login, password) => {
	fetch(`${authServerAddress}/login?login=${login}&password=${password}`,
	{
		method: "POST",
		credentials: 'include',
	})
	.then(res => {
		console.log(res);
		this.getUserProfileInfo(login, password);
	}) 

  }

  getUserProfileInfo = (login, password) => {
  const newState = this.state;
  var query = `query($login: String, $password: String) {
    login(login: $login, password: $password){
      name,
      surname,
      id,
      birthday,
      regDate,
      email,
      error
    }
  }`;
  
  fetch('http://localhost:3001/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { login, password },
    })
  })
  .then(r => {
    return r.json()
  })
  .then(data => {
    const result = data.data.login
    newState.responseBody.data = result;
    if(!result.error){
      newState.authorized = true;
      newState.currentUser = new ProfileInfo(
        result.id,
        result.name,
        result.surname,
        result.birthday,
        result.image,
        result.regDate, 
        result.email
      );
    }
    this.setState(newState); 
  });

	

	// fetch(`${serverAddress}/${urlStr}`)
  //   .then(response => {
  //     newState.responseBody.status = response.status;
  //     if(response.status < 300 && response.status >= 200){
  //       newState.authorized = true;
  //     }
  //     return response.json();
  //   })
  //   .then(response => {
  //     newState.responseBody.data = response;

  //     newState.currentUser = new ProfileInfo(
  //       response.id,
  //       response.name,
  //       response.surname,
  //       response.birthday,
  //       response.image,
  //       response.regDate, 
  //       response.email
	//   );
	//   console.log("log in ");
	//   this.setState(newState);  
	// });
	
  }

  unauthorizedCodeWasReceived = () => {
	  this.setState({authorized: false});
  }

  getMessageRequest = (serverAddress) => {
    
  }

}


export default App;