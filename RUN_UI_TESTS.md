# Run the UI Tests
This document is created to show how to run the UI Tests on the opening tree application.

## Necessary dependencies:
There are some depencies needed to run this
 *  `geckodriver`(https://github.com/mozilla/geckodriver/releases) 
 *  `FireFox`(https://www.mozilla.org/en-US/firefox/new/)


Please make sure the `geckodriver` is on your path
```
geckodriver --version
```
Should output something like:
```
geckodriver 0.29.0 (cf6956a5ec8e 2021-01-14 10:31 +0200)
```

## Build the application.  

```
yarn
```

## Deploy the application

Do this prior to setting the "HOST" environment variable below.  Otherwise `yarn start` will clash.
```
yarn start
```


## Set necessary environment variables

Point the environment `HOST` variable to the openingtree host
ie. For the default dev environment 
```
export HOST=http://localhost:3000
npm run testUI
```
or
```
HOST=http://localhost:3000 npm run testUI
```


## Reporting
To create a report please add the following variable before running the tests
```
export REPORT="-f json:test/report/report.json"
```
To build the html report please run:

```
npx multiReport
```
