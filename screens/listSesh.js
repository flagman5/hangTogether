import React, { Component } from 'react'
import { View, Text, Picker, TouchableOpacity, TextInput, StyleSheet,FlatList, ActivityIndicator, ScrollView, RefreshControl, Image, Platform } from 'react-native'
//import { List, ListItem } from "react-native-elements";
import Geocoder from 'react-native-geocoding';
import Separator from '../components/Separator';
import { Card, Paragraph, List} from 'react-native-paper';
import {
  AdMobBanner,
  AdMobInterstitial,
} from 'react-native-admob';

import firebase from '../config/FirebaseClient.js';

export default class ListSesh extends Component {

    static navigationOptions = {
       title: 'Nearby Activities'.toUpperCase(),
     };

  constructor(props) {
    super(props);
    this.unsubscribe = null;
    //this.userData = this.props.screenProps;
    this.state = {
      dataSource: [],
      isLoading: true,
      userID: this.props.screenProps.uid,
      lat: '',
      long: '',
      error: '',
      isRefreshing: false,
    };
    Geocoder.init('4'); // use a valid API key
  }

  onCollectionUpdate = (querySnapshot) => {
    const dataSource = [];
    querySnapshot.forEach((doc) => {
      //if(!doc.metadata.hasPendingWrites) {
      if(!doc.metadata.hasPendingWrites && doc.id != this.props.screenProps.uid) {
        const { seshName, seshTime, seshDuration, seshStreet, seshZipcode, seshDesc, seshType} = doc.data();
        dataSource.push({
          key: doc.id,
          doc, // DocumentSnapshot
          seshName,
          seshTime: seshTime.seconds,
          seshDuration,
          seshStreet,
          seshZipcode,
          seshDesc,
          seshType,
        });
      }
    });
    this.setState({
      dataSource,
      isLoading: false,
   });
  }

  componentDidMount() {

    //geolocation bit
    navigator.geolocation.getCurrentPosition(
      (position) => {

        this.setState({
          lat: position.coords.latitude,
          long: position.coords.longitude,
          error: null,
        },
          this.getCurrentZip
        );
      },
      (error) => this.setState({ error: error.message }, this.unableToList),
      { enableHighAccuracy: true, timeout: 10000 },
    );

  }

  unableToList() {
    alert(this.state.error);
    this.setState({
      dataSource: [],
      isLoading: false,
      isRefreshing: false,
    })
  }

  getCurrentZip() {

    var currentZip = '';
    Geocoder.from(this.state.lat, this.state.long)
		.then(json => {
      let postalCode = json.results[0].address_components.find(function (component) {
          return component.types[0] == "postal_code";
      });
      currentZip = postalCode.long_name;
      alert("Searching near " + currentZip);
      this.setState({isRefreshing: false,});
      this.pullSeshs(currentZip);
		})
		.catch(error => console.warn(error));


  }

  pullSeshs(zipcode) {
    this.ref = firebase.firestore().collection('sessions').where('radZips', 'array-contains', zipcode);
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);

  }

  displayNearBy() {
    if(this.state.dataSource.length) {
      return (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#11662F"
              title="Loading..."
              titleColor="#45B270"
              colors={['#11662F']}
              progressBackgroundColor="#fff"
            />
          }
        >
          <List.Section>
            {

              this.state.dataSource.map((item, i) => {
              return (
                <List.Item
                  left={() => (
                    <Image
                      source={item.seshType == 'Sports' ? require('../assets/sports.jpg') :
                              item.seshType == 'Driving Cars' ? require('../assets/car.png') :
                              item.seshType == 'Play Games' ? require('../assets/games.png') :
                              item.seshType == 'Riding Motorcycle' ? require('../assets/moto.png') :
                              item.seshType == 'Music' ? require('../assets/music.png') :
                              item.seshType == 'Painting' ? require('../assets/paint.png') :
                              require('../assets/chill.png')}
                      style={styles.image}
                    />
                  )}
                  style={styles.listItem}
                  key={i}
                  title={item.seshName}
                  onPress={() => {
                    this.props.navigation.navigate('SeshDetails', {
                      seshKey: `${JSON.stringify(item.key)}`,
                      seshName: `${JSON.stringify(item.seshName)}`,
                      seshTime: item.seshTime,
                      seshDuration: item.seshDuration,
                      seshStreet: `${JSON.stringify(item.seshStreet)}`,
                      seshZipcode: `${JSON.stringify(item.seshZipcode)}`,
                      seshDesc: `${JSON.stringify(item.seshDesc)}`,
                      seshType: `${JSON.stringify(item.seshType)}`,
                    });
                  }}
                />
              )
             })
            }
          </List.Section>
        </ScrollView>
      )
    }
    else {
      return (<ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={this._onRefresh}
                  tintColor="#11662F"
                  title="Loading..."
                  titleColor="#45B270"
                  colors={['#11662F']}
                  progressBackgroundColor="#fff"
                />
              }
              >
        <View style={styles.msgImage}><Image source={require('../assets/exclamation-icon.png')} /></View>
        <Text style={styles.msg}>Sorry no activities around you</Text>

        </ScrollView>)
    }

  }

  _onRefresh = () => {
    this.setState({isRefreshing: true});
    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {

          this.setState({
            lat: position.coords.latitude,
            long: position.coords.longitude,
            error: null,
          },
            this.getCurrentZip
          );
        },
        (error) => this.setState({ error: error.message }, this.unableToList),
        { enableHighAccuracy: true, timeout: 15000},
      );


    }, 5000);
  }

 displayAds() {
   if(Platform.OS == 'android') {
     return (
       <AdMobBanner
         style={styles.bottomBanner}
         adSize="banner"
         adUnitID="ca-app-pub-7628656525912627/7192926050" // Test ID, Replace with your-admob-unit-id
         didFailToReceiveAdWithError={this.bannerError}/>
     )
   }
   else {
     return (
       <AdMobBanner
         style={styles.bottomBanner}
         bannerSize="banner"
         adUnitID="ca-app-pub-7628656525912627/8130603206" // Test ID, Replace with your-admob-unit-id
         didFailToReceiveAdWithError={this.bannerError}/>
     )
   }
 }

  render() {

    if(this.state.isLoading){
      return(
        <View style={styles.container}>
          <Text style={styles.title}>
              Loading current activities nearby
            </Text>
          <ActivityIndicator size="large" color="#11662F"/>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          List of current activities nearby
        </Text>
        <View style={styles.separator}></View>
        {this.displayNearBy()}
        {this.displayAds()}
      </View>
    );
  }

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 22,
      backgroundColor: '#F5F5F5'
    },
    title: {
      fontSize: 20,
      textAlign: 'left',
      margin: 10,
    },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
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
   separator: {
     borderBottomColor: '#000',
     borderBottomWidth: 1
   },
   msg: {
     marginTop: 50,
     alignItems: 'center',
     justifyContent: 'center',
     textAlign: 'center'
   },
   msgImage: {
     marginTop: 50,
     alignItems: 'center',
     justifyContent: 'center',
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
   image: {
     height: 40,
     width: 40,
     margin: 8,
   },
   bottomBanner: {
    position: 'absolute',
    bottom: 0,
   },
})
