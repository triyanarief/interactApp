// @flow
import React, { Component, PropTypes } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View
} from 'react-native'
import Dashboard from './app/scenes/Dashboard'
import Authentication from './app/scenes/Authentication'
import { Actions, Scene, Router } from 'react-native-router-flux';
import * as firebase from 'firebase'
import RNRestart from 'react-native-restart'

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: ""
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);

export default class kyn extends Component {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <Router>
                <Scene key={'root'}>
                    <Scene
                        key={'authentication'}
                        component={Authentication}
                        initial={true}
                        hideNavBar={true}
                    />
                    <Scene
                        key={'dashboard'}
                        component={Dashboard}
                        // initial={true}
                        hideNavBar={false}
                        backTitle={'LOG OUT'}
                        onBack={this._signOut}
                    />
                </Scene>
            </Router>
        );
    }

    /**
    * Function that signs out the currently logged in user, pops the scene from
    * the navigation stack so that the
    **/
    _signOut() {
        firebaseApp.auth().signOut().then(function() {
            // Successfully logged out
            Actions.pop();
            // HACK: Restarting the app after signOut to reset all the states
            RNRestart.Restart();
            // NOTE: Debugging
            console.log('Signed out')
        }, function(error) {
            // An error occured
            console.log(error.code);
            console.log(error.message);
        })
    }
}

AppRegistry.registerComponent('kyn', () => kyn);
