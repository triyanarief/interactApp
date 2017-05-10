import React, { Component, PropTypes } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    TouchableOpacity,
    TextInput,
    Platform
} from 'react-native'
import StatusbarBackground from '../components/StatusbarBackground'
import ViewContainer from '../components/ViewContainer'
import ListItem from '../components/ListItem'
import { firebaseApp } from '../../index.ios.js'
import { BleManager } from 'react-native-ble-plx'
import { Buffer } from 'buffer'
import { scanForDevices, connect } from '../services/ble-functions.js'

// Global variable that stores the interest that should be written to the MCU
var interestToWrite = ''

// Global constant holding the UUID of the connection device
const deviceUUID = 'A68F54B9-A343-48F8-9590-90382FB4FEF6'
// Other
// const deviceUUID = 'AF3A392B-A3BD-4502-6C4C-7EB2F763CFB5'

export default class Dashboard extends Component {
    constructor(props) {
        super(props)

        // Create realtime database reference as property
        this.itemsRef = firebaseApp.database().ref()

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })

        this.state = {
            input: '',
            userUID: '',
            dataSource: ds.cloneWithRows(['row 1', 'row 2'])
        }

        // // Instansiate a new Bluetooth manager
        this.manager = new BleManager()
    }

    componentWillMount() {
        // In ios, we need to wait for a state change before we can scan for devices
        if (Platform.OS === 'ios') {
            // If the platform is ios, we wait for the state to change before scanning
            this.manager.onStateChange((state) => {
                scanForDevices(this.manager, deviceUUID)
            })
        } else {
            // In Android, we can just start the scan
            scanForDevices(this.manager, deviceUUID)
        }
    }

    componentDidMount() {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows([
                {interest: ''}
            ])
        })

        this.listenForItems(this.itemsRef)

        // Get the user uid of the currently logged in user, and set in in state
        firebaseApp.auth().onAuthStateChanged((user) => {
            if (user) {
                var userUID = firebaseApp.auth().currentUser.uid
                this.setState({userUID: userUID})
            }
        })
    }

    render() {
        return (
            <ViewContainer>
                <StatusbarBackground />

                <View style={styles.input}>
                    <TextInput
                        style={styles.inputField}
                        placeholder="interest"
                        onChangeText={(input) => this.setState({input})}
                        value={this.state.input}
                    />
                </View>

                <View style={styles.button}>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={this._addInterest.bind(this)}>
                        <Text style={styles.buttonText}>add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonContainerSync}
                        onPress={() => connect(this.manager, deviceUUID, interestToWrite)}>
                        <Text style={styles.buttonText}>sync</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.seperator}></View>

                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}
                    renderSeparator={this._renderSeparator}
                />
            </ViewContainer>
        );
    }

    _renderRow(rowData: string, sectionID: number, rowID: number) {
        return (
            <ListItem rowData={rowData} />
        )
    }

    _renderSeparator(sectionID: number, rowID: number) {
        return (
            <View
                key={`${sectionID} + ${rowID}`}
                style={styles.separator}
            />
        )
    }

    /**
    * Function that uses the realtime database reference, to push an in item
    * with the values of interest and userUID set in state, to the database.
    **/
    _addInterest() {
        if (this.state.input) {
            this.itemsRef.push({
                interest: this.state.input,
                userUID: this.state.userUID
            })

            interestToWrite = this.state.input
            console.log(interestToWrite)
            this.setState({input: ''})
        }
    }

    /**
    * Function creates a listener for all items in the database. Whenever an items
    * is addded, changed, or removed, it will get the entire result set back as a
    * DataSnapshot from Firebase.
    * It then iterates over each child and adds the ones with the corresponding
    * user UID to an array, and then calls cloneWithRows on the data source.
    **/
    listenForItems(itemsRef) {
        itemsRef.on('value', (snap) => {

            // Get children as an array
            var items = []
            snap.forEach((child) => {
                // If the userUID set in the state is equal to the one set in the
                // child, push that child to the array of items
                if (this.state.userUID === child.val().userUID) {
                    items.push({
                        userUID: child.val().userUID,
                        interest: child.val().interest,
                        _key: child.key
                    })
                }
            })

            // Clones the dataSource with the new rows from the items array
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(items)
            })
        })
    }
}

const styles = StyleSheet.create({
    input: {
        marginTop: 80
    },
    inputField:{
        height: 50,
        backgroundColor: '#FFFF',
        borderColor: '#C5C5C5',
        borderWidth: 1,
        fontSize: 13,
        textAlign: 'center'
    },
    separator: {
        backgroundColor: '#C9C9C9',
        height: 1
    },
    button: {
        padding: 40
    },
    buttonContainer: {
        backgroundColor: '#F97151',
        height: 50,
        overflow: 'hidden',
        borderRadius: 30,
        marginBottom: 10
    },
    buttonContainerSync: {
        backgroundColor: '#E9E9E9',
        height: 50,
        overflow: 'hidden',
        borderRadius: 30
    },
    buttonText: {
        textAlign: 'center',
        padding: 15
    },
    seperator: {
        height: 1,
        backgroundColor: '#C5C5C5'
    }
});
