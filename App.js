/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, Alert} from 'react-native';
import Root from './router';
const uniqueId = require("react-native-unique-id");
import firebase from './config/FirebaseClient';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: '',
    };
    this.setUserID();
  }
  componentDidMount() {
    var that = this;

    //get firebase authDomain
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        that.setState({  firebaseID: user.uid });
      } else {
        firebase.auth().signInAnonymously().catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          alert("Unable to authenticate with Firebase");
        });
      }
    });

  }

  setUserID() {
    var that = this;
    uniqueId().then(function(id) {
      that.setState({
        userID: id,
      });

    }).catch(function(err) {
      console.log("Failed to get UUID!", err);
    });
  }

  render() {
    return <Root screenProps={{uid: this.state.userID}}/>;
  }
}
export default App;

/*
import { Card, Paragraph, List} from 'react-native-paper';
render() {
  return (

    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome to React Native!</Text>
      <Card style={styles.card}>
        <Card.Cover
          source={{uri: 'http://weknowyourdreams.com/images/girl/girl-04.jpg'}}
        />
        <Card.Title title="Abandoned Ship" />
        <Card.Content>
          <Paragraph>
            The Abandoned Ship is a wrecked ship located on Route 108 in
            Hoenn, originally being a ship named the S.S. Cactus. The second
            part of the ship can only be accessed by using Dive and contains
            the Scanner.
          </Paragraph>
        </Card.Content>
      </Card>

      <List.Section title="Two line">
        <List.Item
          left={() => (
            <Image
              source={{uri: 'https://cdn3.iconfinder.com/data/icons/contact-us-set-3/256/66-128.png'}}
              style={styles.image}
            />
          )}
          title="List item 1"
          description="Describes item 1"
          style={styles.listItem}
          elevation={5}
        />
        <List.Item
          left={() => (
            <Image
              source={{uri: 'https://cdn3.iconfinder.com/data/icons/contact-us-set-3/256/66-128.png'}}
              style={styles.image}
            />
          )}
          title="List item 2"
          description="Describes item 2"
          style={styles.listItem}
          elevation={5}
        />
      </List.Section>
    </ScrollView>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  card: {
    margin: 8
  },
  image: {
    height: 40,
    width: 40,
    margin: 8,
  },
  listItem: {
    padding: 8,
    margin: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 1,
    shadowOpacity: 0.5,
  }
});
*/
