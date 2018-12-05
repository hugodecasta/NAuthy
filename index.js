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
exports.reset = async function() {
  await retriever.reset()
  tokenMap = {}
  userTokenMap = {}
}
exports.init = async function() {
  await retriever.init()
  await retriever.addRoleRight('admin','useRetrieverMethods')
}
// ------------------------------------------------------ CONNECT
exports.requireToken = async function(userKey) {

  if(! await retriever.userExists(userKey))
    return null

  let token = generateToken()
  if(!userTokenMap.hasOwnProperty(userKey))
    userTokenMap[userKey] = []
  userTokenMap[userKey].push(token)
  return token

}
exports.tokenConnected = async function(token) {
  let tokenIsConnected = tokenMap.hasOwnProperty(token)
  if(tokenIsConnected) {
    let userKey = tokenMap[token]
    let userExists = await retriever.userExists(userKey)
    if(!userExists) {
      delete userTokenMap[userKey]
      delete tokenMap[token]
      return false
    }
    return true
  }
  return false
}
exports.connect = async function(userKey, token) {

  if(userTokenMap.hasOwnProperty(userKey)) {
    if(! await retriever.userExists(userKey)) {
      console.log('cannot connect')
      delete userTokenMap[userKey]
      return false
    }
    let index = userTokenMap[userKey].indexOf(token)
    if(index > -1) {
      userTokenMap[userKey].splice(index,1)
      tokenMap[token] = userKey
      return true
    }
  }
  return false
}
exports.disconnect = async function(token) {

  if(await exports.tokenConnected(token)) {
    delete tokenMap[token]
    return true
  }
  return false

}
// ------------------------------------------------------ USING RETRIEVAL METHODS

exports.getRetrievalInterface = async function(token) {

  if(! await exports.tokenConnected(token))
    throw 'Token "'+token+'" is not connected'

  let userKey = tokenMap[token]

  if(await retriever.userHasRole(userKey,'admin')) {
    if(await retriever.roleHasRight('admin','useRetrieverMethods'))
      return retriever
    else
      return null
  }
}