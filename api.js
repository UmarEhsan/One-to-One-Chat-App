let chat = require('./controllers/chats');

let routesAPI = function(app){
	app.get('/getSingleUserConversation', chat.getSingleUserConversation);
	app.delete('/deletSingleConverstion', chat.deleteSingleConversation);
	app.delete('/deletConverstion', chat.deletConverstion);
	app.get('/getUserConversations', chat.getConversations);
	app.post('/new_converstion', chat.newConversation);
	app.post('/send_reply', chat.sendReply);
}s


module.exports = routesAPI; 