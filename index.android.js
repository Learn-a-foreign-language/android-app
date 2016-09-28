'use strict';

var React = require('react-native');
var {
  AppRegistry,
  Navigator,
  StyleSheet,
  View,
} = React;

var LoginScreen = require('./app/components/LoginScreen/index');
var MainScreen  = require('./app/components/MainScreen/index');

var _navigator;

var RouteMapper = function(route, navigationOperations, onComponentRef) {
  _navigator = navigationOperations;
  if (route.name === 'login') {
    return (
      <LoginScreen navigator={navigationOperations} />
    );
  }
  else if (route.name === 'main') {
    return (
      <MainScreen
        style={{flex: 1}}
        navigator={navigationOperations}
        users_id={route.users_id} />
    );
  }
};

var learnlanguage = React.createClass({
  render: function() {
    var initialRoute = {name: 'login'};
    return (
      <Navigator
        style={styles.container}
        initialRoute={initialRoute}
        configureScene={() => Navigator.SceneConfigs.FadeAndroid}
        renderScene={RouteMapper} />
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  }
});

AppRegistry.registerComponent('learnlanguage', () => learnlanguage);