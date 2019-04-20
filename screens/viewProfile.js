
import React, { Component } from 'react';
import {
  Image,
  ImageBackground,
  Linking,
  ListView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Picker,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Card, Paragraph, List, Button, TextInput} from 'react-native-paper';
import Separator from '../components/Separator';
import EulaText from '../components/eulaText.js';
import firebase from '../config/FirebaseClient';
import RNFetchBlob from 'rn-fetch-blob';

var ImagePicker = require('react-native-image-picker');

var options = {
  title: 'Select Profile Picture',
  storageOptions: {
    skipBackup: true,
    path: 'profile_images'
  }
};

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs

window.Blob = Blob


class ProfileView extends Component {

  static navigationOptions = {
     title: 'Profile Settings'.toUpperCase(),
     headerLeft: null,
   };

  constructor(props){
    super(props);
    this.ref = firebase.firestore().collection('users');
    this.getImage = this.getImage.bind(this);
    this.handlProfileInfo= this.handlProfileInfo.bind(this);
    this.state = {
      image_uri: 'https://firebasestorage.googleapis.com/v0/b/hangtogether-e9384.appspot.com/o/profile_images%2Fuser.jpg?alt=media&token=4ce50554-206a-4b63-bb03-e9777dd71e8b',
      userID: this.props.screenProps.uid,
      firebaseID: '',
      name: '',
      gender:'',
      personality: '',
      bio: '',
      isLoading: true,
      isUploading: false,
      isUploadingProfile: false,
      showEula: false,
    }
  }
  componentDidMount() {
    var that = this;

    //check if user is already in the db, if not create his entry
    const ref = firebase.firestore().collection('users').doc(this.state.userID);
    ref.get().then((doc) => {
      if (doc.exists) {
        that.setState({
          name: doc.data().name,
          image_uri: doc.data().profile_img,
          gender: doc.data().gender,
          personality: doc.data().personality,
          bio: doc.data().bio,
          key: doc.id,
        });
      } else {
        //no such doc, create one
        ref.set({
            name: "Mary Jane",
            profile_img: 'https://firebasestorage.googleapis.com/v0/b/hangtogether-e9384.appspot.com/o/profile_images%2Fuser.jpg?alt=media&token=4ce50554-206a-4b63-bb03-e9777dd71e8b',
            gender: 'male',
            personality: '',
            bio: '',
        });
      }

      that.setState({isLoading: false});
    });
  }

   uploadImage(uri, mime = 'image/jpeg') {

    this.setState({isUploading: true,});

    return new Promise((resolve, reject) => {
      let imgUri = uri; let uploadBlob = null;
      const uploadUri = Platform.OS === 'ios' ? imgUri.replace('file://', '') : imgUri;

      //keep reference to original value
      const originalXMLHttpRequest = window.XMLHttpRequest;
      window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest

      //let user = firebaseAuth.currentUser;
      let imageRef = firebase.storage().ref('profile_images/' + this.state.userID);

      //const { currentUser } = firebase.auth();
      //const imageRef = firebase.storage().ref(`/jobs/${currentUser.uid}`)

      fs.readFile(uploadUri, 'base64')
        .then(data => {
          return Blob.build(data, { type: `${mime};BASE64` });
        })
        .then(blob => {
          uploadBlob = blob;
          return imageRef.put(blob, { contentType: mime, name: this.state.userID });
        })
        .then(() => {
          uploadBlob.close()
          return imageRef.getDownloadURL();
        })
        .then(url => {
          resolve(url);
        })
        .catch(error => {
          reject(error)
      })
    })
  }

  getImage(){

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        // let source = { uri: response.uri };
        // this.setState({image_uri: response.uri})

        // You can also display the image using data:
        // let image_uri = { uri: 'data:image/jpeg;base64,' + response.data };

      this.uploadImage(response.uri)
        .then(url => {
          this.setState({
            isUploading: false,
            image_uri: url
          });

          //alert('uploaded');

          this.updateDBEntryPic(url);
        })
        .catch(error => console.log(error))

      }
    });

  }

  updateDBEntryPic(url) {
    var docRef = firebase.firestore().collection('users').doc(this.state.userID);

    docRef.set({
        profile_img: url
    }, { merge: true
    });
    alert("Profile Picture Saved!");
    console.log("Transaction successfully committed!");

  }

  updateDBEntry(stateObj) {
      this.setState({isUploadingProfile: true});
      var docRef = firebase.firestore().collection('users').doc(this.state.userID);
      docRef.set({
        name: stateObj.name,
        gender: stateObj.gender,
        personality: stateObj.personality,
        bio: stateObj.bio,
      },{ merge: true
      });

      this.setState({isUploadingProfile: false});
      alert("Profile Saved!");
      console.log("Document successfully written!");


  }

  handlProfileInfo(field, text) {
    this.setState({[field]: text});
  }

  static propTypes = {
    avatar: PropTypes.string,
    avatarBackground: PropTypes.string,
    //name: PropTypes.string.isRequired,
    //gender: PropTypes.string.isRequired,
    //personality: PropTypes.string.isRequired,
    //bio: PropTypes.string.isRequired,
  }

  renderHeader = () => {
    const {
      avatar,
      avatarBackground,
      //name,
      //gender,
    //  personality,
      //bio,
    } = this.props

    return (
      <Card style={styles.headerContainer}>
        <ImageBackground
          style={styles.headerBackgroundImage}
          blurRadius={10}
          source={{
            uri: avatarBackground,
          }}
        >
          <View style={styles.headerColumn}>
            <Image
              style={styles.userImage}
              source={{
                uri: this.state.image_uri,
              }}
            />
            <Button
              mode="contained"
              icon = 'cloud-upload'
              onPress={this.getImage}
              style={styles.button}
            >
            Upload Image
            </Button>

          </View>
        </ImageBackground>
      </Card>
    )
  }
  renderInfo = () => (
    <View style={styles.container2}>
      <View style={styles.lineItems}>
        <Text style={styles.infoLabel}>Name</Text>
        <TextInput style = {styles.input}
              underlineColorAndroid = "transparent"
              placeholder = "Mary Jane"
              value = {this.state.name}
              placeholderTextColor = "#9a73ef"
              autoCapitalize = "none"
              onChangeText = {(text) => this.handlProfileInfo('name', text)}/>
        </View>
        <View style={styles.lineItems}>
          <Text style={styles.infoLabel2}>Gender</Text>
          <Picker itemStyle={styles.pickerItem} onValueChange = {(text) => this.handlProfileInfo('gender', text)} selectedValue={this.state.gender}>
              <Picker.Item label = "Male" value = "male" />
              <Picker.Item label = "Female" value = "female" />
              <Picker.Item label = "Other" value = "other" />
          </Picker>
        </View>

        <View style={styles.lineItems}>
          <Text style={styles.infoLabel2}>Personality</Text>
          <Picker itemStyle={styles.pickerItem} onValueChange = {(text) => this.handlProfileInfo('personality', text)} selectedValue={this.state.personality}>
              <Picker.Item label = "Laid Back Cool" value = "Laid Back Cool" />
              <Picker.Item label = "Duty Fulfiller" value = "Duty Fulfiller" />
              <Picker.Item label = "Mechanic" value = "Mechanic" />
              <Picker.Item label = "Nurturer" value = "Nurturer" />
              <Picker.Item label = "Artist" value = "Artist" />
              <Picker.Item label = "Protector" value = "Protector" />
              <Picker.Item label = "Idealist" value = "Idealist" />
              <Picker.Item label = "Scientist" value = "Scientist" />
              <Picker.Item label = "Thinker" value = "Thinker" />
              <Picker.Item label = "Doer" value = "Doer" />
              <Picker.Item label = "Guardian" value = "Guardian" />
              <Picker.Item label = "Performer" value = "Performer" />
              <Picker.Item label = "Caregiver" value = "Caregiver" />
              <Picker.Item label = "Inspirer" value = "Inspirer" />
              <Picker.Item label = "Giver" value = "Giver" />
              <Picker.Item label = "Visionary" value = "Visionary" />
              <Picker.Item label = "Executive" value = "Executive" />
          </Picker>
        </View>
          <View style={styles.lineItems}>
            <Text style={styles.infoLabel}>Short Bio</Text>
            <TextInput style = {styles.inputDescription}
                  underlineColorAndroid = "transparent"
                  value = {this.state.bio}
                  placeholderTextColor = "#9a73ef"
                  autoCapitalize = "none"
                  multiline={true}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onChangeText={(text) => this.handlProfileInfo('bio', text)}
                  />
          </View>
          <View style={styles.lineItems}>
            <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => this.updateDBEntry(this.state)
               }>
               <Text style = {styles.submitButtonText}> Save </Text>
            </TouchableOpacity>
          </View>

    </View>
  )



  render() {
    if(this.state.isLoading){
      return(
       <View style={styles.container}>
          <Text style={styles.title}>
              Loading your profile
            </Text>
          <ActivityIndicator size="large" color="#11662F"/>
        </View>
      )
    }
    else if(this.state.isUploading){
      return(
       <View style={styles.container}>
          <Text style={styles.title}>
              Uploading your image
            </Text>
          <ActivityIndicator size="large" color="#11662F"/>
        </View>
      )
    }
    else if(this.state.isUploadingProfile){
      return(
       <View style={styles.container}>
          <Text style={styles.title}>
              Saving your profile
            </Text>
          <ActivityIndicator size="large" color="#11662F"/>
        </View>
      )
    }
    return (
      <KeyboardAwareScrollView style={styles.scroll}>
        <View>
            {this.renderHeader()}
            {Separator()}
            {this.renderInfo()}
        </View>
        <View>
          <TouchableOpacity
             style = {styles.eulaButton}
             onPress = {
                () => this.state.showEula ? this.setState({showEula: false}) : this.setState({showEula: true})
             }>
             <Text style = {styles.submitButtonText}> Read EULA agreement </Text>
          </TouchableOpacity>
            { this.state.showEula ? <EulaText /> : null }
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

export default ProfileView


const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#f5f5f5',
    //borderWidth: 0,
    flex: 1,
  //  margin: 0,
    //padding: 0,
  //  width:'100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  container2: {
    flex: 1,
    ...Platform.select({
      ios: {

      },
      android: {

      },
    }),

    backgroundColor: '#FFFFFF',
  },
  emailContainer: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingTop: 30,
  },
  headerBackgroundImage: {
    paddingBottom: 20,
    paddingTop: 35,
  },
  headerContainer: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  headerColumn: {
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        alignItems: 'center',
        elevation: 1,
        marginTop: -1,
      },
      android: {
        alignItems: 'center',
      },
    }),
  },
  button: {
    backgroundColor: '#841584',
  },
  placeIcon: {
    color: 'white',
    fontSize: 26,
  },
  scroll: {
    backgroundColor: '#FFF',
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: '#5B5A5A',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userBioRow: {
    marginLeft: 40,
    marginRight: 40,
  },
  userBioText: {
    color: 'gray',
    fontSize: 13.5,
    textAlign: 'center',
  },
  userImage: {
    borderColor: '#01C89E',
    borderRadius: 85,
    borderWidth: 3,
    height: 170,
    marginBottom: 15,
    width: 170,
  },
  input: {
     margin: 10,
     height: 40,
    // borderColor: '#A5EFC3',
    // borderWidth: 1,
     //width:200,
    // textAlign: 'center',
  },
  telContainer: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingTop: 30,
  },
  infoLabel: {
    marginTop: 10,
    textAlign: 'left',
    marginLeft:10,
    color:'#707070'
  },
  infoLabel2: {
    marginLeft: 10,
    textAlign: 'left',
    color:'#707070'
  },
  pickerItem: {
    height: 55,
    //width: 200,
    marginLeft: 10,
    marginRight: 10,
  },
  lineItems: {
    ...Platform.select({
      ios: {

      },
      android: {
        marginLeft: 30
      },
    }),
  },
  inputDescription: {
    margin: 15,
    height: 100,
  //  borderColor: '#A5EFC3',
  //  borderWidth: 1,
    //width:200,
  },
  submitButton: {
     backgroundColor: '#16800F',
     padding: 10,
     margin: 15,
     height: 40,
     //width:200,
  },
  submitButtonText:{
     color: 'white',
  },
  eulaButton: {
     backgroundColor: '#00BFFF',
     padding: 10,
     margin: 15,
     height: 40,
     //width:200,
  },

})
