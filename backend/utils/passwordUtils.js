const bcrypt = require('bcryptjs');

// Hash password
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10); // 10 salt rounds
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
