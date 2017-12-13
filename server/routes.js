const axios = require('axios');

module.exports = app => {

	const botName = 'The Bot';

	var lastId = 1;
	var messages = [{
		id: 1,
		from: botName,
		text: 'Welcome to our chat!',
		messages: []
	}];

	var botMessagesStandard = {
		"yes": "Could you provide more details please?",
		"no": "Please don't be so decisive",
		"maybe": "Doubts, doubts, doubts...",
	};

	var botMessagesDynamic = {};

	var cleanText = function (text) {
		return text.trim().toLowerCase().replace(/\s/g, '');
	}

	var getBotReply = function (message) {
		const rnd = Math.random();
		const wannaReply = true; //rnd <= 0.5;
		let pastRelevantMessage;
		if (wannaReply) {
			let result = null;
			const cleanedText = cleanText(message.text);

			if (pastRelevantMessage = findMessage(pastMessage => cleanText(pastMessage.text) == cleanedText && pastMessage.messages.length > 1)) {
				const pastText = cleanText(pastRelevantMessage.text);
				if (pastText.endsWith('?')) {
					const cleanedMessages = pastRelevantMessage.messages.filter(message => message.from != botName);
					console.log(cleanedMessages);
					const index = Math.floor(Math.random() * cleanedMessages.length);
					console.log(index);
					var choosenChildMessage = cleanedMessages[index];
					return Promise.resolve(`Already asked before. ${choosenChildMessage.from} answered: "${choosenChildMessage.text}"`);
				}
			}
			if (cleanedText.endsWith('?')) {
				return Promise.resolve("I don't know... Let's wait, It shoould be somebody smarter here");
			}
			if (botMessagesStandard.hasOwnProperty(cleanedText)) {
				return Promise.resolve(botMessagesStandard[cleanedText]);
			}
			if (botMessagesDynamic.hasOwnProperty(cleanedText)) {
				return Promise.resolve(`As I already said: "${botMessagesDynamic[cleanedText]}"`);
			}
			if (rnd > 0.5) {
				// decided to keep silence...
				return Promise.resolve(null);
			}

			const url = "http://ron-swanson-quotes.herokuapp.com/v2/quotes";
			return axios.get(url).then(data => {
				botMessagesDynamic[cleanedText] = data.data[0];
				return Promise.resolve('By the way, ' + data.data[0]);
			});

		} else {
			return Promise.resolve(null);
		}

	}

	var getNewId = function () {
		return ++lastId;
	}

	var findMessage = function (selector, arr = messages, level = 1) {
		if (!arr || !arr.length)
			return null;
		let result;
		for (let i = 0; i < arr.length; i++) {
			const message = arr[i];
			if (selector(message)) {
				result = message;
				break;
			} else {
				if (message.messages) {
					result = findMessage(selector, message.messages, level + 1);
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

		if (!request.text) {
			return;
		}

		let parentMessage = findMessage((message) => message.id == request.parentId);
		if (!parentMessage.messages) {
			parentMessage.messages = [];
		}
		const message = {
			id: getNewId(),
			from: request.from,
			text: request.text,
			messages: [],
		};
		parentMessage.messages.push(message);

		getBotReply(message).then(botReply => {
			if (botReply) {
				const messageBot = {
					id: getNewId(),
					from: botName,
					text: botReply,
					messages: [],
				};
				message.messages.push(messageBot);
			}
		});

	});
};