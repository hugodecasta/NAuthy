'use strict'

const retriever = require('./retrievalMethods.js')
const crypto = require('crypto');

// --------------------------------------------------------------
// --------------------------------------------- INTERNAL -------
var userTokenMap = {}
var tokenMap = {}

function generateToken() {
  let ri1 = Math.random()
  let ri2 = Math.random()
  let hashingStr = ri1 + '_' + ri2 + 'salt'
  let token = crypto.createHash('sha256').update(hashingStr).digest('base64')
  return token
}
// --------------------------------------------------------------
// -------------------------------------------- INTERFACE -------
exports.reset = function() {
  tokenMap = {}
  userTokenMap = {}
  retriever.reset()
}
exports.init = function() {
  retriever.init()
  retriever.addRoleRight('admin','useRetrieverMethods')
}
// ------------------------------------------------------ CONNECT
exports.requireToken = function(userKey) {

  if(!retriever.userExists(userKey))
    return null

  let token = generateToken()

  if(!userTokenMap.hasOwnProperty(userKey))
    userTokenMap[userKey] = []

  userTokenMap[userKey].push(token)

  return token

}
exports.tokenConnected = function(token) {
  return tokenMap.hasOwnProperty(token)
}
exports.connect = function(userKey, token) {

  if(userTokenMap.hasOwnProperty(userKey)) {
    let index = userTokenMap[userKey].indexOf(token)
    if(index > -1) {
      userTokenMap[userKey].splice(index,1)
      tokenMap[token] = userKey
      return true
    }
  }
  return false
}
exports.disconnect = function(token) {

  if(exports.tokenConnected(token)) {
    delete tokenMap[token]
    return true
  }
  return false

}
// ------------------------------------------------------ USING RETRIEVAL METHODS

exports.getRetrievalInterface = function(token) {

  if(!exports.tokenConnected(token))
    throw 'Token "'+token+'" is not connected'

  let userKey = tokenMap[token]

  if( retriever.userHasRole(userKey,'admin') && 
      retriever.roleHasRight('admin','useRetrieverMethods')) {
    return retriever
  }
  return null
}