//-----------------------------------------------------------------------------
// Copyright (C) 2018 Hugo Castaneda
// Licensed under the MIT license.
// See LICENSE.md file in the project root for full license information.
//-----------------------------------------------------------------------------

'use strict'

const retriever = require('./retrievalMethods.js')
const crypto = require('crypto');

// --------------------------------------------------------------
// --------------------------------------------- INTERNAL -------
var userTokenMap = {}
var tokenMap = {}
var killedByUnexistance = {}

function generateToken() {
  let ri1 = Math.random()
  let ri2 = Math.random()
  let hashingStr = ri1 + '_' + ri2 + 'salt'
  let token = crypto.createHash('sha256').update(hashingStr).digest('base64')
  return token
}
// --------------------------------------------------------------
// ------------------------------------------------ MONGO -------
exports.mongoConnectUrl = async function(mongoUrl, dbName, collName) {
  return await retriever.connectMongo(mongoUrl, dbName, collName)
}
exports.mongoConnectClient = async function(mongoClient, dbName, collName) {
  return await retriever.setupMongoClient(mongoClient, dbName, collName)
}
exports.mongoDisconnect = async function() {
  return await retriever.disconnectMongo()
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
      tokenMap[token] = null
      return false
    }
    return true
  }
  return false
}
exports.connect = async function(userKey, token) {

  if(userTokenMap.hasOwnProperty(userKey)) {
    if(! await retriever.userExists(userKey)) {
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

  if(tokenMap.hasOwnProperty(token)) {
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