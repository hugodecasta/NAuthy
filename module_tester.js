'use strict'

const NAuthy = require('./')
const retriever = require('./retrievalMethods.js')

const colors = require('colors')

// ---------------------------------------------------------------
// ----------------------------------- TESTS DATA INTERNAL -------

var testMap = {}

// -------------------------------------------------------------------------------
// --------------------------------------- RETRIEVER TESTS-----------------------

testMap['Retriever tests'] = {}

// -----------
testMap['Retriever tests']['reset'] = function() {
  retriever.reset()
  return Object.keys(retriever.retrieveAllUsers()).length == 0
}
// -----------
testMap['Retriever tests']['init db'] = function() {
  retriever.reset()

  let passed = true
  passed &= !retriever.userExists('0000')
  retriever.init()
  passed &= retriever.userExists('0000')

  return passed
}
// -----------
testMap['Retriever tests']['create user'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')
  
  let passed = true
  passed &= !retriever.userExists('1234')
  retriever.createUser('1234','guest')
  passed &= retriever.userExists('1234')

  return passed
}
// -----------
testMap['Retriever tests']['remove user'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')
  
  let passed = true

  retriever.createUser('1234','guest')
  passed &= retriever.userExists('1234')
  retriever.removeUser('1234')
  passed &= !retriever.userExists('1234')

  return passed
}
// -----------
testMap['Retriever tests']['update user'] = function() {
  retriever.reset()
  retriever.createRole('guest','none')
  
  let passed = true

  retriever.createUser('1234','guest')
  passed &= retriever.userExists('1234')
  passed &= !retriever.userExists('4321')

  retriever.updateUserKey('1234','4321')

  passed &= !retriever.userExists('1234')
  passed &= retriever.userExists('4321')

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

function test(testName, testObj, preindent) {

  preindent = preindent==undefined?'':preindent
  let newIndent = preindent+'/'+testName

  let score = [0,0]

  for(let subTestName in testObj) {

    let subTestObj = testObj[subTestName]
    if(typeof(subTestObj) == typeof({})) {
      console.log()
      let itsScore = test(subTestName,subTestObj,newIndent)
      score[0] += itsScore[0]
      score[1] += itsScore[1]
    } else {
      let unitPassed = false
      let unitError = true
      let errorStr = ''
      try {
        unitPassed = subTestObj()
        unitError = false
      } catch(error) {
        errorStr = error
        unitPassed = false
      }
      if(unitPassed)
        score[0]++
      else
        score[1]++
      let unitTestPassedStr = unitPassed?'PASSED'.green:'FAILED'.red
      if(unitError) {
        unitTestPassedStr = 'ERROR'.red
      }
      console.log(newIndent+' -- '+subTestName,':',unitTestPassedStr)
      if(unitError) {
        console.log('  ',('ERROR: '+errorStr).red)
      }
    }
  }
  return score
}
// ------------------
let fullScore = test('Main tests',testMap)

let testPassedStr = fullScore[1]>0?
  (fullScore[0]==0?'FAILED'.red:'FAILED'.yellow):
  'PASSED'.green
console.log('\nFull test:',testPassedStr)
console.log('\nPASSED:',fullScore[0],'\nFAILED:',fullScore[1])