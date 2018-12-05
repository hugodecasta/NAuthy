'use strict'

var mongoDbName = null
var mongoRoleCollection = null
var mongoUserCollection = null

var mongoClient = null
var mongoDb = null

// ---------------------------------------- MONGO MANAGEMENT
exports.connectMongo = async function(url, dbName, collectionName) {
  let MongoClient = require('mongodb').MongoClient;
  let client = await MongoClient.connect(url, {useNewUrlParser: true})
  await exports.setupMongoClient(client, dbName, collectionName)
}
exports.setupMongoClient = async function(client, dbName, collectionName) {
  mongoClient = client
  mongoRoleCollection = collectionName+'_roles'
  mongoUserCollection = collectionName+'_users'
  mongoDbName = dbName

  mongoDb = mongoClient.db(mongoDbName)

  let collections = await mongoDb.collection('system.namespaces').find().toArray()
  if(collections.indexOf(mongoRoleCollection) == -1)
    await mongoDb.createCollection(mongoRoleCollection)
  if(collections.indexOf(mongoUserCollection) == -1)
    await mongoDb.createCollection(mongoUserCollection)
}
exports.disconnectMongo = async function() {
  if(mongoClient != null) {
    mongoClient.close()
    mongoClient = null
    return true
  }
  return false
}
exports.mongoIsConnected = async function() {
  return mongoClient != null
}
exports.getRoleCollection = async function() {
  return mongoDb.collection(mongoRoleCollection);
}
exports.getUserCollection = async function() {
  return mongoDb.collection(mongoUserCollection);
}
// ---------------------------------------- INTERNAL
exports.reset = async function() {
  let roleCol = await exports.getRoleCollection()
  let userCol = await exports.getUserCollection()
  await roleCol.drop()
  await userCol.drop()
  await mongoDb.createCollection(mongoRoleCollection)
  await mongoDb.createCollection(mongoUserCollection)
}
exports.init = async function() {
  await exports.createRole('admin','admin')
  await exports.createUser('0000','admin')
}
// ---------------------------------------- USERS RETRIEVAL
exports.retrieveAllUsers = async function() {
  let userCol = await exports.getUserCollection()
  let dbUsers = await userCol.find({}).toArray()
  return dbUsers
}
exports.userExists = async function(userKey) {
  let userCol = await exports.getUserCollection()
  let found = await userCol.find({key:userKey}).toArray()
  return found.length > 0
}
exports.retrieveOneUser = async function(userKey) {
  let userCol = await exports.getUserCollection()
  if(await exports.userExists(userKey))
    return await userCol.findOne({key:userKey})
  return null
}
// ---------------------------------------- ROLE
exports.roleExists = async function(roleName) {
  let roleCol = await exports.getRoleCollection()
  let found = await roleCol.find({name:roleName}).toArray()
  return found.length > 0
}
exports.createRole = async function(roleName, baseRights) {
  let roleCol = await exports.getRoleCollection()
  let roleDocument = {name:roleName,rights:[baseRights]}
  await roleCol.insertOne(roleDocument)
}
exports.removeRole = async function(roleName) {
  if(! await exports.roleExists(roleName))
    return false
  let roleCol = await exports.getRoleCollection()
  await roleCol.deleteOne({name:roleName})
  return true
}
exports.roleHasRight = async function(roleName, right) {
  if(! await exports.roleExists(roleName)) {
    throw 'Role name "'+roleName+'" does not exist'
  }
  let roleCol = await exports.getRoleCollection()
  let role = await roleCol.findOne({name:roleName})
  return role.rights.indexOf(right)>-1
}
exports.addRoleRight = async function(roleName, right) {
  if(! await exports.roleExists(roleName))
    return false
  let roleCol = await exports.getRoleCollection()
  let role = await roleCol.findOne({name:roleName})
  let rights = role.rights
  rights.push(right)
  await roleCol.findOneAndUpdate({name:roleName},{$set:{rights:rights}})
  return true
}
exports.removeRoleRight = async function(roleName, right) {
  if(! await exports.roleHasRight(roleName,right))
    return false
  let roleCol = await exports.getRoleCollection()
  let role = await roleCol.findOne({name:roleName})
  let rights = role.rights
  let index = rights.indexOf(right)
  rights.splice(index,1)
  await roleCol.findOneAndUpdate({name:roleName},{$set:{rights:rights}})
  return true
}
// ---------------------------------------- USER MANAGE
exports.createUser = async function(userKey, baseRole) {
  if(! await exports.roleExists(baseRole)) {
    throw 'Base role "'+baseRole+'" does not exist'
  }
  let userCol = await exports.getUserCollection()
  let userDocument = {key:userKey,roles:[baseRole]}
  await userCol.insertOne(userDocument)
}
exports.removeUser = async function(userKey) {
  if(! await exports.userExists(userKey)) {
    return false
  }
  let userCol = await exports.getUserCollection()
  await userCol.deleteOne({key:userKey})
  return true
}
exports.updateUserKey = async function(oldUserKey, newUserKey) {
  if(! await exports.userExists(oldUserKey))
    return false
  let userCol = await exports.getUserCollection()
  await userCol.findOneAndUpdate({key:oldUserKey},{$set:{key:newUserKey}})
  return true
}
exports.userHasRole = async function(userKey, role) {
  if(! await exports.userExists(userKey))
    throw 'User "'+userKey+'" does not exist'
  let userCol = await exports.getUserCollection()
  let user = await userCol.findOne({key:userKey})
  return user.roles.indexOf(role)>-1
}
exports.addUserRole = async function(userKey, role) {
  if(await exports.userHasRole(userKey, role))
    return false
  let userCol = await exports.getUserCollection()
  let user = await userCol.findOne({key:userKey})
  let roles = user.roles
  roles.push(role)
  await userCol.findOneAndUpdate({key:userKey},{$set:{roles:roles}})
  return true
}
exports.removeUserRole = async function(userKey, role) {
  if(! await exports.userHasRole(userKey, role))
    return false
  let userCol = await exports.getUserCollection()
  let user = await userCol.findOne({key:userKey})
  let roles = user.roles
  let index = roles.indexOf(role)
  roles.splice(index,1)
  await userCol.findOneAndUpdate({key:userKey},{$set:{roles:roles}})
  return true
}
// ----------------------------------------