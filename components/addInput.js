import React, { Component } from 'react';
import { Platform, View, Text, Picker, TouchableOpacity, StyleSheet,ActivityIndicator,AsyncStorage } from 'react-native';
import firebase from '../config/FirebaseClient';
import { Card, List, TextInput, HelperText, withTheme } from 'react-native-paper';

class Inputs extends Component {

  constructor(props){
    super(props);
    this.handlProfileInfo= this.handlProfileInfo.bind(this);
    this.handleFormSubmit= this.handleFormSubmit.bind(this);
    this.state = {
      userID: this.props.screenProps.uid,
      firebaseID: '',
      seshName:'',
      seshStreet:'',
      seshZipcode:'',
      seshDuration:'',
      seshDesc:'',
      isLoading: false,
      validZip: false,
      statusMsg: '',
      seshVenue: '',
      seshType: '',
    }
  }

  componentDidMount() {

  }

  updateDBEntry(stateObj) {

    return new Promise((resolve, reject) => {
      this.setState({statusMsg: 'Processing your entry into the database...'});

      //now get all zip within 10 miles
      fetch(`https://us-central1-blaze-2bbbc.cloudfunctions.net/getZipcodes?originZip=${stateObj.seshZipcode}`)
        .then((response) => response.json())
        .then((responseJson) => {

            var docRef = firebase.firestore().collection('sessions').doc(this.state.userID);

            return firebase.firestore().runTransaction(function(transaction) {
                // This code may get re-run multiple times if there are conflicts.
                return transaction.get(docRef).then(function(resultDoc) {
                    if (!resultDoc.exists) {
                      transaction.set(docRef, {
                        seshName: stateObj.seshName,
                        seshStreet: stateObj.seshStreet,
                        seshZipcode: stateObj.seshZipcode,
                        seshDuration: stateObj.seshDuration,
                        seshDesc: stateObj.seshDesc,
                        seshTime: stateObj.seshTime,
                        radZips: responseJson,
                        seshVenue: stateObj.seshVenue,
                        seshType: stateObj.seshType,
                      });
                    }
                });
            }).then(function() {
                resolve(true);
                console.log("Transaction successfully committed!");
            }).catch(function(error) {
                reject("Unable to add activity into database ");
                console.log("Transaction failed: ", error);
            });

         })
         .catch((error) =>{
            console.error(error);
            reject("Unable to add activity into database");
         });
     });
   }

   handlProfileInfo(field, text) {
     this.setState({[field]: text});

   }

   handlProfileInfoZip(field, text) {
     text = text.replace(/\s+/g,'');
     this.setState({[field]: text});

   }

   checkValidZip() {
     this.setState({ isLoading: true,
                    statusMsg: 'Checking zipcode...',
     });

     //now get all zip within 10 miles
     fetch(`https://us-central1-blaze-2bbbc.cloudfunctions.net/getCityFromZip?zip=${this.state.seshZipcode}`)
       .then((response) => response.text())
       .then((responseJson) => {
          if(responseJson.includes("city")) {
            this.setState({validZip: true,
              statusMsg: 'Zipcode is valid!'
            },
            this.handleFormSubmit
            );
          }
          else {
             alert("Please fill in valid sesh zipcode!");
             this.setState({ isLoading: false});
          }

        }).catch((error) =>{
          console.error(error);
        });

   }

   handleFormSubmit() {

     if(this.state.seshName == '') {
        alert("Please fill in actvity name!");
     }
     else if(this.state.seshStreet == '') {
       alert("Please fill in actvity street!");
     }
     else if(this.state.seshZipcode == '') {
        alert("Please fill in actvity zipcode!");
     }
     else {
       alert("Thanks for starting an actvity!");

       const timestamp = firebase.firestore.FieldValue.serverTimestamp();
       var duration = (this.state.seshDuration) ? this.state.seshDuration : 1;
       var theType = (this.state.seshType) ? this.state.seshType : "Chilling";
       this.setState({
         seshTime: timestamp,
         seshDuration: duration,
         seshType: theType,
         statusMsg: 'Contacting the database...',
       },
          this.initDBSave,
       );

     }
   }

   initDBSave() {
     this.updateDBEntry(this.state).then(() => {
       this.setState({ isLoading: false});
       var handleToUpdate  = this.props.handleToUpdate;
       handleToUpdate(this.state);
     }).catch((error) => {
       this.setState({statusMsg: 'Network error, please try again later', isLoading: false});
       console.error(error);
     });

   }

   render() {
     if(this.state.isLoading){
       return(
         <Card style={styles.container2}>
           <Text style={styles.title}>
               Adding your actvity to the database! {"\n"} {"\n"}
             </Text>
             <Text>
               {this.state.statusMsg}
             </Text>
             <Text>
              {"\n"}{"\n"}If it is taking too long, the database is too busy, restart the app and try again later.
             </Text>
           <ActivityIndicator size="large" color="#11662F"/>
         </Card>
       )
     }
     else {
      return (
         <View style = {styles.container}>
            <Text style={styles.title}>Activity Details</Text>
            <TextInput style = {styles.input}
               underlineColorAndroid = "transparent"
               selectionColor = "#45B270"
               placeholder = "Name of Activity"
               placeholderTextColor = "#44D844"
               autoCapitalize = "none"
               value={this.state.seshName}
               onChangeText = {(text) => this.handlProfileInfo('seshName', text)}/>

            <TextInput style = {styles.input}
                  underlineColorAndroid = "transparent"
                  placeholder = "Store/Park Name, if any"
                  placeholderTextColor = "#44D844"
                  autoCapitalize = "none"
                  value={this.state.seshVenue}
                  onChangeText = {(text) => this.handlProfileInfo('seshVenue', text)}/>

            <TextInput style = {styles.input}
                  underlineColorAndroid = "transparent"
                  placeholder = "Street"
                  placeholderTextColor = "#44D844"
                  autoCapitalize = "none"
                  value={this.state.seshStreet}
                  onChangeText = {(text) => this.handlProfileInfo('seshStreet', text)}/>

            <TextInput style = {styles.input}
                        underlineColorAndroid = "transparent"
                        placeholder = "Zipcode/Postal Code"
                        placeholderTextColor = "#44D844"
                        autoCapitalize = "none"
                        maxLength={6}
                        value={this.state.seshZipcode}
                        onChangeText = {(text) => this.handlProfileInfoZip('seshZipcode', text)}/>

          <Text style={styles.label}>What kind of activity?</Text>
          <Picker itemStyle={styles.pickerItem} selectedValue={(this.state && this.state.seshType) || "Chill"} onValueChange = {(text) => this.handlProfileInfo('seshType', text)}>
              <Picker.Item label = "Chill session" value = "Chilling" />
              <Picker.Item label = "Sports" value = "Sports" />
              <Picker.Item label = "Driving Cars" value = "Driving Cars" />
              <Picker.Item label = "Play Games" value = "Play Games" />
              <Picker.Item label = "Riding Motorcycle" value = "Riding Motorcycle" />
              <Picker.Item label = "Music" value = "Music" />
              <Picker.Item label = "Painting" value = "Painting" />
          </Picker>

            <Text style={styles.label}>How long will the activity last?</Text>
            <Picker itemStyle={styles.pickerItem} selectedValue={(this.state && this.state.seshDuration) || "1"} onValueChange = {(text) => this.handlProfileInfo('seshDuration', text)}>
                <Picker.Item label = "1 hour" value = "1" />
                <Picker.Item label = "2 hours" value = "2" />
                <Picker.Item label = "3 hours" value = "3" />
            </Picker>

            <TextInput style = {styles.inputDescription}
               underlineColorAndroid = "transparent"
               placeholder = "Description"
               placeholderTextColor = "#44D844"
               autoCapitalize = "none"
               multiline={true}
               returnKeyType="done"
               blurOnSubmit={true}
               value={this.state.seshDesc}
               onChangeText = {(text) => this.handlProfileInfo('seshDesc', text)}/>

            <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => this.checkValidZip()
               }>
               <Text style = {styles.submitButtonText}> Let's Hang! </Text>
            </TouchableOpacity>
         </View>
      )
    }
   }
}
export default Inputs

const styles = StyleSheet.create({
  container: {
     flex: 1,
     backgroundColor: '#F5F5F5',
     marginLeft: 10,
     marginRight: 10,
   },
   container2: {
      flex: 1,
      backgroundColor: '#fff',
      margin: 10,
      padding: 30,
      ...Platform.select({
        ios: {
        },
        android: {
            paddingLeft: 10,
        },
      }),

   },
   input: {
      margin: 10,
      //height: 40,
      //borderColor: '#44D844',
      //borderWidth: 1,
      //width:200,
   },
   submitButton: {
      backgroundColor: '#16800F',
      padding: 10,
      margin: 15,
      height: 40,
   },
   submitButtonText:{
      color: 'white',
   },
   inputDescription: {
     margin: 15,
     height: 100,
     //borderColor: '#44D844',
     //borderWidth: 1,
     //width:200,
   },
   label: {
     marginLeft:15
   },
   pickerItem: {
     height: 55
   },
   title: {
     fontSize: 20,
     margin: 10,
   }
})
