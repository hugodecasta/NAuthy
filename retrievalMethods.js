'use strict'

// ------- fake MONGO
var userMap = {}
var roleMap = {}
// ------- fake MONGO

exports.reset = function() {
  userMap = {}
  roleMap = {}
}

exports.init = function() {
  roleMap['admin'] = ['admin']
  exports.createUser('0000','admin')
}

// ---------------------------------------- USERS RETRIEVAL
exports.retrieveAllUsers = function() {
  return userMap
}
exports.userExists = function(userKey) {
  return userMap.hasOwnProperty(userKey)
}
exports.retrieveOneUser = function(userKey) {
  if(exports.userExists(userKey))
    return userMap[userKey]
  return null
}
// ---------------------------------------- ROLE
exports.roleExists = function(roleName) {
  return roleMap.hasOwnProperty(roleName)
}
exports.createRole = function(roleName, baseRights) {
  roleMap[roleName] = [baseRights]
}
exports.removeRole = function(roleName) {
  if(!exports.roleExists(roleName))
    return false
  delete roleMap[roleName]
  return true
}
exports.roleHasRight = function(roleName, right) {
  if(!exports.roleExists(roleName))
    throw 'Role name "'+roleName+'" does not exist'
  return roleMap[roleName].indexOf(right)>-1
}
exports.addRoleRight = function(roleName, right) {
  if(!exports.roleExists(roleName))
    return false
  roleMap[roleName].push(right)
  return true
}
exports.removeRoleRight = function(roleName, right) {
  if(!exports.roleHasRight(roleName,right))
    return false
  let index = roleMap[roleName].indexOf(right)
  roleMap[roleName].splice(index,1)
  return true
}
// ---------------------------------------- USER MANAGE
exports.createUser = function(userKey, baseRole) {
  if(!exports.roleExists(baseRole)) {
    throw 'Base role "'+baseRole+'" does not exist'
  }
  let user = {key:userKey,roles:[baseRole]}
  userMap[userKey] = user
}
exports.removeUser = function(userKey) {
  if(!exports.userExists(userKey)) {
    return false
  }
  delete userMap[userKey]
  return true
}
exports.updateUserKey = function(oldUserKey, newUserKey) {
  if(!exports.userExists(userKey)) {
    return false
  }
  let userObj = userMap[userKey]
  delete userMap[userKey]
  userMap[newUserKey] = userObj
  return true
}
exports.userHasRole = function(userKey, role) {
  if(!exports.userExists(userKey)) {
    throw 'User "'+userKey+'" does not exist'
  }
  return userMap[userKey]['roles'].indexOf(role)>-1
}
exports.addUserRole = function(userKey, role) {
  if(exports.userHasRole(userKey, role))
    return false
  userMap[userKey]['roles'].push(role)
  return true
}
exports.removeUserRole = function(userKey, role) {
  if(!exports.userHasRole(userKey, role))
    return false
  let index = userMap[userKey]['roles'].indexOf(role)
  userMap[userKey]['roles'].splice(index,1)
  return true
}
// ----------------------------------------