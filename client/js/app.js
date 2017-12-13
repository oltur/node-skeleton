// App
const app = angular.module('app', ['toastr']);

// Service to fetch some data..
app.factory('messagesService', ['$http', 'toastr', ($http, toastr) => {
	return {
		get: () => $http.get('/messages'),
		post: (messageid, text) => {
			const data = {parentId: messageid, text: text, from: 'TBD'};
			$http.post('/messages', data),
			toastr.info(`Sent: ${JSON.stringify(data)}`);
		}
	}
}]);

// App controller
app.controller('appController', ['$scope', 'messagesService', 'toastr', ($scope, data, toastr) => {
	data.get().success(resp => {
		$scope.messages = resp.messages;
		$scope.replying = [];
		$scope.replyText = "";

		$scope.replyInputKeyPress = (messageid, $event, replyText) => {
			if ($event.keyCode == 13) {
				$scope.replying[messageid] = false;
				data.post(messageid, replyText);
			}
			return true;
		};
	});
}]);