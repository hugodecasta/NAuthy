'use strict'

// ------- fake MONGO
var userMap = {}
var roleMap = {}
// ------- fake MONGO

exports.reset = async function() {
  userMap = {}
  roleMap = {}
}

exports.init = async function() {
  roleMap['admin'] = ['admin']
  await exports.createUser('0000','admin')
}

// ---------------------------------------- USERS RETRIEVAL
exports.retrieveAllUsers = async function() {
  return userMap
}
exports.userExists = async function(userKey) {
  return userMap.hasOwnProperty(userKey)
}
exports.retrieveOneUser = async function(userKey) {
  if(await exports.userExists(userKey))
    return userMap[userKey]
  return null
}
// ---------------------------------------- ROLE
exports.roleExists = async function(roleName) {
  return roleMap.hasOwnProperty(roleName)
}
exports.createRole = async function(roleName, baseRights) {
  roleMap[roleName] = [baseRights]
}
exports.removeRole = async function(roleName) {
  if(! await exports.roleExists(roleName))
    return false
  delete roleMap[roleName]
  return true
}
exports.roleHasRight = async function(roleName, right) {
  if(! await exports.roleExists(roleName)) {
    throw 'Role name "'+roleName+'" does not exist'
  }
  return roleMap[roleName].indexOf(right)>-1
}
exports.addRoleRight = async function(roleName, right) {
  if(! await exports.roleExists(roleName))
    return false
  roleMap[roleName].push(right)
  return false
}
exports.removeRoleRight = async function(roleName, right) {
  if(! await exports.roleHasRight(roleName,right))
    return false
  let index = roleMap[roleName].indexOf(right)
  roleMap[roleName].splice(index,1)
  return true
}
// ---------------------------------------- USER MANAGE
exports.createUser = async function(userKey, baseRole) {
  if(! await exports.roleExists(baseRole)) {
    throw 'Base role "'+baseRole+'" does not exist'
  }
  let user = {key:userKey,roles:[baseRole]}
  userMap[userKey] = user
}
exports.removeUser = async function(userKey) {
  if(! await exports.userExists(userKey)) {
    return false
  }
  delete userMap[userKey]
  return true
}
exports.updateUserKey = async function(oldUserKey, newUserKey) {
  if(! await exports.userExists(oldUserKey))
    return false
  let userObj = userMap[oldUserKey]
  delete userMap[oldUserKey]
  userMap[newUserKey] = userObj
  return true
}
exports.userHasRole = async function(userKey, role) {
  if(! await exports.userExists(userKey))
    throw 'User "'+userKey+'" does not exist'
  return userMap[userKey]['roles'].indexOf(role)>-1
}
exports.addUserRole = async function(userKey, role) {
  if(await exports.userHasRole(userKey, role))
    return false
  userMap[userKey]['roles'].push(role)
  return true
}
exports.removeUserRole = async function(userKey, role) {
  if(! await exports.userHasRole(userKey, role))
    return false
  let index = userMap[userKey]['roles'].indexOf(role)
  userMap[userKey]['roles'].splice(index,1)
  return true
}
// ----------------------------------------