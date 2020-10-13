const Conversations = require('../models/conversations');
Messages = require('../models/messages'),
Users = require('../models/users'),
  

let mediaHelper = require("../../../helper/media");

const mongoose = require('mongoose');
let async = require("async");
exports.getConversations = function (req, res, next) {
  // Only return one message from each conversation to display as snippet
  Conversations.find({
      participants: {
        $in: [req.headers.user_id]
      }
    })
    // .select('_id')
    .exec(function (err, conversations) {
      if (err) {
        res.send({
          error: err
        });
        return next(err);
      }

      // Set up empty array to hold conversations + most recent message
      if (conversations.length > 0) {
        let fullConversations = [];
        // console.log(conversations);
        conversations.forEach(function (conversation) {
          // console.log('Conversations!!!');

          Messages.find({
              'conversationId': conversation._id
            })
            .sort('-createdAt')
            .limit(1)
            // .populate({
            //   path: "author",
            //   select: "first_name last_name profile_pic"
            // })
            .exec(function (err, message) {
              if (err) {
                res.send({
                  error: err
                });
                return next(err);
              }
              let participants = conversation.participants;
              let sender_, recipient_;
              if (participants[0] == req.headers.user_id) {
                console.log('Sender0');
                sender_ = participants[0];
                recipient_ = participants[1];
                async.parallel([function (callback) {
                  Users.find({
                      '_id': sender_
                    })
                    .exec(function (err, senderUser) {
                      if (!err) {
                        callback(null, senderUser);
                      } else {
                        callback(null, "");
                      }
                    })

                }, function (callback) {
                  Users.find({
                      '_id': recipient_
                    })
                    .exec(function (err, recipientUser) {
                      if (!err) {
                        callback(null, recipientUser);
                      } else {
                        callback(null, "");
                      }
                    })
                },], function (err, results) {
                    if(!err)
                    {

                      // console.log('sender', results[0][0]);
                      console.log('recipient', results[1][0]);
                      // console.log('senderProfilePic', results[2][0]);
                      // console.log('recipientProfilePic', results[3][0]);

                      let data = JSON.stringify(message[0]);
                      let messages = JSON.parse(data);
                      //Better to do enumeration here 
                      //This code is repeated need to make a single function to get that data
                      let sendee = {_id, first_name, email, last_name}  = results[0][0];
                      messages.sender = {};
                      messages.sender.first_name = first_name;
                      messages.sender.sender_id = sendee._id;
                      messages.sender.email = email;
                      messages.sender.last_name = last_name;
                      //Better to do enumeration here 
                      let reciepti = {_id, first_name, email, last_name}  = results[1][0];
                      messages.recipient = {};
                      messages.recipient.recipient_id = reciepti._id;
                      messages.recipient.first_name = first_name;
                      messages.recipient.email = email;
                      messages.recipient.last_name = last_name;
                     

                      fullConversations.push(messages);
                        if (fullConversations.length === conversations.length) {
                          return res.status(200).json({
                            'conversations': fullConversations
                          });
                        }

                    }
                })
              } else if (participants[1] == req.headers.user_id) {
                console.log('Sender1');
                sender_ = participants[1];
                recipient_ = participants[0];
                async.parallel([function (callback) {
                  Users.find({
                      '_id': sender_
                    })
                    .exec(function (err, senderUser) {
                      if (!err) {
                        callback(null, senderUser);
                      } else {
                        callback(null, "");
                      }
                    })

                }, function (callback) {
                  Users.find({
                      '_id': recipient_
                    })
                    .exec(function (err, recipientUser) {
                      if (!err) {
                        callback(null, recipientUser);
                      } else {
                        callback(null, "");
                      }
                    })
                } ], function (err, results) {
                  if(!err)
                  {

                    let data = JSON.stringify(message[0]);
                    let messages = JSON.parse(data);
                    let sendee = {_id, first_name, email, last_name}  = results[0][0];
                    //Better to do enumeration here 
                    messages.sender = {};
                    messages.sender.first_name = first_name;
                    messages.sender.sender_id = sendee._id;
                    messages.sender.email = email;
                    messages.sender.last_name = last_name;
                    let reciepti = {_id, first_name, email, last_name}  = results[1][0];
                    //Better to do enumeration here 
                    messages.recipient = {};
                    messages.recipient.recipient_id = reciepti._id;
                    messages.recipient.first_name = first_name;
                    messages.recipient.email = email;
                    messages.recipient.last_name = last_name;
                   

                    fullConversations.push(messages);
                      if (fullConversations.length === conversations.length) {
                        return res.status(200).json({
                          'conversations': fullConversations
                        });
                      }

                  }
                })
              }

              


              

            });
        });
      } else {
        return res.status(200).json({
          error: 'No chat yet'
        });
      }

    });
}

exports.getConversation = function (req, res, next) {
  Messages.find({
      conversationId: req.params.conversationId
    })
    .select('createdAt body author')
    .sort('-createdAt')
    .populate({
      path: 'author',
      select: 'firstName lastName'
    })
    .exec((err, messages) => {
      if (err) {
        res.send({
          error: err
        });
        return next(err);
      }

      return res.status(200).json({
        conversation: messages
      });
    });
};
exports.getSingleUserConversation = function (req, res, next) {
  // console.log(sender, recipient)
  console.log("Hello")
  console.log(req.query);
  let {
    sender,
    recipient
  } = req.query;
  console.log(sender);
  console.log(recipient);
  Conversations.find({
    participants: {
      $all: [sender, recipient]
    }
  }, function (err, data) {
    if (!err && data.length > 0) {
      console.log(data);
      let conversationId = data[0]._id;
      Messages.find({
          conversationId: conversationId
        })
        .select('createdAt body author conversationId')
        .sort('-createdAt')
        .populate({
          path: 'author',
          select: 'first_name last_name'
        })
        .exec((err, messages) => {
          if (err) {
            res.send({
              error: err
            });
            return next(err);
          }
          if(messages.length > 0)
          {
            messages[0].sender = sender;
            messages[0].recipient = recipient;
            let data = JSON.stringify(messages);
            let conversation = JSON.parse(data);
            // conversation[0].sender = sender;
            // conversation[0].recipient = recipient;
            conversation = conversation.map(function (elem) {
              elem.sender = sender;
              elem.recipient = recipient;
              return elem
            })
            return res.status(200).json({
              conversation: conversation
            });
          }
          else
          {
            return res.status(200).json({
              error: 'No chat yet'
            });
          }

         
        });
    } else {
      return res.status(200).json({
        error: 'No chat yet'
      });
    }
  })


};

exports.deleteSingleConversation = function (req, res, next) {
  // console.log(sender, recipient)
  console.log("Hello000")
  console.log(req.query.message_id);
  Conversations.deleteOne({_id: req.query.conversation_id}, function (err, data) {
    if(!err)
    {
      console.log(data);
      res.send({status: 200, message: "Conversations delete succeesfully"});
      return;
    }
    res.send({status: 400, message: "Error in delete message"});

  });
  


};
exports.deletConverstion = function (req, res, next) {
  // console.log(sender, recipient)
  console.log("Hello000")
  console.log(req.query.message_id);
  Conversations.find({_id: req.query.conversation_id}, function(err, data){
       if(!err)
    {
      console.log(data);
      res.send({status: 200, data: data, message: "Conversations deleted succeesfully"});
      return;
    }
    res.send({status: 400, message: "Error in delete message"});
  })
  // Conversations.deleteOne({ _id: req.query.message_id }, function (err, data) {
  //   if(!err)
  //   {
  //     console.log(data);
  //     res.send({status: 200, message: "Messages delete succeesfully"});
  //     return;
  //   }
  //   res.send({status: 400, message: "Error in delete message"});

  // });
  


};

exports.newConversation = function (req, res, next) {

  let {
    recipient,
    composedMessage,
    sender,
    image,
    video
  } = req.body;

  if (!recipient) {
    res.status(422).send({
      error: 'Please choose a valid recipient for your message.'
    });
    return next();
  }

  if (!composedMessage) {
    res.status(422).send({
      error: 'Please enter a message.'
    });
    return next();
  }


  async.parallel([
    function (callback) {
      if (image) {
        // imageHelper.uploadImage(image.path, pic_callback);
        var filename = sender;
        mediaHelper.uploadProfilePic(image, filename, pic_callback)

        function pic_callback(image_data) {
          console.log("Data");
          if (image_data === 'Internal Server Error') {
            // console.log(err);
            // reject("Internal Server Error");
            res.send({
              error: "Internal Server Error"
            });
            return;
          }

          callback(null, image_data);
        }
      } else {
        callback(null, "");
      }

    },
   
  ], function (err, results) {
    // optional callback


    if (!err) {


      Conversations.find({
          participants: {
            $all: [sender, recipient]
          }
        },
        function (err, data) {
          console.log(data);
          if (!err && data.length > 0) {
            console.log(data);
            const reply = new Messages({
              conversationId: data[0]._id,
              body: composedMessage,
              author: sender,
              image: results[0] || '',
              video: results[1] || ''
            });

            reply.save((err, sentReply) => {
              if (err) {
                res.send({
                  error: err
                });
                return next(err);
              }
              console.log("Reply successfully sent");
              console.log(sentReply);
              return res.status(200).json({
                message: 'Reply successfully sent!',
                conversationId: sentReply.conversationId,
                last_message: sentReply
              });
            });
          } else if (data === undefined || data.length === 0) {
            const conversation = new Conversations({
              participants: [sender, recipient]
            });

            conversation.save((err, newConversation) => {
              if (err) {
                res.send({
                  error: err
                });
                return next(err);
              }

              const message = new Messages({
                conversationId: newConversation._id,
                body: composedMessage,
                author: sender,
                image: results[0] || '',
                video: results[1] || ''
              });

              message.save((err, newMessage) => {
                if (err) {
                  res.send({
                    error: err
                  });
                  return next(err);
                }

                return res.status(200).json({
                  message: 'Conversations started!',
                  conversation_id: conversation._id,
                  last_message: newMessage
                });
              });
            });
          }
        })


      // let message_obj = {
      //   recipient, composedMessage, sender, picture, video
      // }
      // post_obj.picture = results[0];
      // post_obj.video = results[1];
      // post_obj.user_id = user;


      // for(let postdata in message_obj)
      // {
      //   post_model[postdata] = post_obj[postdata];
      // }

      // post_model.save(function (err, success) {
      //   // let calendar_schema = new calendar_model();
      //   if (err) {
      //     console.log(err);
      //     reject(err);
      //     return;
      //   }
      //   resolve(success)

      // });

    } else {
      res.send({
        error: err
      });
      return;
    }
  });






};

exports.sendReply = function (req, res, next) {
  let {
    recipient,
    composedMessage,
    sender,
    image,
    video,
    conversation_id
  } = req.body;
  async.parallel([
    function (callback) {
      if (image) {
        
        var filename = sender;
        mediaHelper.uploadProfilePic(image, filename, pic_callback)

        function pic_callback(image_data) {
          console.log("Data");
          if (image_data === 'Internal Server Error') {
            // console.log(err);
            res.send({
              error: "Internal Server Error"
            });
            return;
          }

          callback(null, image_data);
        }
      } else {
        callback(null, "");
      }

    }
  ], function (err, results) {
    if (!err) {
      const reply = new Messages({
        conversationId: conversation_id,
        body: composedMessage,
        author: sender,
        image: results[0] || '',
        video: results[1] || ''
      });
      reply.save((err, sentReply) => {
        if (err) {
          res.send({
            error: err
          });
          return;
        }
        console.log("Reply successfully sent");
        console.log(sentReply);
        return res.status(200).json({
          message: 'Reply successfully sent!',
          conversation_id: sentReply.conversationId,
          last_message: sentReply
        });
      });
    } else {
      res.send({
        error: err
      });
      return;
    }
  });








};

exports.sharePost = function (req, res, next) {
  let {
    recipient,
    post_id,
    sender
  } = req.body;
  console.log(req.body);

  Posts.find({
      _id: post_id
    })
    .exec((err, post) => {

      console.log("Post", post);
      Conversations.find({
          participants: {
            $all: [sender, recipient]
          }
        },
        function (err, data) {
          console.log(data);
          if (!err && data.length > 0) {
            console.log(data);
            const reply = new Messages({
              conversationId: data[0]._id,
              body: 'share post',
              author: sender,
              image: post[0].picture || '',
              video: post[0].video || '',
              post_id: post[0]._id
            });

            reply.save((err, sentReply) => {
              if (err) {
                res.send({
                  error: err
                });
                return next(err);
              }
              console.log("Reply successfully sent");
              console.log(sentReply);
              return res.status(200).json({
                message: 'Reply successfully sent!',
                conversationId: sentReply.conversationId,
                last_message: sentReply
              });
            });
          } else if (data === undefined || data.length === 0) {
            const conversation = new Conversations({
              participants: [sender, recipient]
            });

            conversation.save((err, newConversation) => {
              if (err) {
                res.send({
                  error: err
                });
                return next(err);
              }

              const message = new Messages({
                conversationId: newConversation._id,
                body: 'share post',
                author: sender,
                image: post[0].picture || '',
                video: post[0].video || '',
                post_id: post[0]._id
              });

              message.save((err, newMessage) => {
                if (err) {
                  res.send({
                    error: err
                  });
                  return next(err);
                }

                return res.status(200).json({
                  message: 'Conversations started!',
                  conversation_id: conversation._id,
                  last_message: newMessage
                });
              });
            });
          }
        })


      // res.send(post);
    })


}


function getProfileField(files) {
  console.log(files)
  return files.profile_pic[0].path;;
}