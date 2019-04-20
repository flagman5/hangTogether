import React, {Component} from 'react';
import {Dimensions, Platform} from 'react-native';
import {StackNavigator, createStackNavigator, createBottomTabNavigator, withNavigation, createAppContainer} from 'react-navigation';
import {Icon} from 'react-native-elements';

import AddSesh from './screens/addSesh';
import ListSesh from './screens/listSesh';
import ProfileView from './screens/viewProfile';
import SeshDetails from './screens/seshDetails';
import Approve from './screens/approve';
import EULAView from './screens/eulaView';

let screen = Dimensions.get('window');

const ListStack = createStackNavigator({
  ListSesh: { screen: ListSesh },
  SeshDetails: { screen: SeshDetails },
});
const AddStack = createStackNavigator({
  AddSesh: { screen: AddSesh },
  Approve: { screen: Approve },

});
const ProfileStack = createStackNavigator({
  EULAView: { screen: EULAView},
  ProfileView: { screen: ProfileView },

});

const Root = createBottomTabNavigator(
  {
    ListSesh: { screen: ListStack,
                navigationOptions: {
                    tabBarLabel: 'Join an activity',
                    tabBarIcon: ({tintColor}) => <Icon name="list" type="entypo" size={28} color={tintColor}/>
               },
    },
    AddSesh: { screen: AddStack,
                navigationOptions: {
                tabBarLabel: 'Start an activity',
                tabBarIcon: ({tintColor}) => <Icon name="ios-add-circle-outline" type="ionicon" size={28} color={tintColor}/>
            },
    },
    EULAView: { screen: ProfileStack,
                navigationOptions: {
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({tintColor}) => <Icon name="ios-contact" type="ionicon" size={28} color={tintColor}/>
                },
    }
  },
  {
    tabBarOptions: {
      activeTintColor: '#45B270',
      inactiveTintColor: 'gray',
    },
  }
);

export default createAppContainer(Root);

/*export const Root = createStackNavigator({

    Tabs: {
        screen: Tabs,
        navigationOptions: ({navigation}) => ({
        gesturesEnabled: false,
        })
    },
    BlazeStack: {
        screen: BlazeStack,
        navigationOptions: ({navigation}) => ({
        gesturesEnabled: false,
        })
    }

  }, {
       headerMode: "none",
       mode: "modal"
});*/
