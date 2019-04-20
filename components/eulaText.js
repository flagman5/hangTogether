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

export default class EulaText extends Component {

    render() {
      return (
        <View>
          <Text>
          End-User License Agreement (EULA) of Hang Together
This End-User License Agreement ("EULA") is a legal agreement between you and Spasiba Technologies
{"\n"}
This EULA agreement governs your acquisition and use of our Hang Together software ("Software") directly from Spasiba Technologies or indirectly through a Spasiba Technologies authorized reseller or distributor (a "Reseller").
{"\n"}
Please read this EULA agreement carefully before completing the installation process and using the Hang Together software. It provides a license to use the Hang Together software and contains warranty information and liability disclaimers.
{"\n"}
If you register for a free trial of the Hang Together software, this EULA agreement will also govern that trial. By clicking "accept" or installing and/or using the Hang Together software, you are confirming your acceptance of the Software and agreeing to become bound by the terms of this EULA agreement.
{"\n"}
If you are entering into this EULA agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity and its affiliates to these terms and conditions. If you do not have such authority or if you do not agree with the terms and conditions of this EULA agreement, do not install or use the Software, and you must not accept this EULA agreement.
{"\n"}
This EULA agreement shall apply only to the Software supplied by Spasiba Technologies herewith regardless of whether other software is referred to or described herein. The terms also apply to any Spasiba Technologies updates, supplements, Internet-based services, and support services for the Software, unless other terms accompany those items on delivery. If so, those terms apply. This EULA was created by EULA Template for Hang Together.
{"\n"}
Zero Tolerance for objectionable content or abusive users{"\n"}
By downloading and using this software, you agree that you will not create, generate or upload any objectionable content to any persons on Earth to the software platform. You also agree that you will not be abusive toward other users and as such are forbidden to input any objectionable or inappropriate content into the software. Failure to abide to above agreements will result in immediate suspension of your account.
{"\n"}
License Grant{"\n"}
Spasiba Technologies hereby grants you a personal, non-transferable, non-exclusive licence to use the Hang Together software on your devices in accordance with the terms of this EULA agreement.
{"\n"}
You are permitted to load the Hang Together software (for example a PC, laptop, mobile or tablet) under your control. You are responsible for ensuring your device meets the minimum requirements of the Hang Together software.
{"\n"}
You are not permitted to:{"\n"}
{"\n"}
Edit, alter, modify, adapt, translate or otherwise change the whole or any part of the Software nor permit the whole or any part of the Software to be combined with or become incorporated in any other software, nor decompile, disassemble or reverse engineer the Software or attempt to do any such things
Reproduce, copy, distribute, resell or otherwise use the Software for any commercial purpose
Allow any third party to use the Software on behalf of or for the benefit of any third party
Use the Software in any way which breaches any applicable local, national or international law
use the Software for any purpose that Spasiba Technologies considers is a breach of this EULA agreement
Intellectual Property and Ownership{"\n"}
Spasiba Technologies shall at all times retain ownership of the Software as originally downloaded by you and all subsequent downloads of the Software by you. The Software (and the copyright, and other intellectual property rights of whatever nature in the Software, including any modifications made thereto) are and shall remain the property of Spasiba Technologies.
{"\n"}
Spasiba Technologies reserves the right to grant licences to use the Software to third parties.
{"\n"}
Termination{"\n"}
This EULA agreement is effective from the date you first use the Software and shall continue until terminated. You may terminate it at any time upon written notice to Spasiba Technologies.
{"\n"}
It will also terminate immediately if you fail to comply with any term of this EULA agreement. Upon such termination, the licenses granted by this EULA agreement will immediately terminate and you agree to stop all access and use of the Software. The provisions that by their nature continue and survive will survive any termination of this EULA agreement.
{"\n"}
Governing Law{"\n"}
This EULA agreement, and any dispute arising out of or in connection with this EULA agreement, shall be governed by and construed in accordance with the laws of us.
          </Text>
        </View>
      );
    }
}
