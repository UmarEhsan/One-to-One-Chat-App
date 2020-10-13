const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'userss'
  },
  image: {
    type: String
  },
  video: {
    type: String
  },
  post_id: {
    type: Schema.Types.ObjectId,
    ref: 'posts'
  },
  profile_pic: {
    type: String,
 
  }
},
  {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
  });

module.exports = mongoose.model('Messages', MessageSchema);