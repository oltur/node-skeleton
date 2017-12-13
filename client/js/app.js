// App
const app = angular.module('app', ['toastr']);

app.factory('messagesService', ['$http', ($http) => {
	return {
		get: () => $http.get('/messages'),
		post: (data) => {
			$http.post('/messages', data);
		}
	}
}]);

app.factory('userService', ['$http', 'tools', ($http, tools) => {
	return {
		getUserName: () => {
			let userName = localStorage.getItem("userName");
			if (userName) {
				console.log(userName);
				return Promise.resolve(userName)
			} else {
				return $http.get('https://randomuser.me/api/').then((response) => {
					let data = response.data;
					let userName = (!data || data.error) ?
						"Mr. Some One" :
						tools.toTitleCase(
							`${data.results[0].name.title}. ${data.results[0].name.first} ${data.results[0].name.last}`);
					localStorage.setItem("userName", userName);
					return Promise.resolve(userName);
				})
			}
		},
		setUserName: (userName) => {
			localStorage.setItem("userName", userName)
		}
	}
}]);

app.factory('tools', [() => {
	return {
		toTitleCase: (str) => {
			return str.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
	}
}]);

// App controller
app.controller('appController', [
	'$scope',
	'$timeout',
	'$interval',
	'messagesService',
	'toastr',
	'userService',
	'tools',
	($scope, $timeout, $interval, messagesService, toastr, userService, tools) => {

		$scope.replyInputKeyPress = (messageid, $event, replyText) => {
			if ($event.keyCode == 13) {
				$scope.replying[messageid] = false;
				const message = {
					parentId: messageid,
					text: replyText,
					from: $scope.userName
				};
				messagesService.post(message);
				toastr.info(`Sent: ${JSON.stringify(message)}`);
				$scope.updateMessages();
			}
			return true;
		};

		$scope.updateMessages = () => {
			messagesService.get()
				.then(response => {
					$timeout(() => {
						const dataMessages = response.data;
						$scope.messages = dataMessages.messages;
					}, 0);
				});
		};

		$scope.saveUserName = (userName) => {
			userService.setUserName(userName);
		};

		Promise.all([messagesService.get(), userService.getUserName()])
			.then(responses => {

				$scope.$apply(() => {
					const dataMessages = responses[0].data;
					const dataUserName = responses[1];

					const lastIdServer = dataMessages.lastId;
					$scope.lastIdClient = lastIdServer;

					$scope.messages = dataMessages.messages;
					$scope.replying = [];
					$scope.replyText = "";
					$scope.userName = dataUserName;
				});

				var theInterval = $interval(() => {
					messagesService.get()
						.then(response => {
							const dataMessages = response.data;
							const lastIdServer = dataMessages.lastId;
							if (lastIdServer !== $scope.lastIdClient) {
								$scope.lastIdClient = lastIdServer;
								$scope.messages = dataMessages.messages;
							}
						});
				}, 5000);

				$scope.$on('$destroy', function () {
					$interval.cancel(theInterval)
				});
			});
	}
]);