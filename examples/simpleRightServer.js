'use strict'

// --------------------------------------------------------------
// --------------------------------------------- REQUIRES -------

const NAuthy = require('../')

const fs = require('fs')

const MongoClient = require('mongodb').MongoClient

var bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// --------------------------------------------------------------
// ------------------------------------------------- VARS -------

const appPort = 8080

const appInitFile = 'appIsInited.dat'

const mongoDbUrl = 'mongodb://127.0.0.1:27017'

const NAuthyDbName = 'NAuthyUsersDb'
const NAuthyClName = 'NAuthyCollection'
const NAuthyMongoClient = new MongoClient(mongoDbUrl)

// --------------------------------------------------------------
// --------------------------------------------- INTERNAL -------

// ----------------------------------------- Initialisation
async function initApp(adminKey, newAdminKey) {

  await NAuthy.mongoConnectClient(NAuthyMongoClient,NAuthyDbName,NAuthyClName)
  await NAuthy.reset()
  await NAuthy.init()

  let adminToken = await NAuthy.requireToken(adminKey)
  NAuthy.connect(adminKey,adminToken)

  let retriever = await NAuthy.getRetrievalInterface()
  await retriever.updateUserKey(adminKey, newAdminKey)
  await NAuthy.disconnect(adminToken)

  await fs.writeFile(appInitFile, 'Right Manager App initialized')

}
// ----------------------
async function isInitialized() {
  return await fs.existsSync(appInitFile)
}

// ----------------------------------------- Launching
async function setupRoutes() {

  function initError(res) {
    res.status(401 );
    res.send('Application not yet initialized');
  }

  // -------------------- COMMON METHODS
  // --- connect
  app.post('/connect', async (req, res, next) => {

    if(! await isInitialized()) {
      initError(res)
      return
    }

  });

  // --- disconnect
  app.post('/disconnect', async (req, res, next) => {

    if(! await isInitialized()) {
      initError(res)
      return
    }
  });

  // --- hasRight
  app.get('/hasRight', async (req, res, next) => {

    if(! await isInitialized()) {
      initError(res)
      return
    }

  });

  // -------------------- ADMIN METHODS
  // --- initialise server
  app.post('/initialise', async (req, res, next) => {
  });

  // --- createRight
  app.post('/createRight', async (req, res, next) => {

    if(! await isInitialized()) {
      initError(res)
      return
    }

  });

  // --- createRight
  app.post('/createUser', async (req, res, next) => {

    if(! await isInitialized()) {
      initError(res)
      return
    }

  });

  // -------------------- DEFAULT PAGE
  app.get('*', function(req, res) {
    res.status(404);
    res.send('<b><u>404</u></b> Get Method not found !');
});

}
// ----------------------
async function launchApp() {

  await setupRoutes()

  app.listen(appPort, () => {
    console.log("NAuthy based Right Manager Launched on " + appPort);
  });

}

// ----------------------------------------- Right management

// --------------------------------------------------------------
// ------------------------------------------------- MAIN -------

launchApp()