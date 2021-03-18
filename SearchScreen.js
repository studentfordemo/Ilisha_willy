import * as React from 'react';
import { Text, View, StyleSheet, TouchableHighlightBase, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'
import db from '../config'

export default class SearchScreen extends React.Component {

  constructor(){
    super()
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search: "",
    }
  }

  searchTransactions = async(text)=>{
    var enteredText = text.split("")
    if(enteredText[0].toUpperCase()==="B"){
      const transaction = await db.collection("transaction").where("bookID", "==", text).get()
      transaction.docs.map(doc=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==="S"){
      const transaction = await db.collection("transaction").where("studentID", "==", text).get()
      transaction.docs.map(doc=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
  }

  fetchMoreTransaction = async()=>{
    var text = this.state.search.toUpperCase()
    var enteredText = text.split("")
    if(enteredText[0].toUpperCase()==="B"){
      const transaction = await db.collection("transaction").where("bookID", "==", text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
      transaction.docs.map(doc=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase()==="S"){
      const transaction = await db.collection("transaction").where("studentID", "==", text).startAfter(this.state.lastVisibleTransaction).limit(10).get()

      transaction.docs.map(doc=>{
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc
        })
      })
    }
  }

  componentDidMount = async()=>{
    const transaction = await db.collection("transaction").limit(10).get()
    transaction.docs.map(doc=>{
      this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()],
        lastVisibleTransaction: doc
      })
    })
  }

  render(){
    return(
      <ScrollView>
      <View>
       
        <TextInput
        placeholder = "Enter Book ID or Student ID"
        onChangeText = {(text)=>{
          this.setState({
            search: text
          })
        }}
        />
        <TouchableOpacity
        onPress = {()=>{
          this.searchTransactions(this.state.search)
        }}>
         <Text>
           Search  
         </Text> 

        </TouchableOpacity>
        <FlatList
        data = {this.state.allTransactions}
        renderItem = {({item})=>(
          <View style = {{borderBottomWidth: 2}}>
             <Text>
               {"book ID" + item.bookID}
             </Text>
             <Text>
               {"student ID" + item.studentID}
             </Text>
             <Text>
               {"transactionType" + item.transactionType}
             </Text>
          </View>
        )}
        keyExtractor = {(item, index)=>{
           index.toString()
        }}
        onEndReached = {this.fetchMoreTransaction}
        onEndReachedThreshold = {0.7}
        />
    
      </View>
      </ScrollView>
    )
  }
   
}

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