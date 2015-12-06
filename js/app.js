// Create app
var myApp = angular.module('myApp', ['ui.router', 'firebase'])

// Configure app
myApp.config(function($stateProvider, $urlRouterProvider){
	
    //Redirects to home page for any unmatched url
    $urlRouterProvider.otherwise('/');
    
    $stateProvider
		.state('home', {
		url: '/',
		templateUrl: 'templates/home.html',
		controller: 'homeCtrl',
		})
		.state('about', {
			url: '/about',
			templateUrl: 'templates/about.html',
			controller: 'aboutCtrl'
		})
		.state('events', {
			url: '/events',
			templateUrl: 'templates/events.html',
			controller: 'eventsCtrl'
		})
		.state('connect', {
			url: '/connect',
			templateUrl: 'templates/connect.html',
			controller: 'connectCtrl'
		})
})


.controller('homeCtrl', function($scope, $http){
	$http.get('json/blogs.json')
		.then(function(dat) {
			$scope.blogs = dat.data;
	});
})

// Content controller: define $scope.url as an image
.controller('aboutCtrl', function($scope, $http){
	// Gets data containing artwork information
	$http.get('json/profiles.json').success(function(response){
		$scope.profiles = response
	})
})

// Content controller: define $scope.url as an image
.controller('eventsCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
	var ref = new Firebase("https://oca.firebaseio.com/");
	var usersRef = ref.child("users");
	$scope.users = $firebaseObject(usersRef);
	$scope.authObj = $firebaseAuth(ref);
	var authData = $scope.authObj.$getAuth();


})

// Content controller: define $scope.url as an image
.controller('connectCtrl', function($scope){
	
})

