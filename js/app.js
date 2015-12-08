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
    
    $scope.newEvents = [];
    $scope.upcomingEvents = [];
    $scope.pastEvents = [];
    
   $scope.signUp = function() {
       $scope.authObj.$createUser({
           email: $scope.email,
           password: $scope.password
       })
       .then($scope.logIn())
       .then(function(authData) {
           $scope.userId = authData.uid;
           $scope.users[authData.uid] ={
               handle: $scope.email   
           }
           $scope.users.$save(); 
       });
   }
    
    $scope.addEvent = function() {
        var newDate = $scope.date.toISOString();
        $scope.events.$add({
            title: $scope.title,
            description: $scope.description,
            year: Number(newDate.substr(0,4)),
            month: Number(newDate.substr(5,2)),
            day: Number(newDate.substr(8,2)),
            hour: Number(newDate.substr(11,2)) - 8,
            minute: newDate.substr(14,2)
        })
        .then(function() {
            $scope.date = "";
            $scope.title = "";
            $scope.description = "";
            $scope.addOneEvent($scope.events[$scope.events.length - 1]);
            $scope.eventClick = false;
        });    
    }
    
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        header:{
          left: 'title month agendaWeek',
          center: '',
          right: 'today prev,next'
        }
      }
    }

    $scope.logIn = function() {
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        });
    }
    
    $scope.signIn = function() {
        $scope.logIn().then(function(authData){
            $scope.userId = authData.uid;
            $scope.loggedIn = true;
            $scope.signInClick = false;
        });
    }

    $scope.addOneEvent = function(event) {   
        $scope.newEvents.push({
            title: event.title,
            start: new Date(event.year, event.month - 1, event.day, event.hour, Number(event.minute)),
            stick: true,
            description: event.description
        });
    }

    $scope.addToCalendar = function() {
        $scope.events.$loaded().then(function(events) {
            events.forEach(function(data) {
                $scope.getUpcomingEvents(data);
                $scope.addOneEvent(data);
            });
        });  
    }

    $scope.getUpcomingEvents = function(data) {
        var today = new Date().getTime();
        var testDate = new Date(data.year, data.month - 1, data.day, data.hour, Number(data.minute));
        if (today <= testDate.getTime()) {
            $scope.upcomingEvents.push(data);
        } else {
            $scope.pastEvents.push(data);
        }
    }

    $scope.remove = function(index) {
        $scope.events.splice(index, 1);
        $scope.addToCalendar();
    }

    $scope.addToCalendar();
    
    $scope.eventSources = [$scope.newEvents];
})

// Content controller: define $scope.url as an image
.controller('connectCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
	var ref = new Firebase("https://oca.firebaseio.com/");
    var membersRef = ref.child("members");
    $scope.members = $firebaseArray(membersRef) 
})

