const mongoose = require('mongoose');
const crypto  = require('crypto');

const validateEmail = (email) => {

  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  return re.test(email)

};

const users = new mongoose.Schema({
  first_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  user_name: {
    type: String,
    trim: true
  },
  
  email: {
    type: String,
    Required: 'Email address cannot be left blank.',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    index: {
      unique: true,
      dropDups: true
    }

  },
  password: {
    type: String,
    trim:true,
    Required: 'Password is required'
  },

  
  phones: { type: String, trim: true, set: function(v){ return v.replace(/[^0-9]/g,''); } }



});


module.exports = mongoose.model('users', users);