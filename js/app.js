// Create app
var myApp = angular.module('myApp', ['ui.router'])

// Configure app
myApp.config(function($stateProvider){
	$stateProvider
		.state('home', {
		url: '',
		templateUrl: 'templates/home.html',
		controller: 'homeCtrl',
		})
		.state('mission', {
			url: '/mission',
			templateUrl: 'templates/mission.html',
			controller: 'missionCtrl'
		})
		.state('about', {
			url: '/about',
			templateUrl: 'templates/about.html',
			controller: 'aboutCtrl'
		})
		.state('membership', {
			url: '/membership',
			templateUrl: 'templates/membership.html',
			controller: 'membershipCtrl'
		})
		.state('events', {
			url: '/events',
			templateUrl: 'templates/events.html',
			controller: 'eventsCtrl'
		})
		.state('photos', {
			url: '/photos',
			templateUrl: 'templates/photos.html',
			controller: 'photosCtrl'
		})
		.state('contact', {
			url: '/contact',
			templateUrl: 'templates/contact.html',
			controller: 'contactCtrl'
		})
})

// Landing page controller: define $scope.number as a number
.controller('homeCtrl', function($scope){
	
})

// About page controller: define $scope.about as a string
.controller('missionCtrl', function($scope){
	
})

// Content controller: define $scope.url as an image
.controller('aboutCtrl', function($scope){
	
})

// Content controller: define $scope.url as an image
.controller('membershipCtrl', function($scope){
	
})

// Content controller: define $scope.url as an image
.controller('eventsCtrl', function($scope){
	
})

// Content controller: define $scope.url as an image
.controller('photosCtrl', function($scope){
	
})

// Content controller: define $scope.url as an image
.controller('contactCtrl', function($scope){
	
})

