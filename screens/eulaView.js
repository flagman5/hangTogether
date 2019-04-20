import React, { Component } from 'react'
import { Platform, View, Text, Picker, TouchableOpacity, StyleSheet,ActivityIndicator,AsyncStorage,ScrollView } from 'react-native';
import Separator from '../components/Separator';
import { Card, Paragraph, List, Button} from 'react-native-paper';
import {
  AdMobBanner,
  AdMobInterstitial,
} from 'react-native-admob';

import EulaText from '../components/eulaText.js';

export default class EULAView extends Component {

  constructor(props) {
    super(props);
    this.setAgreement = this.setAgreement.bind(this);
    this.state = {
      agreement: '',
    };
  }

  componentDidMount() {
    this.retrieveItem("eula").then((agreement) => {
        if(agreement == 'T') {
          this.setState({agreement: true});
        }
        else {
          this.setState({agreement: false});
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

  setAgreement() {
    AsyncStorage.setItem('eula',JSON.stringify('T')).then(this.props.navigation.navigate('ProfileView'));
  }

  render() {

    if(this.state.agreement){
      return(
        <View>
        {this.props.navigation.navigate('ProfileView')}
        </View>
      )

    }
    else {
      return (
        <ScrollView style={styles.container}>
          <Text style={styles.title}>
            Please accept the End User License Agreement as detailed below: {"\n"}
          </Text>
          <EulaText/>
          <Text>{"\n"}</Text>
          <Button
            mode="contained"
            onPress={this.setAgreement}
            style={styles.button}
          >
          Agree
          </Button>
        </ScrollView>
      );
    }

  }

}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
