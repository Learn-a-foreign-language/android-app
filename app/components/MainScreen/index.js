'use strict';

import React, {
  StyleSheet,
  Text,
  View,
  Alert,
  Animated,
  Component,
  PanResponder
} from 'react-native';
import clamp from 'clamp';

var Modal = require('react-native-modalbox');

var SWIPE_THRESHOLD = 120;

var Main = React.createClass({
  getInitialState() {
    var word = {expression: "Swipe left or right", meanings: []};
    return {
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(0.5),
      words: [],
      word: word,
      oldWord: word,
      isModalOpen: false,
      meanings: ''
    }
  },

  loadWords(callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) { // cannot use XMLHttpRequest.DONE with react
        return;
      }
      if (request.status === 200) {
        var w = JSON.parse(request.responseText).words
        this.setState({
          words: ((w.length > 0) ? w : [{expression: 'No words added'}])
        });
        callback && callback();
      } else {
        console.warn('error');
        callback && callback("error");
      }
    };
    request.open('GET', 'https://learnenglishbackend-romainpellerin.rhcloud.com/words');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
  },

  componentDidMount() {
    this.loadWords();
    this._animateEntrance();
  },

  nextWord(word_id, known, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) { // cannot use XMLHttpRequest.DONE with react
        return;
      }
      if (request.status === 204) {
        callback && callback();
      } else {
        callback && callback("can't update");
      }
    };
    request.open('PUT', 'https://learnenglishbackend-romainpellerin.rhcloud.com/me/scores/'+word_id);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
      action: known?'known':'unknown'
    }));
    console.log(JSON.stringify(this.state.word));
    console.log(known);
    if (!known) {
      this.setState({
        oldWord: this.state.word,
        isModalOpen: true
      });
    }
  },

  _animateEntrance() {
    Animated.spring(
      this.state.enter,
      { toValue: 1, friction: 8 }
    ).start();
  },

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        var velocity;

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1;
        }
        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
          if (this.state.word && this.state.word.words_id) {
            this.nextWord(this.state.word.words_id,this.state.pan.x._value > 0);
          }
          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.98
          }).start(this._resetState)
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  },

  modalClosed(id) {
    this.setState({isModalOpen: false});
  },

  _resetState() {
    if (this.state.words.length === 0) {
      this.loadWords(this._resetState);
      return;
    }
    this.setState({
      word: this.state.words.shift()
    });
    this.state.pan.setValue({x: 0, y: 0});
    this.state.enter.setValue(0);
    this._animateEntrance();
  },

  render() {
    let { pan, enter, } = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"]});
    let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]})
    let scale = enter;

    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity};

    let yupOpacity = pan.x.interpolate({inputRange: [0, 150], outputRange: [0, 1]});
    let yupScale = pan.x.interpolate({inputRange: [0, 150], outputRange: [0.5, 1], extrapolate: 'clamp'});
    let animatedYupStyles = {transform: [{scale: yupScale}], opacity: yupOpacity}

    let nopeOpacity = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0]});
    let nopeScale = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0.5], extrapolate: 'clamp'});
    let animatedNopeStyles = {transform: [{scale: nopeScale}], opacity: nopeOpacity}

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.card, animatedCardStyles]} {...this._panResponder.panHandlers}>
          <Text style={styles.cardText}>{this.state.word.expression}</Text>
        </Animated.View>

        <Animated.View style={[styles.nope, animatedNopeStyles]}>
          <Text style={styles.nopeText}>Unknown!</Text>
        </Animated.View>

        <Animated.View style={[styles.yup, animatedYupStyles]}>
          <Text style={styles.yupText}>Known!</Text>
        </Animated.View>

        <Modal isOpen={this.state.isModalOpen} onClosed={this.modalClosed} style={styles.modal} position={"center"} >
          <Text style={styles.titleModal}>{this.state.oldWord.expression}</Text>
          <View style={styles.textModalWrapper}>
            <Text style={styles.textModal}>{this.state.oldWord.meanings.join('\n\n')}</Text>
          </View>
        </Modal>
      </View>
    );
  }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDC5',
  },
  card: {
    alignSelf: 'center',
    backgroundColor: '#64CAFC',
    justifyContent: 'center',
    margin: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 5
  },
  cardText: {
    textAlign: 'center',
    fontSize: 40
  },
  yup: {
    borderColor: 'green',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 20,
  },
  yupText: {
    fontSize: 16,
    color: 'green',
  },
  nope: {
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    bottom: 20,
    padding: 20,
    borderRadius: 5,
    left: 20,
  },
  nopeText: {
    fontSize: 16,
    color: 'red',
  },
  titleModal: {
    color: 'black',
    fontSize: 26,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  textModalWrapper: {
    flex: 1,
    justifyContent: 'center' // vertically centered
  },
  textModal: {
    color: 'black',
    fontSize: 22,
    textAlign: 'center'
  },
  modal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    padding: 20
  },
});

module.exports = Main;