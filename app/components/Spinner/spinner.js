'use strict'

var React = require('react-native');

var {
  View,
  ActivityIndicatorIOS,
  ProgressBarAndroid,
  Platform,
  Dimensions,
  Text
} = React;

var Spinner = React.createClass({
  getInitialState: function () {
      return {
        isVisible: false
      };
  },

  _getSpinner() {
    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid 
          style={{
            height: 120
          }}
          styleAttr="Inverse"
          {...this.props}
        />
      );
    } else {
      return (
        <ActivityIndicatorIOS
          animating={true}
          size="small"
          {...this.props}
        />
      );
    }
  },
  
  render() {
    if (this.props.isVisible) {
      return (
        <View style={styles.overlay}>
            {this._getSpinner()}
            <Text style={styles.text}>{this.props.text || "Loading..."}</Text>
        </View>
      );
    }
    else {
      return <View/>;
    }
  },
  
});
var screen = Dimensions.get('window');
var styles = {
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  text: {
      fontSize: 20,
      color: 'white'
  }
}


module.exports = Spinner;