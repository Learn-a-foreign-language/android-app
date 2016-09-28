'use strict';

var React = require('react-native');

var {
  StyleSheet,
  AsyncStorage,
  Text,
  ToastAndroid,
  TextInput,
  TouchableOpacity,
  View,
} = React;

const Spinner = require('../Spinner/spinner');

var styles = StyleSheet.create({
  wrapper : {
    flex: 1
  },

  wrapperForm: {
    padding: 50,
    flex: 1
  },

  text: {
    color: "black",
    fontSize: 22
  },

  center: {
    textAlign: 'center'
  },

  button: {
    backgroundColor: "#75DCE6",
    padding: 10,
    borderRadius: 10
  }

});

var Page = React.createClass({

  getInitialState: function() {
    return {
      email: '',
      password: '',
      showSpinner: true,
      spinnerText: "Wait a sec..."
    };
  },

  componentDidMount: function() {
      this.loadInitialState();
  },

  loadInitialState() {
      var p1 = AsyncStorage.getItem("email").then(email => this.setState({email}));
      var p2 = AsyncStorage.getItem("password").then(password => this.setState({password}));

      Promise.all([p1, p2]).then( success => {
          if (this.state.email && this.state.password) {
              this.login();
              console.log("login");
          }
          else {
              this.setState({showSpinner: false});
              console.log("not login");
          }
      }).
      catch( err => {
          console.log("Error on loadInitialState");
          console.log(err);
          this.setState({showSpinner: false});
      });
  },

  login() {
    if (!this.state.email || !this.state.password) {
        ToastAndroid.show("Please fill in all the inputs", ToastAndroid.SHORT)
        return
    }

    this.setState({
      showSpinner: true,
      spinnerText: 'Authenticating you...'
    });
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) { // cannot use XMLHttpRequest.DONE with react
        return;
      }
      if (request.status === 204) {
        //console.log('success', request.responseText);
        AsyncStorage.setItem("email", this.state.email);
        AsyncStorage.setItem("password", this.state.password);
        this.props.navigator.push({
          name: 'main',
        });
      } else {
        this.setState({showSpinner: false});
        console.log('error login');
        var msg = "Unknown error";
        try {
          msg = JSON.parse(request.responseText).error;
        }
        catch(e) {}
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      }
    };
    request.open('POST', 'https://learnenglishbackend-romainpellerin.rhcloud.com/users/login');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(
      { email: this.state.email,
        password: this.state.password }
      ));
  },

  render: function() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.wrapperForm}>
          <Text
              style={styles.text}
              >
                Email
          </Text>
          <TextInput
              style={styles.text}
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
              />

          <Text
              style={styles.text}
              >
                Password
          </Text>
          <TextInput
              style={styles.text}
              onChangeText={(password) => this.setState({password})}
              value={this.state.password}
              secureTextEntry={true}
              />

          <TouchableOpacity onPress={this.login} style={styles.button}>
              <Text style={[styles.text, styles.center]} >Log in</Text>
          </TouchableOpacity>
        </View>
        <Spinner isVisible={this.state.showSpinner} text={this.state.spinnerText} />
      </View>
    );
  }
});

module.exports = Page;