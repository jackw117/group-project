// Create app
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'ui.calendar'])

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
.controller('eventsCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $compile, uiCalendarConfig){
	var ref = new Firebase("https://oca.firebaseio.com/");
	var usersRef = ref.child("users");
    var eventsRef = ref.child("events");
	$scope.users = $firebaseObject(usersRef);
    $scope.events = $firebaseArray(eventsRef);
	$scope.authObj = $firebaseAuth(ref);
	var authData = $scope.authObj.$getAuth();
    
    $scope.signInClick = false;
    $scope.loggedIn = false;
    $scope.eventClick = false;
    
//    $scope.signUp = function() {
//        $scope.authObj.$createUser({
//            email: $scope.email,
//            password: $scope.password
//        })
//        .then($scope.logIn())
//        .then(function(authData) {
//            $scope.userId = authData.uid;
//            $scope.users[authData.uid] ={
//                handle: $scope.email   
//            }
//            $scope.users.$save();
//            
//        })
//    }
    
    $scope.addEvent = function() {
        
        $scope.events.$add({
            date: $scope.date
        })
        .then(function() {
           $scope.date = ""; 
        });
        $scope.eventClick = false;
        console.log($scope.events)
    }

    $scope.logIn = function() {
        $scope.signInClick = false;
        $scope.loggedIn = true;
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        });
    }
    
    $scope.signIn = function() {
        $scope.logIn().then(function(authData){
            $scope.userId = authData.uid;
        });
    }
    
//    $scope.checkNames = function() {
//        $scope.nameInUse = false;
//        $scope.users.forEach(function(data) {
//            if (data.handle === $scope.handle) {
//                $scope.nameInUse = true;
//            }
//        });
//        $scope.checkInUse();
//    }
//
//    $scope.checkInUse = function() {
//        if (!$scope.nameInUse) {
//            $scope.signUp();
//            $scope.signInClick = false;
//        }
//    }
})

// Content controller: define $scope.url as an image
.controller('connectCtrl', function($scope){
	
})

