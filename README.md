# Learn A Foreign Language

This project is about [learning vocabulary of foreign languages](blog.romainpellerin.eu/learning-a-foreign-language.html).

The Android app was made with [React native](https://facebook.github.io/react-native/).

The API was made using [Express](http://expressjs.com/) whereas the front-end code (website) was developed using [React](https://facebook.github.io/react/). The API connects to a PostgreSQL database.

This project is hosted on the [OpenShift](https://www.openshift.com/) platform. The OpenShift `nodejs` cartridge documentation can be found at: [http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs](http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs). I also customized the cartridge a bit to support any version of nodejs. I copied the following files from [https://github.com/ramr/nodejs-custom-version-openshift](https://github.com/ramr/nodejs-custom-version-openshift):

* `.openshift/action_hooks/build`
* `.openshift/action_hooks/deploy`
* `.openshift/action_hooks/post_deploy`
* `.openshift/action_hooks/post_start_nodejs`
* `.openshift/action_hooks/post_stop_nodejs`
* `.openshift/action_hooks/pre_build`
* `.openshift/action_hooks/pre_start_nodejs`
* `.openshift/action_hooks/pre_stop_nodejs`
* `.openshift/lib/setup_custom_nodejs_env`
* `.openshift/lib/utils`


## What is it?

A little app to learn any language everyday more efficiently, by memorizing words or expressions. The app is a Tinder-like app, with tiles that can be swiped left or right. It connects to a server for data storing purposes.


## Structure

This Git repository contains the three parts of the project:

* **mobile-app**: contains the Android source code
* **back-end**: contains the API and website source code
    * **/**: this directory is hosted on OpenShift (contains the API and the front-end code)
    * **frontend**: contains the front-end code (HTML, CSS, JS) made with React (and generated using webpack). It is served as static files by Express.


## How to run it?

Well, there are some distinctions to be made. I also need to mention that this project has only been tested on a Ubuntu 14.04 based distribution (GNU/Linux). It might work on Windows and on MacOS but I haven't tested it so far.

First, you can **compile the Android app** yourself using [React native](https://facebook.github.io/react-native/) and then **run it** in an emulator or on your device. If you don't edit the code, it will communicate with the API hosted on OpenShift.

Secondly, you can **compile the front-end code** (the website) using [React](https://facebook.github.io/react/) and [webpack](https://webpack.github.io/) and **run it** locally on your computer (or on a remote server), just by opening the file in your browser (as the files are just plain old HTML and JavaScript files). But your browser will likely not accept cross-origin requests sent to the API. That's why there's a third paragraph...

Finally, you can **run the API** code using [Express](http://expressjs.com/), locally (or on a server). This is interesting as it allows you to serve the front-end code as well. Cross-origin problem solved. **If you do so, you will need your own database.**

### Compiling and running the Android app

[Official tutorial for React native](https://facebook.github.io/react-native/docs/getting-started.html).  
[Official tutorial for React native with Android](https://facebook.github.io/react-native/docs/android-setup.html).  
[Official tutorial explaining how to run React native on real Android devices](https://facebook.github.io/react-native/docs/running-on-device-android.html).

1. Install the Android SDK and NDK. Make sure you have the API 23 (or the latest available). I recommend to install it in your home folder.
2. Install latest nodejs:

    ```bash
    curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

3. Install latest npm ([more information](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)):

    ```bash
    [sudo] npm install -g npm@2
    ```

    This is optional, as npm version 1 is already embedded with nodejs. However, npm version 2 performs better.

4. Install some linux packages:

    ```bash
    sudo apt-get install build-essential \
                         autoconf \
                         automake \
                         python-setuptools \
                         inotify-tools
    ```

5. Set some environment variables, in your `.bashrc` file (or `.zshrc`, or whatever). The following paths are given as examples:

    ```bash
    export ANDROID_HOME=/home/<user>/android-sdk-linux
    export ANDROID_SDK=/home/<user>/android-sdk-linux
    export ANDROID_NDK=/home/<user>/android-sdk-linux/android-ndk-r10e
    ```

6. Install [watchman](https://facebook.github.io/watchman/docs/install.html#installing-from-source) and extend [inotify limit](http://unix.stackexchange.com/a/226115).
7. Install react-native-cli globally:

    ```bash
    [sudo] npm install -g react-native-cli
    ```

8. `cd` to the root of the app and then install the dependencies:

    ```bash
    cd mobile-app && npm install
    ```

9. [Get your app ready for production (read everything)](https://facebook.github.io/react-native/docs/signed-apk-android.html).  
   Basically, just add your credentials to `android/gradle.properties` and make sure the file won't be tracked by Git.

   ```bash
   git update-index --skip-worktree android/gradle.properties
   git ls-files -v|grep -e '^s' # Make sure the file was marked
   ```

10. Enable Gradle if not already done, in `android/gradle.properties` add:

    ```bash
    org.gradle.parallel=true
    org.gradle.daemon=true
    org.gradle.jvmargs=-Xms256m -Xmx1024m
    ```

11. Finally, run it:
    1. Plug in your phone.
    2. Enable the debug mode (in 'Developer options') in your phone.
    3. Then:

        ```bash
        npm run dev
        # OR
        react-native run-android
        adb reverse tcp:8081 tcp:8081
        react-native start
        ```

    4. In the app, shake your phone > *Dev Settings* > *Debug server host* > Type you PC's IP plus ':8081', and reload JS in the app.


[To release for production, read this page once again to make sure everything is alright](http://facebook.github.io/react-native/docs/signed-apk-android.html), then:

```bash
cd android && ./gradlew assembleRelease && ./gradlew installRelease
```


### Compiling the front-end code

From this repository root directory:

```bash
cd back-end/frontend/
npm install # Install dependencies
npm link webpack # Make it available as a command in your terminal
npm link webpack-dev-server # Make it available as a command in your terminal
npm run dev # Will run in development mode, using hot reloading
```

When ready to go in production, compile the front-end like this:

```bash
webpack -p # For production only, minimify the code
```


### Running the API code

As I said above, you need your own database. Let's do it before launching the API.

By default, if you don't edit the code, you need a PostgreSQL database. Three choices:

1. Host the database on your machine (by installing PostgreSQL by yourself)
2. [Host the database on OpenShift](https://developers.openshift.com/en/databases-postgresql.html)
3. Host the database on any other hosting service (Heroku, Clever Cloud, OVH, etc.)

In any case, when run locally (on your machine), the API requires the database to be accessible at **127.0.0.1:5433** (unless you edited the settings or provided the right environment variables in `src/config.js`).

If you're in the second scenario, here is a little trick to make the remote database accessible locally:

```bash
rhc port-forward <project-name> # Fake local connection
```

Now, no matter which case you are in, your database **must be accessible at 127.0.0.1:5433**. You can re-create the required structure using the file located at `scripts/tables.sql`. From this repository root directory:

```bash
cd backend/
psql -h 127.0.0.1 -p 5433 -d <database> -U <user> -W # Connect to pgsql
\i ./scripts/tables.sql
```

Make sure the database is started from that point. Let's now run the API.

In the directory `backend`, rename the file `dev-example.sh` to `dev.sh`. Edit it and add your PostgreSQL credentials. Then, from the same directory `backend`:

```bash
npm install # Install dependencies
source ./dev.sh
```

From now, you can either run the API for development purposes or for production. You may also choose to host it on OpenShift as well.

#### Development (locally)

It will watches changes on files. At every change, it will recompile the front-end code and restart the Express server. It requires `inotify-tools`:

```bash
sudo apt-get install inotify-tools
npm run dev
```

#### Production (locally)

It will only launch the Express server.

```bash
node server.js
```

#### Production (hosted on OpenShift)

```bash
cd ../ # Root of this repository
rhc tail -a <project-name> # Get live logs
git remote add openshift ssh://<whatever>@<project-name>-<you>.rhcloud.com/~/git/<project-name>.git/
git subtree push --prefix=back-end openshift master # Push to OpenShift
```

In case of push rejected, [try](http://stackoverflow.com/questions/12644855/how-do-i-reset-a-heroku-git-repository-to-its-initial-state):

```bash
git push -f openshift `git subtree split --prefix back-end master`:master
```

It must now be running and you can see the logs.


## Resources that will be needed at some point

### For the Android app

#### Status bar on Android

- [react-native-android-statusbar](https://www.npmjs.com/package/react-native-android-statusbar)

#### ~~React-native Animated API with PanResponder~~

- ~~[Blog post](http://browniefed.com/blog/2015/08/15/react-native-animated-api-with-panresponder/)~~
- ~~[Source code on Github](https://github.com/brentvatne/react-native-animated-demo-tinder)~~
- ~~[Demo](https://rnplay.org/apps/71CyoA)~~
- ~~[How to make the view clickable](http://stackoverflow.com/questions/32738296/how-to-make-react-native-animated-view-clickable)~~

#### Continuous Integration

- [Automating Publishing to the Play Store](https://github.com/codepath/android_guides/wiki/Automating-Publishing-to-the-Play-Store)
- [PUBLISH TO GOOGLE PLAY - CONTINUOUS DELIVERY FOR ANDROID](http://blog.stablekernel.com/deploying-google-play-continuous-delivery-android-part-4/)
- [DevOps on Android: From one Git push to production](http://jeremie-martinez.com/2016/01/14/devops-on-android/)

### For the front-end code (website)

- [React Autosuggest](https://github.com/moroshko/react-autosuggest/blob/3.0/README.md)
- [React Tutorial: Creating a Simple Application Using React JS and Flux Architecture](https://www.codementor.io/reactjs/tutorial/react-js-flux-architecture-tutorial)


## TODO (from most important to least), sorted by upcoming releases

### 0.2

1. ~~Rename globally the project to "*learn-a-foreign-language*" in `backend`~~
2. ~~Handle when the user has no words, and still uses the app~~
3. In the Android app:
    * Put URLs in `app/constants` (find out how Redux projects do this)
    * ~~Add padding to the modal for meanings~~
4. In the front-end code:
    * Add Google Play logo (with download link) on every HTML page
    * Add page titles
5. ~~See the word itself + the meanings (one row per line) when the word was swiped left~~
6. Add ability to logout (available on Android and the website)
7. ~~Add some feedback with `Alert`~~
8. Automatically redirect on the website when not logged in or when already logged in

### 0.3

1. Reset password (available on the website)
2. Send an email to new users to validate their email, containing a link to enable the account (API)
3. Add a custom icon instead of the default Android one
4. Store the token in the app's preferences and test it on startup instead of sending the credentials
5. Android: hide keyboard after successfully logging in

### 0.4

1. Users can create lists (available on web) and choose which list to use in the Android app
2. Users can add words to one, many or zero list (available on the website)
3. Detect URL in meanings and make them clickable in the Android app

### 0.5

1. Users can share their lists (available on the website) in read-only OR edit mode
2. [Add a doc for the API](http://blog.romainpellerin.eu/documentation.html)
3. Make the modal scrollable if too many meanings, and add an X button on top right to close it (see the example on the official repo of the module)

### 0.6

1. When a word/expression is unknown to the user, add a button to open Google translate with the word or expression directly displayed (available on Android)
2. In the Android app, use Redux

### 0.7

1. Offline mode (SQLite clone of the backend)
2. [Add i18n](https://github.com/AlexanderZaytsev/react-native-i18n)

### 0.8

1. Test-driven development in general
2. Set up *Continuous Integration*:
    - A branch `develop` for development purposes. When merging back into `master` OR when pushing tags (still to be chosen), compile on Travis-ci.org and publish automatically on the Play Store (see tutorials above)
    - On every push (to any branch) and PR, bump the version number, compile the Android app, the front-end, and test the API
    - On every tag push, [recreate the changelog](http://keepachangelog.com/) from all the tags and push it

### 0.9

1. Add a section 'word of the day' using one of the following:
    - https://www.wordsapi.com/
    - http://www.programmableweb.com/news/words-youll-love-these-2-apis/2009/11/10 (https://groups.google.com/forum/#!topic/wordnik-api/N0hPt9u9yMg might help)
    - http://dictionary.reference.com/help/linking/wordoftheday-expert.html
2. Make use of http://www.dictionaryapi.com/ and http://learnersdictionary.com/word-of-the-day

### 1.0

1. Check TODOs in whole project
2. Clean the vocabulary in `back-end/scripts/vocabulary.txt`: add `//` between two distinct definitions of a word

### 2.0

1. Add the Android app's capabilities to the website


Woo, what a big REAMDE.md!
