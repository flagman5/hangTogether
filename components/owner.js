import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  AsyncStorage,
} from 'react-native';
import { Card, Paragraph, List, Button} from 'react-native-paper';

import firebase from '../config/FirebaseClient';

class SeshOwner extends Component {
  static navigationOptions = {
     title: 'Activity Details'.toUpperCase(),
   };
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.screenProps.uid,
      players: [],
      seshName: this.props.screenProps.seshInfo.seshName,
      seshStreet: this.props.screenProps.seshInfo.seshStreet,
      seshZipcode: this.props.screenProps.seshInfo.seshZipcode,
      seshTime: Date.now(),
      seshDuration: this.props.screenProps.seshInfo.seshDuration,
      seshVenue: this.props.screenProps.seshInfo.seshVenue,
      seshType: this.props.screenProps.seshInfo.seshType,
      navigation: this.props.navigation,
      isLoading: true,
      errorView: false,
      isLoadingPlayers: '',
    };
  }

  componentDidMount() {
    this.getSessionDetails();
    this.getInterestedPlayers();
  }

  getSessionDetails() {
    //get user session

    var that = this;
    const ref = firebase.firestore().collection('sessions').doc(this.state.userID);
    ref.get().then((doc) => {
      if (doc.exists) {
        const { seshDesc, seshDuration, seshName, seshStreet, seshZipcode, seshTime, seshVenue, seshType } = doc.data();
        that.setState({
          seshDesc: seshDesc,
          seshDuration: seshDuration,
          seshName: seshName,
          seshStreet: seshStreet,
          seshZipcode: seshZipcode,
          seshTime: seshTime.seconds,
          seshVenue: seshVenue,
          seshType: seshType,
        });
      }
    })
    .catch(error => {
      that.setState({isLoading: false, errorView: true});
      console.log("Firestore read failed");
    });

    this.setState({isLoading: false});

  }

  refresh() {
    this.getBlockedPlayers();
  }


  getInterestedPlayers() {
    this.sfRef = firebase.firestore().collection('sessions').doc(this.state.userID).collection('players');
    this.unsubscribe = this.sfRef.onSnapshot(this.onCollectionUpdate);
  }

  getBlockedPlayers() {
    this.setState({isLoadingPlayers: true});
    let players = this.state.players;
    var that = this;
    var sfRef2 = firebase.firestore().collection('blocked').doc(this.state.userID).collection('blocked_users');
    sfRef2.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            players = players.filter(e => e.playerID !== doc.id);
        });

        that.setState({
          players,
          isLoadingPlayers: false,
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });

  }

  onCollectionUpdate = (querySnapshot) => {
    const players = [];
    querySnapshot.forEach((doc) => {
      //if(!doc.metadata.hasPendingWrites) {
      if(!doc.metadata.hasPendingWrites) {
        const { permission, reqDate, name } = doc.data();
        players.push({
          playerID: doc.id,
          permission: permission,
          reqDate: reqDate,
          name: name,
        });
      }
    });

    this.setState({
      players,
    },
      this.getBlockedPlayers
    );
  }

  deleteSesh() {
    alert("Deleted!");
    var deleteDoc = firebase.firestore().collection('sessions').doc(this.state.userID).delete();
    //delete the players
    fetch(`https://us-central1-hangtogether-e9384.cloudfunctions.net/recursiveDelete?path=sessions/${this.state.userID}/players`)
    .catch((error) =>{
      console.error(error);
    });

    var handleToUpdate  = this.props.handleToUpdate;
    handleToUpdate("delete");
    this.props.navigation.goBack();
  }

  loadPlayerViews() {
    if(this.state.isLoadingPlayers) {
      return (
        <View style={styles.activity}>
          <ActivityIndicator size="large" color="#11662F"/>
        </View>
      )
    }
    else {
      return (
        <List.Section>
          {
            this.state.players.map((item, i) => (
              <List.Item
                key={i}
                title={item.name}
                style={styles.listItem}
                onPress={() => {
                  this.state.navigation.navigate('Approve', {
                    requesterID: `${JSON.stringify(item.playerID)}`,
                    userID: `${JSON.stringify(this.state.userID)}`,
                    permission: `${JSON.stringify(item.permission)}`,
                    onGoBack: () => this.refresh(),
                  });
                }}
              />
            ))
          }
        </List.Section>
     )
    }
  }


  render() {

    var moment = require('moment');
    var day = moment.unix(this.state.seshTime);

    if(this.state.isLoading){
      return(
        <View style={styles.activity}>
          <Text style={styles.title}>
              Loading your activity details
            </Text>
          <ActivityIndicator size="large" color="#11662F"/>

        </View>
      );
    }
    else if(this.state.errorView) {
      return(
        <View style={styles.activity}>
          <Text style={styles.title}>
              The database is too busy, please try again later by restart the app.
            </Text>
        </View>
      );
    }
    else {
      return (

        <View>
        <Card style={styles.container}>
            <Card.Title title="Your Activity Details" />
            <Text style={styles.infoLabel}>Name of Activity: </Text>
            <Text style={styles.textContent}>{this.state.seshName} </Text>
            <Text style={styles.infoLabel}>Type of Activity: </Text>
            <Text style={styles.textContent}>{this.state.seshType} </Text>
            <Text style={styles.infoLabel}>Location is: </Text>
            <Text style={styles.textContent}>{this.state.seshVenue}{"\n"}{this.state.seshStreet}, {this.state.seshZipcode}</Text>
            <Text style={styles.infoLabel}>Started at: </Text>
            <Text style={styles.textContent}>{day.format('LLL')} and will end after {this.state.seshDuration} hour(s).</Text>
            <Text>{"\n"}</Text>
          <Button
              mode="contained"
              icon = 'delete-forever'
              style={styles.deleteButton}
              onPress={() => this.deleteSesh()}>
              Delete this activity
          </Button>
        </Card>
        <ScrollView>
          <Text style={styles.textContent}>
          {"\n"} The following people want to join in:
          </Text>
          {this.loadPlayerViews()}
        </ScrollView>
        </View>

      );
    }
  }
}

export default SeshOwner

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 4,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    margin: 10,
    textAlign: 'center'
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
     marginRight:10,
     color:'#000'
   },
   activity: {
     flex: 1,
     backgroundColor: '#f5f5f5',
   },
   listItem: {
     padding: 8,
     margin: 8,
     backgroundColor: '#fff',
     borderRadius: 5,
     shadowColor: '#000000',
     shadowOffset: {
       width: 0,
       height: 1
     },
     shadowRadius: 1,
     shadowOpacity: 0.5,
   },
   deleteButton: {
     backgroundColor: '#FF0000'
   },
   refreshButton: {
     backgroundColor: '#0000FF'
   }
});
