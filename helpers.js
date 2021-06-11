const getUserByEmail = function(email, database) {
  // lookup magic...
  let user;
  const keys = Object.keys(database);
  for (let key of keys) {
    if (database[key].email === email) {
      user = key;
    }
  }
  return user;
};

module.exports = getUserByEmail;