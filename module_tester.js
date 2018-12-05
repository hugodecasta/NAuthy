'use strict'

const NAuthy = require('./')
const retriever = require('./retrievalMethods.js')

const colors = require('colors')

// ---------------------------------------------------------------
// ----------------------------------- TESTS DATA INTERNAL -------

var testMap = {}

async function beforeMethod() {
  await retriever.connectMongo('mongodb://127.0.0.1:27017','userDb','users')
}

async function afterMethod() {
  await retriever.disconnectMongo()
}

// -------------------------------------------------------------------------------
// --------------------------------------- RETRIEVER TESTS-----------------------

testMap['Retriever tests'] = {}

// -----------
testMap['Retriever tests']['reset'] = async function() {

  await retriever.reset()
  let users = await retriever.retrieveAllUsers()

  return Object.keys(users).length == 0
  
}
// -----------
testMap['Retriever tests']['init db'] = async function() {

  await retriever.reset()
  let passed = true
  
  passed &= ! await retriever.userExists('0000')
  await retriever.init()
  passed &= await retriever.userExists('0000')

  return passed
}
// -----------
testMap['Retriever tests']['setup mongoClient'] = async function() {

  let passed = true

  passed &= await retriever.disconnectMongo()
  passed &= ! await retriever.mongoIsConnected()

  let MongoClient = require('mongodb').MongoClient;
  let url = 'mongodb://127.0.0.1:27017'
  let myClient = await MongoClient.connect(url, {useNewUrlParser: true})

  await retriever.setupMongoClient(myClient,'userDb','users')

  passed &= await retriever.mongoIsConnected()

  await retriever.reset()
  passed &= ! await retriever.userExists('0000')
  await retriever.init()
  passed &= await retriever.userExists('0000')

  return passed
}
// -----------
testMap['Retriever tests']['create user'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','none')

  let passed = true
  passed &= ! await retriever.userExists('1234')
  await retriever.createUser('1234','guest')
  passed &= await retriever.userExists('1234')

  return passed
}
// -----------
testMap['Retriever tests']['remove user'] = async function() {
    await retriever.reset()

    await retriever.createRole('guest','none')
    await retriever.createUser('1234','guest')

    let passed = true

    passed &= await retriever.userExists('1234')
    await retriever.removeUser('1234')
    passed &= ! await retriever.userExists('1234')

    return passed
}
// -----------
testMap['Retriever tests']['update user'] = async function() {

  await retriever.reset()
  await retriever.createRole('guest','none')
  
  let passed = true

  await retriever.createUser('1234','guest')
  passed &= await retriever.userExists('1234')
  passed &= ! await retriever.userExists('4321')

  await retriever.updateUserKey('1234','4321')

  passed &= ! await retriever.userExists('1234')
  passed &= await retriever.userExists('4321')

  return passed
}
// -----------
testMap['Retriever tests']['user has role'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','none')

  await retriever.createUser('1234','guest')
  return await retriever.userHasRole('1234','guest')
}
// -----------
testMap['Retriever tests']['user add role'] = async function() {
  await retriever.reset()

  await retriever.createRole('guest','none')
  await retriever.createRole('newRole','none')

  await retriever.createUser('1234','guest')
  
  let passed = true

  passed &= ! await retriever.userHasRole('1234','newRole')
  await retriever.addUserRole('1234','newRole')
  passed &= await retriever.userHasRole('1234','newRole')

  return passed
}
// -----------
testMap['Retriever tests']['user remove role'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','none')

  await retriever.createUser('1234','guest')
  
  let passed = true

  passed &= await retriever.userHasRole('1234','guest')
  await retriever.removeUserRole('1234','guest')
  passed &= ! await retriever.userHasRole('1234','guest')

  return passed
}
// -----------
testMap['Retriever tests']['role exists'] = async function() {
  await retriever.reset()
  await retriever.init()

  return await retriever.roleExists('admin')
}
// -----------
testMap['Retriever tests']['add create role'] = async function() {
  await retriever.reset()
  
  let passed = true

  passed &= ! await retriever.roleExists('guest')
  await retriever.createRole('guest','guestRight_#1')
  passed &= await retriever.roleExists('guest')

  return passed
}
// -----------
testMap['Retriever tests']['remove create role'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','none')
  
  let passed = true

  passed &= await retriever.roleExists('guest')
  await retriever.removeRole('guest')
  passed &= ! await retriever.roleExists('guest')

  return passed
}
// -----------
testMap['Retriever tests']['role has right'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','guestRight_#1')

  return await retriever.roleHasRight('guest','guestRight_#1')
}
// -----------
testMap['Retriever tests']['add role right'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','none')
  
  let passed = true

  passed &= ! await retriever.roleHasRight('guest','guestRight_#1')
  await retriever.addRoleRight('guest','guestRight_#1')
  passed &= await retriever.roleHasRight('guest','guestRight_#1')

  return passed
}
// -----------
testMap['Retriever tests']['remove role right'] = async function() {
  await retriever.reset()
  await retriever.createRole('guest','guestRight_#1')
  
  let passed = true

  passed &= await retriever.roleHasRight('guest','guestRight_#1')
  await retriever.removeRoleRight('guest','guestRight_#1')
  passed &= ! await retriever.roleHasRight('guest','guestRight_#1')

  return passed
}

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// ------------------------------------------- NAUTH TESTS -----------------------

testMap['NAuthy test'] = {}
// -----------
testMap['NAuthy test']['NAuthy init'] = async function() {
  await NAuthy.reset()

  let passed = true

  passed &= await NAuthy.requireToken('0000') == null
  await NAuthy.init()
  passed &= await NAuthy.requireToken('0000') != null

  return passed
}
// -----------
testMap['NAuthy test']['NAuthy connect'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let token = await NAuthy.requireToken('0000')

  passed &= ! await NAuthy.tokenConnected(token)
  passed &= await NAuthy.connect('0000',token)
  passed &= await NAuthy.tokenConnected(token)

  return passed
}
// -----------
testMap['NAuthy test']['NAuthy disconnect'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let token = await NAuthy.requireToken('0000')

  passed &= ! await NAuthy.disconnect(token)
  await NAuthy.connect('0000',token)
  passed &= await NAuthy.disconnect(token)

  return passed
}
// -----------
testMap['NAuthy test']['NAuthy get retrieval module'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let token = await NAuthy.requireToken('0000')
  await NAuthy.connect('0000',token)

  return await NAuthy.getRetrievalInterface(token) != null
}
// -----------
testMap['NAuthy test']['NAuthy use retrieval module'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let token = await NAuthy.requireToken('0000')
  await NAuthy.connect('0000',token)

  let retr = await NAuthy.getRetrievalInterface(token)

  let passed = true

  passed &= ! await retr.userExists('1234')
  await retr.createUser('1234','admin')
  passed &= await retr.userExists('1234')

  return passed
}

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// ----------------------------------- NAUTH ADVANCED TEST -----------------------

testMap['NAuthy advanced test'] = {}

testMap['NAuthy advanced test']['init admin'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let adminKey = '0000'
  let adminToken = await NAuthy.requireToken(adminKey)
  await NAuthy.connect(adminKey, adminToken)

  passed &= await NAuthy.tokenConnected(adminToken)

  let theRetriever = await NAuthy.getRetrievalInterface(adminToken)

  let newAdminKey = 'secretAdminKey'
  await theRetriever.updateUserKey(adminKey,newAdminKey)
  passed &= await NAuthy.disconnect(adminToken)

  passed &= ! await NAuthy.tokenConnected(adminToken)

  adminToken = await NAuthy.requireToken(newAdminKey)
  passed &= await NAuthy.connect(newAdminKey, adminToken)

  passed &= await NAuthy.disconnect(adminToken)

  return passed
}
// -----------
testMap['NAuthy advanced test']['add new users'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let adminKey = '0000'
  let adminToken = await NAuthy.requireToken(adminKey)
  await NAuthy.connect(adminKey, adminToken)

  let theRetriever = await NAuthy.getRetrievalInterface(adminToken)

  passed &= await theRetriever.createRole('guest','guest')

  let userKey1 = 'myNewUserKey1'
  let userKey2 = 'myNewUserKey2'
  passed &= await theRetriever.createUser(userKey1,'guest')
  passed &= await theRetriever.createUser(userKey2,'guest')

  passed &= await NAuthy.requireToken('_-_-_-') == null

  passed &= await NAuthy.requireToken(userKey1) != null
  passed &= await NAuthy.requireToken(userKey2) != null

  return passed
}
// -----------
testMap['NAuthy advanced test']['add users and connect'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let adminKey = '0000'
  let adminToken = await NAuthy.requireToken(adminKey)
  await NAuthy.connect(adminKey, adminToken)

  let theRetriever = await NAuthy.getRetrievalInterface(adminToken)

  await theRetriever.createRole('guest','guest')

  let userKey1 = 'myNewUserKey1'
  let userKey2 = 'myNewUserKey2'
  await theRetriever.createUser(userKey1,'guest')
  await theRetriever.createUser(userKey2,'guest')

  let userToken1 = await NAuthy.requireToken(userKey1)
  let userToken2 = await NAuthy.requireToken(userKey2)

  passed &= userToken1 != null
  passed &= userToken2 != null

  passed &= await NAuthy.connect(userKey1, userToken1)
  passed &= await NAuthy.connect(userKey2, userToken2)

  passed &= NAuthy.tokenConnected(userToken1)
  passed &= NAuthy.tokenConnected(userToken2)

  passed &= await NAuthy.disconnect(userToken1)
  passed &= await NAuthy.disconnect(userToken2)

  return passed
}
// -----------
testMap['NAuthy advanced test']['remove connected user'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let adminKey = '0000'
  let adminToken = await NAuthy.requireToken(adminKey)
  await NAuthy.connect(adminKey, adminToken)

  let theRetriever = await NAuthy.getRetrievalInterface(adminToken)

  await theRetriever.createRole('guest','guest')

  let userKey1 = 'myNewUserKey1'
  let userKey2 = 'myNewUserKey2'
  await theRetriever.createUser(userKey1,'guest')
  await theRetriever.createUser(userKey2,'guest')

  let userToken1 = await NAuthy.requireToken(userKey1)
  let userToken2 = await NAuthy.requireToken(userKey2)

  await NAuthy.connect(userKey1, userToken1)
  await NAuthy.connect(userKey2, userToken2)

  passed &= ! await theRetriever.removeUser('_-_-_-')
  passed &= await theRetriever.removeUser(userKey1)

  passed &= ! await NAuthy.tokenConnected('_-_-_-')
  passed &= ! await NAuthy.tokenConnected(userToken1)
  passed &= await NAuthy.tokenConnected(userToken2)

  return passed
}
// -----------
testMap['NAuthy advanced test']['update connected user'] = async function() {
  await NAuthy.reset()
  await NAuthy.init()

  let passed = true

  let adminKey = '0000'
  let adminToken = await NAuthy.requireToken(adminKey)
  await NAuthy.connect(adminKey, adminToken)

  let theRetriever = await NAuthy.getRetrievalInterface(adminToken)

  await theRetriever.createRole('guest','guest')

  let userKey1 = 'myNewUserKey1'
  let userKey2 = 'myNewUserKey2'
  await theRetriever.createUser(userKey1,'guest')
  await theRetriever.createUser(userKey2,'guest')

  let userToken1 = await NAuthy.requireToken(userKey1)
  let userToken2 = await NAuthy.requireToken(userKey2)

  await NAuthy.connect(userKey1, userToken1)
  await NAuthy.connect(userKey2, userToken2)

  passed &= ! await theRetriever.updateUserKey('_-_-_-','_-_-_-')
  let newUserKey1 = 'myNewUserKey1_updated'
  passed &= await theRetriever.updateUserKey(userKey1,newUserKey1)

  passed &= ! await NAuthy.tokenConnected(userToken1)
  passed &= await NAuthy.tokenConnected(userToken2)

  return passed
}


// -------------------------------------------------------------------------------
// ---------------------------------------------------------------
// -------------------------------------------------- MAIN -------
async function unitTest(testName, testObj, preindent) {
  try {
    let passed = await testObj()
    let passedStr = passed?'PASSED'.green:'FAILED'.red
    console.log(preindent,'--',testName,':',passedStr)
    return passed?[1,0]:[0,1]
  }
  catch(error) {
    console.log(preindent,'--',testName,':','ERROR'.red)
    console.log('  ',('ERROR: '+error).red)
    return [0,1]
  }
}
async function multiTest(testName, testObj, preindent) {
  let newindent = preindent+'/'+testName
  let score = [0,0]
  for(let subTestName in testObj) {
    let subTestObj = testObj[subTestName]
    let subScore = await test(subTestName, subTestObj, newindent)
    score[0] += subScore[0]
    score[1] += subScore[1]
  }
  return score
}
async function test(testName, testObj, preindent) {
  preindent = preindent==undefined?'':preindent
  if(typeof(testObj) == typeof({}))
    return await multiTest(testName, testObj, preindent)
  else
    return await unitTest(testName, testObj, preindent)
}
// ------------------

async function initTests(testMap) {
  try {
    await beforeMethod()
  }
  catch(error) {
    console.log(('Error in the "before method": '+error).red)
    return null
  }
  let score = await test('Main tests',testMap)
  try {
    await afterMethod()
  }
  catch(error) {
    console.log(('Error in the "after method": '+error).red)
    return null
  }
  return score
}

function sortMap(testObj,testArgs) {
  if(testArgs.length == 0)
    return testObj
  let newTestObject = {}
  for(let subTestName in testObj) {
    let subTestObj = testObj[subTestName]
    if(testArgs.indexOf(subTestName)>-1) {
      newTestObject[subTestName] = subTestObj
    }
    else if(typeof(subTestObj) == typeof({})) {
      let newSubObject = sortMap(subTestObj,testArgs)
      if(Object.keys(newSubObject).length > 0)
        newTestObject[subTestName] = newSubObject
    }
  }
  return newTestObject
}

let testArgs = process.argv
testArgs.splice(0,2)
initTests(sortMap(testMap,testArgs)).then(function(fullScore) {

  if(fullScore == null) {
    console.log('\nError one test set'.red)
    return
  }

  let testPassedStr = fullScore[1]>0?
    (fullScore[0]==0?'FAILED'.red:'FAILED'.yellow):
    'PASSED'.green
  console.log('\nFull test:',testPassedStr)
  console.log('\nPASSED:',fullScore[0],'\nFAILED:',fullScore[1])

})