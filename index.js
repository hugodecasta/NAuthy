'use strict'

const retriever = require('./retrievalMethods.js')

// --------------------------------------------------------------
// --------------------------------------------- INTERNAL -------
var tokenMap = {}

function createToken(userKey) {

}

// --------------------------------------------------------------
// -------------------------------------------- INTERFACE -------
exports.init = function() {
  tokenMap = {}
  retriever.initDataBase()
}
// ------------------------------------------------------ CONNECT
exports.requireToken = function(userKey) {

}
exports.connect = function(userKey, token) {

}
exports.disconnect = function(userKey, token) {

}
// ------------------------------------------------------ INFO RETRIEVAL
exports.userHasRight = function(userKey, token, right) {

}
// ------------------------------------------------------ 
exports.createUser = function(userKey, token, newUserKey, baseRole) {

}
exports.addUserRole = function(userKey, token, newUserKey, role) {

}
exports.addRole = function(userKey, token, role) {

}
exports.addRoleRight = function(userKey, token, role, right) {

}