import React, { Component } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, AsyncStorage } from 'react-native';
import { List, ListItem, Text, Button } from 'react-native-elements';
import { Card, Paragraph} from 'react-native-paper';
import firebase from '../config/FirebaseClient.js';

class SeshDetails extends Component {

  static navigationOptions = {
     title: 'Activity Details'.toUpperCase(),
   };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      isLoading: true,
      dataSource: {
        seshKey: JSON.parse(navigation.getParam('seshKey')),
        seshName: JSON.parse(navigation.getParam('seshName')),
        seshTime: navigation.getParam('seshTime'),
        seshDuration: navigation.getParam('seshDuration'),
        seshStreet: JSON.parse(navigation.getParam('seshStreet')),
        seshZipcode: JSON.parse(navigation.getParam('seshZipcode')),
        seshDesc: JSON.parse(navigation.getParam('seshDesc')),
        seshType: JSON.parse(navigation.getParam('seshType')),
      },
      key: '',
      userID: this.props.screenProps.uid,
      userName: '',
      permission: 'no ask',
      cityName: '',
      stateName: '',
    };

  }

  componentDidMount() {
    this.setState({
      isLoading:false,
    });
    this._mounted = true;

    this.getUserName();
    this.getCityNameFromZip();
    this.getPermission();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  getUserName() {
    var that = this;
    var docRef = firebase.firestore().collection('users').doc(this.state.userID);
    docRef.get().then((doc) => {
      if(doc.exists) {
        that.setState({
          userName: doc.data().name,
        });
      }
      else {
        that.setState({
          userName: 'Mary Jane',
        });
      }
    });

  }

  askToJoin(key) {

    this.setState({
      permission: 'undecided',
    });

    let sessionKey = key + '_x';
    AsyncStorage.setItem('sessionKey',JSON.stringify('undecided')).then(this.props.navigation.goBack());

    alert("Thanks! The activity owner will review.");
    //this.props.navigation.goBack();

    var userName = this.state.userName;
    var that = this;
    const { navigation } = this.props;
    var docRef = firebase.firestore().collection('sessions').doc(key).collection('players').doc(this.state.userID);
    docRef.get().then((doc) => {
      if (!doc.exists) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        docRef.set({
          permission: 'undecided',
          reqDate: timestamp,
          name: userName,
        });

      }
   });
  }

  async retrieveItem(key) {
    try {
      const retrievedItem =  await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      return item;
    } catch (error) {
      console.log(error.message);
    }
    return
  }


  getPermission() {
    this.setState({isLoading: true});
    //first get the asyncstorage
    let sessionKey = this.state.dataSource.seshKey + '_x';
    this.retrieveItem('sessionKey').then((perms) => {
        //this callback is executed when your Promise is resolved
        if(perms) {
          this.setState({permission: perms});
        }
        else {
          this.setState({permission: 'no ask'});
        }
        this.setState({isLoading: false});
        this.getUpdatedPerms();

    }).catch((error) => {
        //this callback is executed when your Promise is rejected
        console.log('Promise is rejected with error: ' + error);
    });
  }

  getUpdatedPerms() {
    var that = this;
    const ref = firebase.firestore().collection('sessions').doc(this.state.dataSource.seshKey).collection('players').doc(this.state.userID);
    ref.get().then((doc) => {
      if (doc.exists) {
        if(this._mounted) {
          that.setState({
            permission: doc.data().permission,
          });
        }
      }
      else {
        if(this._mounted) {
          that.setState({ permission: 'no ask' });
        }
      }
    });

  }

  displayAsk() {

    if(this.state.permission == 'no ask') {
      return (
        <View style={styles.detailButton}>
          <Button
            large
            backgroundColor={'#16800F'}
            color={'#FFFFFF'}
            leftIcon={{name: 'redeem'}}
            title='Ask to Join'
            onPress={() => this.askToJoin(this.state.dataSource.seshKey)} />
        </View>
      )
    }
    else if(this.state.permission == 'undecided') {
      return (
        <View>
          <Text style={styles.displayMsg}> Pending a decision</Text>
        </View>
      )
    }
    else if(this.state.permission == 'true') {
      return (
        <View>
          <Text style={styles.displayMsg}> The activity is at {this.state.dataSource.seshStreet} {this.state.cityName}, {this.state.stateName} {this.state.dataSource.seshZipcode}</Text>
        </View>
      )

    }
    else {
      return (
        <View>
          <Text style={styles.displayMsg}> You have been denied to join this actvity</Text>
        </View>
      )

    }

  }

  getCityNameFromZip() {
    //now get all zip within 10 miles
    fetch(`https://us-central1-blaze-2bbbc.cloudfunctions.net/getCityFromZip?zip=${this.state.dataSource.seshZipcode}`)
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          cityName: responseJson.city,
          stateName: responseJson.state,
        })

    }).catch((error) =>{
      console.error(error);
    });

  }
  render() {
    var moment = require('moment');
    var day = moment.unix(this.state.dataSource.seshTime);

    if(this.state.isLoading){
      return(
        <View style={styles.activity}>
          <Text style={styles.title}>
              Checking with database...
            </Text>
          <ActivityIndicator size="large" color="#11662F" />
        </View>
      )
    }
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.cardContainer}>
          <View style={styles.subContainer}>
            <View>
              <Text style={styles.infoLabel}>Name of Activity: </Text>
              <Text style={styles.textContent}>{this.state.dataSource.seshName}</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>Type of Activity: </Text>
              <Text style={styles.textContent}>{this.state.dataSource.seshType}</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>Description: </Text>
              <Text style={styles.textContent}>{this.state.dataSource.seshDesc}</Text>
            </View>
            <View>
              <Text style={styles.infoLabel}>Located at: </Text>
              <Text style={styles.textContent}>{this.state.cityName}, {this.state.stateName}</Text>
            </View>
            <View>
            <Text style={styles.infoLabel}>Time: </Text>
              <Text style={styles.textContent}>Started at {day.format('LLL')} and will end after {this.state.dataSource.seshDuration} hour(s).</Text>
            </View>
          </View>
          {this.displayAsk()}
        </Card>
      </ScrollView>
    );
   }
}

export default SeshDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  cardContainer: {
    backgroundColor: '#FFF'
  },
  subContainer: {
    flex: 1,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#CCCCCC',
  },
  activity: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailButton: {
    marginTop: 10
  },
  displayMsg: {
    margin: 20
  },
  infoLabel: {
    marginTop: 10,
    textAlign: 'left',
    marginLeft:10,
    color:'#808080'
  },
  textContent: {
    marginTop: 10,
    textAlign: 'left',
    marginLeft:10,
    color:'#000'
  },
})
