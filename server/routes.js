module.exports = app => {

	var lastId = 1;
	var messages = [{
		id: 1,
		from: 'Moderator',
		text: 'Welcome to our chat!',
		messages: []
	}];

	var getNewId = function() {
		return ++lastId;
	}

	var findMessageById = function(id, arr = messages, level = 1) {
		if (!arr || !arr.length)
			return null;
		let result;
		for (let i = 0; i < arr.length; i++) {
			const message = arr[i];
			if (message.id === id) {
				result = message;
				break;
			} else {
				if (message.messages) {
					result = findMessageById(id, message.messages, level + 1);
					if (result) {
						break;
					}
				}
			}
		}
		return result;
	}

	app.get(`/`, (req, res) => {
		res.sendfile('./public/index.html');
	});

	app.get(`/messages`, (req, res) => {
		const result = {
			messages: messages,
			lastId: lastId,
		};
		res.json(result);
	});

	app.post(`/messages`, (req, res) => {
		let request = req.jsonBody;
		let parentMessage = findMessageById(request.parentId);
		if(!parentMessage.messages) {
			parentMessage.messages = [];
		}
		const message = {
			id: getNewId(),
			from: request.from,
			text: request.text,
			messages: [],
		};
		parentMessage.messages.push(message);
		console.log(message);
	});
};