 
const Users = [
  { username: 'admin', password: '1234' },
  { username: 'user', password: 'pass' }
]

const getCredential = (user) => {
  return Users.find(e => e.username.toUpperCase() == user.toUpperCase());
}

const verPassword = (pass1, pass2) => {return pass1 == pass2}

module.exports = {
  getCredential, 
  verPassword
}
