'use strict';

function getImageSource(movie: Object, kind: ?string): {uri: ?string} {
  var uri = movie && movie.posters ? movie.posters.thumbnail : null;
  if (uri && kind) {
    uri = uri.replace('tmb', kind);
  }
  return { uri };
}

fetch('https://learnenglishbackend-romainpellerin.rhcloud.com/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test',
          password: 'test',
        })
    })
    .then((response) => {
            fetch('https://learnenglishbackend-romainpellerin.rhcloud.com/words', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                }
            })
            .then((response2tmp) => response2tmp.text()) // MANDATORY
            .then((response2) => {
              this.setState({
                words: JSON.parse(response2).words
              });
            })
            .catch((error2) => {
              console.warn("ERROR")
              console.warn(error2);
            });
    })
    .catch((error) => {
      console.warn("ERROR")
      console.warn(error);
    });

function login() {

}

function getWords() {

}

function updateScore(word) {

}

exports.login       = login;
exports.getWords    = getWords;
exports.updateScore = updateScore;
