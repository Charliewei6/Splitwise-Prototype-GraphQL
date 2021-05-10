import React, {Component} from 'react';
import '../../App.css';
import { signUP,login,getProfile } from '../../api/request.js';
import {Form,Col,Card} from 'react-bootstrap';
import { connect } from 'react-redux';
import { SET_USER } from '../../store/actionTypes';
import jwt_decode from "jwt-decode"

//Define a Signup Component
class Signup extends Component{
    
    constructor(props){
        super(props);
        this.state = {
            name : "",
            email : "",
            password : "",
            err: "",
            token: ""
        }
        // Bind the handlers to this class
        this.nameHandler = this.nameHandler.bind(this);
        this.emailHandler = this.emailHandler.bind(this);
        this.passwordHandler = this.passwordHandler.bind(this);
        this.submitSignup = this.submitSignup.bind(this);
    }
    nameHandler = (e) => {
        this.setState({
            name : e.target.value
        })
    }
    emailHandler = (e) => {
        this.setState({
            email : e.target.value
        })
    }
    //password change handler to update state variable with the text entered by the user
    passwordHandler = (e) => {
        this.setState({
            password : e.target.value
        })
    }
    //submit Login handler to send a request to the node backend
    submitSignup = (e) => {
        e.preventDefault();
        // const data = {
        //     email : this.state.email,
        //     name : this.state.name,
        //     password : this.state.password
        // }
        const data = {
            query: `
              mutation {
                signup( userInput:{name: "${this.state.name}",email: "${this.state.email}", password: "${this.state.password}"}) {
                   email
                }
              }
            `
          };
        let emailPartten = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
        if(!emailPartten.test(this.state.email)) {
            this.setState({
                 err : 'Email format invalid!'
            })
        }else {
            signUP(data)
                .then(response => {
                      this.loginHandler()
                }).catch((error) => this.setState({
                    err: "Email Already Existed!"
                }))    
        }
        
    }
    loginHandler() {
        const data = {
            query: `
              mutation {
                login(email: "${this.state.email}", password: "${this.state.password}") {
                  jwt
                }
              }
            `
          };
      
        login(data).then(response => {
            localStorage.setItem("token", response.data.login.jwt);
            var decoded = jwt_decode(response.data.login.jwt.split(' ')[1]);
            localStorage.setItem("user_id", decoded._id);
            localStorage.setItem("email", decoded.email);

            let profile_data = {
                query: `
                query{
                    getprofile(user_id:"${decoded._id}"){
                      Name
                      Email
                      Currency
                      Phone
                      Picture
                    }
                  }`
            }
            getProfile(profile_data).then(data => {
                data.data.getprofile.Timezone = data.data.getprofile.Timezone || 'Africa/Abidjan'
                data.data.getprofile.Currency = data.data.getprofile.Currency || 0
                localStorage.setItem('userInfo',JSON.stringify(data.data.getprofile))                
                this.props.setUser(data.data.getprofile)
                this.props.history.push('/dashboard')
            })
        }).catch((error) => this.setState({
            err: "Username or password invalid!"
        }))
    }
    render(){
        return(
            <div>                
            <div>
                <div align = "center">
                <Card className="text-white">
                <Card.Img src="https://i.picsum.photos/id/3/5616/3744.jpg?hmac=QSuBxtSpEv3Qm3iStn2b_Ikzj2EVD0jzn99m1n6JD9I" alt="Card image" />
                <Card.ImgOverlay>
                    <Card.Title>INTRODUCE YOURSELF</Card.Title>
                    <Form onSubmit={this.submitSignup} method="POST">
                        <Col xs={3}>
                            <Form.Group>
                            <Form.Label>Hi there! My name is</Form.Label>
                            <Form.Control data-testid='Signup-name' onChange = {this.nameHandler} required type="text" name = "name" placeholder="Name" required />
                            </Form.Group>
                        </Col>
                        <Col xs={3}>
                            <Form.Group>
                                <Form.Label>Here’s my email address:</Form.Label>
                                <Form.Control data-testid='Signup-email' onChange = {this.emailHandler} type="email" name="email" placeholder="Email Address"required />
                            </Form.Group>
                        </Col>
                        <Col xs={3}>
                            <Form.Group>
                            <Form.Label>And here’s my password:</Form.Label>
                            <Form.Control data-testid='Signup-password' onChange = {this.passwordHandler}  type="password" name = "password" placeholder="Password" required/>
                            </Form.Group>
                        </Col>
                        <button className="btn btn-primary" type="submit">Submit</button>
                        {/* <Button onClick = {this.submitSignup}  variant="primary" type="submit">Submit</Button> */}

                </Form>
                {this.state.err}

                </Card.ImgOverlay>
                </Card>     

                
            </div>

            </div>
            </div>
        )
    }
}
Signup = connect(null,(dispatch) => {
    return {
         setUser(user) {
           dispatch({
                type:SET_USER,
                data : user
           })
         }
    }
})(Signup)
export default Signup;