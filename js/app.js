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
		.state('blog', {
			url:'/blog',
			templateUrl: 'templates/blog.html',
			controller: 'blogCtrl'
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

.controller('aboutCtrl', function($scope, $http){
	// Gets data containing artwork information
	$http.get('json/profiles.json').success(function(response){
		$scope.profiles = response;
	})
})

.factory('FeedService', ['$http', function($http) {
    return {
        parseFeed: function(url) {
            return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
    }
}])

/* Uses Google API which is deprecated */
.controller("blogCtrl", ['$scope', 'FeedService', function($scope, Feed) {
    /* To use another feed jsut copy below example */
    Feed.parseFeed('http://ocaseattle.org/feed').then(function(res) {
        $scope.feeds = res.data.responseData.feed.entries;
        $scope.feeds = $scope.feeds.map(function(obj) {
            
            var rObj = obj;
            var ref = obj.publishedDate.split(" ");
            rObj['date'] = { 
                'month': ref[2],
                'day': ref[1],
                'year': ref[3],
            };
            return rObj;
        })
        console.log($scope.feeds)
    });
}])

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
        var newDate = $scope.date.toISOString();
        console.log($scope.time)
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
            $scope.addOneEvent();
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
        },
        eventMouseover: $scope.hoverEvent
      }
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

    $scope.addOneEvent = function() {
        $scope.events.$loaded().then(function(events) {
            var newEvent = events[events.length - 1];
            $scope.newEvents.push({
                title: newEvent.title,
                start: new Date(newEvent.year, newEvent.month - 1, newEvent.day, newEvent.hour, Number(newEvent.minute)),
                stick: true
            });
        });
    }

    $scope.addToCalendar = function() {
        $scope.events.$loaded().then(function(events) {
            events.forEach(function(data) {
                console.log(data.hour)
                $scope.newEvents.push({
                    title: data.title,
                    start: new Date(data.year, data.month - 1, data.day, data.hour, Number(data.minute)),
                    stick: true
                });
            });
        });  
    }

    $scope.addToCalendar();
    
    $scope.eventSources = [$scope.newEvents];
    console.log($scope.eventSources)
})

.controller('connectCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
	var ref = new Firebase("https://oca.firebaseio.com/");
    var membersRef = ref.child("members");
    $scope.members = $firebaseArray(membersRef) 
})

