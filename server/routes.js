module.exports = app => {

	app.get(`/`, (req, res) => {
		res.sendfile('./public/index.html');
	});

	// const funnyStuff = {
	// 	question: `Why did the chicken cross the road?`,
	// 	answer: `To get to the other side`
	// };

	app.get(`/data`, (req, res) => {
		res.json(funnyStuff);
	});

	app.get(`/messages`, (req, res) => {
		const result = {
			messages: [{
					id: 1,
					from: 'John',
					text: 'Hello World!',
					messages: [{
						id: 11,
						from: 'Sally',
						text: 'Hi!'
					}, {
						id: 12,
						from: 'Mary',
						text: 'Hi there!'
					}]
				}, {
					id: 2,
					from: 'Term',
					message: 'I am back!'
				}
			]
		};
		res.json(result);
	});

	app.post(`/messages`, (req, res) => {
		console.log(req.jsonBody);
	});
};