import React, { Component, PropTypes } from 'react'
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native'
import ViewContainer from '../components/ViewContainer'
import Dashboard from './Dashboard'
import { firebaseApp } from '../../index.ios.js'
import { Actions } from 'react-native-router-flux'

export default class Authentication extends Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            password: '',
            status: ''
        }
    }

    render() {
        return (
            <ViewContainer>
                <View style={styles.welcome}>
                    <Text style={styles.message}>Welcome! Please Log In.</Text>
                </View>
                <View style={styles.inputFields}>
                    <TextInput
                        style={styles.input}
                        placeholder="email"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={(input) => this.setState({email: input})}
                        value={this.state.email}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={(input) => this.setState({password: input})}
                        value={this.state.password}
                        secureTextEntry={true}
                    />
                </View>
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.loginButton} onPress={this._login.bind(this)}>
                        <Text style={styles.buttonText}>log in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signupButton} onPress={this._signUp.bind(this)}>
                        <Text style={styles.buttonText}>sign up</Text>
                    </TouchableOpacity>
                </View>
            </ViewContainer>
        )
    }

    /**
     * Function that handles onPress event from sign up button and creates a user
     * in Firebase with the entered email and password.
    **/
    _signUp() {
        firebaseApp.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(function(error) {
            // Promise was fulfilled

            // Call the login function
            this._login()
        }, function(error) {
            // Promise was rejected
            console.log(error)
        })
    }

    /**
     * Function that handles onPress event from sign up button and logs in user
     * already authorised, with the entered email and password.
    **/
    _login() {
        firebaseApp.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(function() {
            // Promise was fulfilled

            // Push the new scene on top of the navigation stack, and clears the input fields
            Actions.dashboard()
        }, function(error) {
            console.log(error);
        })

        // Reset the email and password state
        this.setState({email: ''})
        this.setState({password: ''})
    }
}

const styles = StyleSheet.create({
    welcome: {
        marginTop: 150
    },
    message: {
        textAlign: 'center',
        color: '#B4B4B4',
        fontSize: 15
    },
    inputFields: {
        marginTop: 40
    },
    input: {
        height: 50,
        backgroundColor: '#FFFF',
        textAlign: 'center',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#C5C5C5',
        marginBottom: 15
    },
    buttons: {
        padding: 40
    },
    loginButton: {
        height: 50,
        backgroundColor: '#F97151',
        overflow: 'hidden',
        borderRadius: 30,
    },
    signupButton: {
        height: 50,
        backgroundColor: '#E9E9E9',
        overflow: 'hidden',
        borderRadius: 30,
        marginTop: 15
    },
    buttonText: {
        textAlign: 'center',
        padding: 17
    }
})
