'use strict'

const NAuthy = require('./')
const retriever = require('./retrievalMethods.js')

const colors = require('colors')

// ---------------------------------------------------------------
// ----------------------------------- TESTS DATA INTERNAL -------

var testMap = {}
function createTest(testFunction) {

  return new Promise((ok,rej) => {

    if(testFunction()) {

    }

  })

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
testMap['Retriever tests']['init db'] = function() {

  return new Promise((ok,rej) => {
    retriever.reset().then(function() {
      let passed = true
      retriever.userExists('0000').then(function(exists) {
        passed &= !exists
        retriever.init().then(function() {
          retriever.userExists('0000').then(function(exists) {
            passed &= exists
            ok(passed)
          })
        })
      })
    })
  })
}
// -----------
testMap['Retriever tests']['create user'] = function() {
  await retriever.reset()
  await retriever.createRole('guest','none')

  let passed = true
  retriever.userExists('1234')
  passed &= ! await retriever.userExists('1234')
  retriever.createUser('1234','guest')
  
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
testMap['Retriever tests']['user has role'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')

  retriever.createUser('1234','guest')
  return retriever.userHasRole('1234','guest')
}
// -----------
testMap['Retriever tests']['user add role'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')
  retriever.createRole('newRole','none')

  retriever.createUser('1234','guest')
  
  let passed = true

  passed &= !retriever.userHasRole('1234','newRole')
  retriever.addUserRole('1234','newRole')
  passed &= retriever.userHasRole('1234','newRole')

  return passed
}
// -----------
testMap['Retriever tests']['user remove role'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')

  retriever.createUser('1234','guest')
  
  let passed = true

  passed &= retriever.userHasRole('1234','guest')
  retriever.removeUserRole('1234','guest')
  passed &= !retriever.userHasRole('1234','guest')

  return passed
}
// -----------
testMap['Retriever tests']['role exists'] = function() {
  retriever.reset()
  retriever.init()

  return retriever.roleExists('admin')
}
// -----------
testMap['Retriever tests']['add create role'] = function() {
  retriever.reset()
  
  let passed = true

  passed &= !retriever.roleExists('guest')
  retriever.createRole('guest','guestRight_#1')
  passed &= retriever.roleExists('guest')

  return passed
}
// -----------
testMap['Retriever tests']['remove create role'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')
  
  let passed = true

  passed &= retriever.roleExists('guest')
  retriever.removeRole('guest')
  passed &= !retriever.roleExists('guest')

  return passed
}
// -----------
testMap['Retriever tests']['role has right'] = function() {
  retriever.reset()
  retriever.createRole('guest','guestRight_#1')

  return retriever.roleHasRight('guest','guestRight_#1')
}
// -----------
testMap['Retriever tests']['add role right'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')
  
  let passed = true

  passed &= !retriever.roleHasRight('guest','guestRight_#1')
  retriever.addRoleRight('guest','guestRight_#1')
  passed &= retriever.roleHasRight('guest','guestRight_#1')

  return passed
}
// -----------
testMap['Retriever tests']['remove role right'] = function() {
  retriever.reset()
  retriever.createRole('guest','guestRight_#1')
  
  let passed = true

  passed &= retriever.roleHasRight('guest','guestRight_#1')
  retriever.removeRoleRight('guest','guestRight_#1')
  passed &= !retriever.roleHasRight('guest','guestRight_#1')

  return passed
}

// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// ------------------------------------------- NAUTH TESTS -----------------------

testMap['NAuthy test'] = {}
// -----------
testMap['NAuthy test']['NAuthy init'] = function() {
  NAuthy.reset()

  let passed = true

  passed &= NAuthy.requireToken('0000') == null
  NAuthy.init()
  passed &= NAuthy.requireToken('0000') != null

  return passed
}
// -----------
testMap['NAuthy test']['NAuthy connect'] = function() {
  NAuthy.reset()
  NAuthy.init()

  let passed = true

  let token = NAuthy.requireToken('0000')

  passed &= !NAuthy.tokenConnected(token)
  passed &= NAuthy.connect('0000',token)
  passed &= NAuthy.tokenConnected(token)

  return passed
}
// -----------
testMap['NAuthy test']['NAuthy disconnect'] = function() {
  NAuthy.reset()
  NAuthy.init()

  let passed = true

  let token = NAuthy.requireToken('0000')

  passed &= !NAuthy.disconnect(token)

  NAuthy.connect('0000',token)
  passed &= NAuthy.disconnect(token)

  return passed
}
// -----------
testMap['NAuthy test']['NAuthy get retrieval module'] = function() {
  NAuthy.reset()
  NAuthy.init()

  let token = NAuthy.requireToken('0000')
  NAuthy.connect('0000',token)

  return NAuthy.getRetrievalInterface(token) != null
}
// -----------
testMap['NAuthy test']['NAuthy use retrieval module'] = function() {
  NAuthy.reset()
  NAuthy.init()

  let token = NAuthy.requireToken('0000')
  NAuthy.connect('0000',token)

  let retr = NAuthy.getRetrievalInterface(token)

  let passed = true

  passed &= !retr.userExists('1234')
  retr.createUser('1234','admin')
  passed &= retr.userExists('1234')

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

test('Main tests',testMap).then(function(fullScore) {

  let testPassedStr = fullScore[1]>0?
    (fullScore[0]==0?'FAILED'.red:'FAILED'.yellow):
    'PASSED'.green
  console.log('\nFull test:',testPassedStr)
  console.log('\nPASSED:',fullScore[0],'\nFAILED:',fullScore[1])

})