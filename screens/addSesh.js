import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';

import Inputs from '../components/addInput.js';
import SeshOwner from '../components/owner.js';

import firebase from '../config/FirebaseClient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Card, Paragraph, List} from 'react-native-paper';
import {
  AdMobBanner,
  AdMobInterstitial,
} from 'react-native-admob';

export default class AddSesh extends Component {
  static navigationOptions = {
     title: 'Start an activity'.toUpperCase(),
   };

  constructor(props){
    super(props);
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.state = {
      userID: this.props.screenProps.uid,
      navigation: this.props.navigation,
      inProgress: 0,
      isLoading: true,
      seshInfo: '',
    };
  }
  componentWillMount() {
    if(Platform.OS == 'android') {
      AdMobInterstitial.setAdUnitID('ca-app-pub-7628656525912627/1940599376');
    }
    else {
      AdMobInterstitial.setAdUnitID('ca-app-pub-7628656525912627/5651957139');
    }

    AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());
  }
  componentDidMount() {
    this.checkExisting();
  }

  checkExisting() {


    var that = this;

    //check sessions
    const ref = firebase.firestore().collection('sessions').doc(this.state.userID);
    ref.get().then((doc) => {
      if (doc.exists) {
        that.setState({
          inProgress: 1,
        });
      }
      else {
        that.setState({
          inProgress: 0,
        });
      }


    })
    .catch(error => {
       console.log("Database is unavailable right now, please try again " + error);
    });

    that.setState({isLoading: false});
  }

  handleToUpdate(stateObj) {
    if(stateObj == 'delete') {
      this.setState({ inProgress: 0});
    }
    else {
      this.setState({ inProgress: 1, seshInfo: stateObj});
    }

  }

  render() {

    if(this.state.isLoading){
      return(
        <View style={styles.container2}>
          <Text style={styles.title}>
              Connecting to Database...
            </Text>
          <ActivityIndicator size="large" color="#11662F"/>
        </View>
      )
    }
    else if(this.state.inProgress == 1) {
      return (
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
          <SeshOwner navigation={this.state.navigation} handleToUpdate = {this.handleToUpdate} screenProps={{uid: this.state.userID, seshInfo: this.state.seshInfo}}/>
          </ScrollView>
        </View>
      );
    }
    else {
      return (
         <KeyboardAwareScrollView style={{backgroundColor: '#F5F5F5'}} showsVerticalScrollIndicator={false}>
         <View style={styles.container}>
          <Inputs handleToUpdate = {this.handleToUpdate} screenProps={{uid: this.state.userID}} />
          </View>
          </KeyboardAwareScrollView>

      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#F5F5F5',
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  input: {
      margin: 15,
      height: 40,
      borderColor: '#7a42f4',
      borderWidth: 1
   },
});
