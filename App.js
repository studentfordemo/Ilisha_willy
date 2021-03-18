import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { createAppContainer } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import TransactionScreen from './screens/BookTransactionScreen'
import SearchScreen from './screens/SearchScreen'

export default class App extends React.Component {
  render(){
    return(
      <View style = {styles.container}>
       <AppContainer/>
      </View>
    )
  }
   
}

const TabNavigator = createBottomTabNavigator({
  transaction: {screen: TransactionScreen},
  search: {screen: SearchScreen}
},
{
  defaultNavigationOptions: ({navigation}) =>({
    tabBarIcon: ()=>{
      const routeName = navigation.state.routeName
      if (routeName==="transaction"){
        return(
          <Image
          source = {require("./assets/book.png")}
          style = {{width: 40, height: 40}}
          />
        )
      }
      else if (routeName==="search"){
         return(
          <Image
          source = {require("./assets/searchingbook.png")}
          style = {{width: 40, height: 40}}
          />
        )
      }
    }
  })
}
)

const AppContainer = createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});