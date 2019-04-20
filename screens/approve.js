import React, { Component } from 'react';
import { Text, View, Picker, TouchableOpacity, TextInput, StyleSheet,Image,ScrollView } from 'react-native';
import { Card, Paragraph, List, Button} from 'react-native-paper';
import firebase from '../config/FirebaseClient';

export default class Approve extends Component {
  static navigationOptions = {
     title: 'Approve or Deny'.toUpperCase(),
   };

  constructor(props) {
    super(props);
    this.grantOrDeny = this.grantOrDeny.bind(this);
    this.state = {
      userID: '',
      firebaseID: '',
      dataSource: '',
      decision: '',
      blocked: 'false'
    }
    this.checkPerms();
  }

  componentDidMount() {
    this._mounted = true;
    var that = this;

    const { navigation } = this.props;
    const ref = firebase.firestore().collection('users').doc(JSON.parse(navigation.getParam('requesterID')));
    ref.get().then((doc) => {
      if (doc.exists) {
        that.setState({
          dataSource: doc.data(),
          key: doc.id,
          isLoading: false
        });
      } else {
        that.setState({
          dataSource: {name: 'Mary Jane', gender: 'Other', personality: 'unknown', bio: 'Profile is not filled out',
                        profile_img: 'https://firebasestorage.googleapis.com/v0/b/hangtogether-e9384.appspot.com/o/profile_images%2Fuser.jpg?alt=media&token=4ce50554-206a-4b63-bb03-e9777dd71e8b',
                      },
          key: doc.id,
          isLoading: false
        });
      }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }


  grantOrDeny(decision) {
    this.setState({decision: decision});
    alert("Thanks! They will see your decision on their app.");
    this.props.navigation.goBack();

    var that = this;
    const { navigation } = this.props;
    var docRef = firebase.firestore().collection('sessions').doc(JSON.parse(navigation.getParam('userID')))
                                     .collection('players').doc(JSON.parse(navigation.getParam('requesterID')));

    return firebase.firestore().runTransaction(function(transaction) {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(docRef).then(function(sfDoc) {
            if (!sfDoc.exists) {
                throw "Document does not exist!";
            }

            transaction.update(docRef, { permission: decision });
        });
    }).then(function() {
        console.log("Transaction successfully committed!");
    }).catch(function(error) {
        console.log("Transaction failed: ", error);
    });

  }

  checkPerms() {
    var that = this;
    const { navigation } = this.props;
    var docRef = firebase.firestore().collection('sessions').doc(JSON.parse(navigation.getParam('userID')))
                                     .collection('players').doc(JSON.parse(navigation.getParam('requesterID')));
    docRef.get().then((doc) => {
      if (doc.exists) {
        if(this._mounted) {
          that.setState({
            decision: doc.data().permission
          });
        }

      } else {
        console.log("No such document!");
      }
    });
  }

  displayButtons() {

    if(this.state.decision == 'undecided') {
      return (
        <View style={styles.detailButton}>
          <Button
              mode="contained"
              icon = 'thumb-up'
              style = {styles.approveButton}
              onPress={() => this.grantOrDeny('true')}>
              Let's Hang
          </Button>
       <Text>{"\n"}</Text>
            <Button
              mode="contained"
              icon = 'thumb-down'
              style = {styles.denyButton}
              onPress={() => this.grantOrDeny('false')}>
              No Thanks
            </Button>
          </View>
       )
    }
    else if(this.state.decision == 'true') {
      return (
        <View>
          <Text style={styles.displayMsg}> You have agreed to hang with this person </Text>
        </View>
      )
    }
    else if(this.state.decision == 'false') {
      return (
        <View>
          <Text style={styles.displayMsg}> You have denied this person to hang with you</Text>
        </View>
      )
    }
  }

  blockOrReport(action) {
    const { navigation } = this.props;

    if(action == 'block') {
      alert("You have blocked this user");
      firebase.firestore().collection('blocked').doc(JSON.parse(navigation.getParam('userID'))).set({initial: 1});
      firebase.firestore().collection('blocked').doc(JSON.parse(navigation.getParam('userID'))).collection('blocked_users').doc(JSON.parse(navigation.getParam('requesterID')))
        .set({
          time: Date.now(),
      })
      .then(function() {
          console.log("Document successfully written!");
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
      this.setState({blocked: true});
    }
    else {
      alert("We will review this profile in 24 hours or less");
      firebase.firestore().collection('flagged_profiles').doc(JSON.parse(navigation.getParam('requesterID')))
        .set({
          time: Date.now(),
          fromUser: JSON.parse(navigation.getParam('userID')),
      })
      .then(function() {
          console.log("Document successfully written!");
      })
      .catch(function(error) {
          console.error("Error writing document: ", error);
      });
    }
    this.props.navigation.state.params.onGoBack();
    this.props.navigation.goBack();
  }

  render() {

    return (
      <ScrollView style={styles.backG}>
        <Card style={styles.container}>
          <View style={styles.subContainer}>
            <View>
              <Image
                style={styles.userImage}
                source={{
                  uri: this.state.dataSource.profile_img,
                }}
              />
              <Text h3 style={styles.nameStyle}>{this.state.dataSource.name}</Text>
            </View>
            <View>
              <Text h5>Gender: {this.state.dataSource.gender}</Text>
            </View>
            <View>
              <Text h5>Personality: {this.state.dataSource.personality}</Text>
            </View>
            <View>
              <Text h5>Bio: {this.state.dataSource.bio}</Text>
            </View>
            <View style={styles.blockOrReportButton}>
              <Button
                  mode="contained"
                  style = {styles.blockButton}
                  onPress={() => this.blockOrReport('block')}>
                  Block
              </Button>

                <Button
                  mode="contained"
                  style = {styles.reportButton}
                  onPress={() => this.blockOrReport('report')}>
                  Report
                </Button>
              </View>
          </View>

          {this.displayButtons()}
        </Card>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    margin: 4
  },
  backG: {
    backgroundColor: '#f5f5f5'
  },
  subContainer: {
    flex: 1,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#CCCCCC',
    alignItems: 'center', justifyContent: 'center',
  },
  userImage: {
    borderColor: '#01C89E',
    borderRadius: 85,
    borderWidth: 3,
    height: 170,
    marginBottom: 15,
    width: 170,
  },
  detailButton: {
    marginTop: 10
  },
  nameStyle: {
    textAlign: 'center'
  },
  displayMsg: {
    margin: 20
  },
  denyButton: {
    backgroundColor: '#FF0000'
  },
  approveButton: {
    backgroundColor: '#008000'
  },
  blockOrReportButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  blockButton: {
    backgroundColor: '#B22222',
    width: '40%',
    marginRight: 10,
  },
  reportButton: {
    backgroundColor: '#CD853F',
    width: '40%',
  }
});
