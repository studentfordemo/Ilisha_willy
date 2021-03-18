import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as Permissions from "expo-permissions"
import { BarCodeScanner } from "expo-barcode-scanner"
import firebase from "firebase"
import db from "../config"

export default class TransactionScreen extends React.Component {
  constructor(){
    super()
    this.state = {
      scannedBookID:"",
      scannedStudentID:"",
      hasCameraPermissions: null,
      scanned: false,
      buttonState: "normal",
      transactionMessage: "",
    }
  }

  handleTransaction = async()=>{
    var transactionType = await this.checkBookAvailability()
    if (!transactionType){
      alert("this book is not available")
      this.setState({
        scannedBookID: "",
        scannedStudentID: "",
      })
    }
    else if(transactionType === "issue"){
      var studentEligible = await this.checkStudentEligibleForBookIssue()
      if (studentEligible){
        this.initiateBookIssue()
        alert("this book has been issued")
      }
    }

    else{
      var studentEligible = await this.checkStudentEligibleForBookReturn()
      if (studentEligible){
        this.initiateBookReturn()
        alert("this book has been returned")
      }
    }
  }

  checkBookAvailability = async() => {
    const bookRef = await db.collection("books").where("bookID","==",this.state.scannedBookID).get()
    var transactionType = ""
    if (bookRef.docs.length == 0){
      transactionType = false
    }
    else {
      bookRef.docs.map((doc)=>{
        var book = doc.data()
        if(book.BookAvailability){
          transactionType = "issue"
        }
        else{
          transactionType = "return"
        }
      })
    }
    return transactionType
  }

    checkStudentEligibleForBookIssue = async() => {
      const studentRef = await db.collection("students").where("studentID","==",this.state.scannedStudentID).get()
      var isStudentEligible = ""
      if (studentRef.docs.length === 0){
        this.setState({
          scannedBookID: "",
          scannedStudentID: "",
        })
        isStudentEligible = false
        alert("this student does not exist in the database")
      }

      else{
        studentRef.docs.map(doc =>{
          var student = doc.data()
          if (student.NumberOfBooksIssued < 2){
            isStudentEligible = true
          }
          else{
            isStudentEligible = false
            alert("this student has already taken two books")
            this.setState({
              scannedBookID: "",
              scannedStudentID: "",
            })
          }
        })
      }
      return isStudentEligible
    }

    checkStudentEligibleForBookReturn = async() => {
      const transactionRef = await db.collection("transaction").where("bookID","==",this.state.scannedBookID).get()
      var isStudentEligible = ""
     

     
      transactionRef.docs.map(doc =>{
          var student = doc.data()
          if (student.studentID===this.state.scannedStudentID){
            isStudentEligible = true
          }
          else{
            isStudentEligible = false
            alert("this book was not issued to this student")
            this.setState({
              scannedBookID: "",
              scannedStudentID: "",
            })
          }
        })
      
      
      return isStudentEligible
    }



  initiateBookIssue = async() => {
    db.collection("transaction").add({
      studentID: this.state.scannedStudentID,
      bookID: this.state.scannedBookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "issue",
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      BookAvailability: false,
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
      NumberOfBooksIssued: firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedBookID: "",
      scannedStudentID: "",
    })
  }

  initiateBookReturn = async() => {
    db.collection("transaction").add({
      studentID: this.state.scannedStudentID,
      bookID: this.state.scannedBookID,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "return",
    })
    db.collection("books").doc(this.state.scannedBookID).update({
      BookAvailability: true,
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
      NumberOfBooksIssued: firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedBookID: "",
      scannedStudentID: "",
    })
  }

  getCameraPermissions = async(id)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status==="granted",
      buttonState: id,
      scanned: false
    })
  }

  handleBarcodeScan = async({type, data})=>{
    const {buttonState} = this.state
    if (buttonState==="bookID"){

    
      this.setState({
        scanned: true,
        scannedBookID: data,
        buttonState: "normal"
      })}
      else if (buttonState==="studentID"){
              this.setState({
        scanned: true,
        scannedStudentID: data,
        buttonState: "normal"
      })
      }
  }

  render(){
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scan = this.state.scanned
    const buttonState = this.state.buttonState
    if (buttonState!=="normal" && hasCameraPermissions) {
      return(
        <BarCodeScanner
        onBarCodeScanned = {scan? undefined:this.handleBarcodeScan}
        style = {StyleSheet.absoluteFillObject}
        />
      )
    }
    else if(buttonState === "normal"){
      return(
        <View style = {styles.container}>
        <Image
        source = {require("../assets/booklogo.jpg")}
        style = {{width: 200, height: 200}}
        />
        <Text>
        Willy
        </Text>
        <TextInput
        placeholder = "bookID"
        onChangeText = {text => this.setState({scannedBookID: text})}
        value = {this.state.scannedBookID}
        />
        <TouchableOpacity
        style = {styles.scanButton}
        onPress = { () => {
          this.getCameraPermissions("bookID")}
        }>
        <Text style = {styles.buttonText}>
        Scan QR Code
        </Text>
        </TouchableOpacity>
        <TextInput
        placeholder = "studentID"
        value = {this.state.scannedStudentID}
        onChangeText = {text => this.setState({scannedStudentID: text})}
        />
        <TouchableOpacity
        style = {styles.scanButton}
        onPress = { () => {
          this.getCameraPermissions("studentID")}
        }>
        <Text style = {styles.buttonText}>
        Scan QR Code
        </Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.submitButton} onPress = {async()=>{
          var transactionMessage = await this.handleTransaction()
        }}>
         <Text>
           Submit
         </Text>
        </TouchableOpacity>
        </View>
      
      )
    }
  } 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
    alignItems: "center",
  },
  displayText: {
      fontSize: 15,
      textDecorationLine: "underline"
  },
  scanButton:{
    backgroundColor: "yellow",
    padding: 10,
    margin: 10,
  },
  buttonText:{
    fontSize: 20,
  }
});