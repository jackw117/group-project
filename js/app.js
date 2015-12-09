// Create app
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'ui.calendar', 'ngAnimate'])

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
    
    var pswpElement = document.querySelectorAll('.pswp')[0];

// build items array
var items = [
    {
        src: 'https://farm6.staticflickr.com/5758/22993130203_1c7c3b9f65_o.jpg',
        w: 3264,
        h: 2448
    },
    {
        src: 'https://placekitten.com/1200/900',
        w: 1200,
        h: 900
    }
];

// define options (if needed)
var options = {
    // optionName: 'option value'
    // for example:
    index: 0 // start at first slide
};

// Initializes and opens PhotoSwipe
var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
gallery.init();
    
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

   $scope.feedLinks = ['http://ocaseattle.org/feed','http://feeds.feedburner.com/angryasianman/hMam?format=xml','http://www.iexaminer.org/feed/'];
    
    for (var i = 0; i < $scope.feedLinks.length; i++) {
        Feed.parseFeed($scope.feedLinks[i]).then(function(res) {
            $scope.feeds = res.data.responseData.feed.entries;
            $scope.feeds = $scope.feeds.map(function(obj) {
                //$('.blog-full').append(obj.content)
                var rObj = obj;
                var ref = obj.publishedDate.split(" ");
                rObj['date'] = { 
                    'month': ref[2],
                    'day': ref[1],
                    'year': ref[3],
                };
                return rObj;
            })
        });
    };
}])

.controller('eventsCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $compile, uiCalendarConfig){
	var ref = new Firebase("https://oca.firebaseio.com/");
    var eventsRef = ref.child("events");
    $scope.events = $firebaseArray(eventsRef);
	$scope.authObj = $firebaseAuth(ref);
	var authData = $scope.authObj.$getAuth();
    
    $scope.signInClick = false;
    $scope.loggedIn = false;
    $scope.eventClick = false;
    $scope.showCalendar = true;
    $scope.clicked = false;
    $scope.submitClick = false;
    $scope.adminClick = false;
    
    $scope.newEvents = [];
    $scope.upcomingEvents = [];
    $scope.pastEvents = [];
    
   $scope.signUp = function() {
       $scope.authObj.$createUser({
           email: $scope.adminMail,
           password: $scope.adminPass
       });
       $scope.adminClick = false;
   }
    
    $scope.addEvent = function() {
        var newDate = $scope.date.toISOString();
        $scope.events.$add({
            title: $scope.title,
            description: $scope.description,
            year: Number(newDate.substr(0,4)),
            month: Number(newDate.substr(5,2)),
            day: correctDay(Number(newDate.substr(8,2)), Number(newDate.substr(11,2))),
            hour: correctTime(Number(newDate.substr(11,2))),
            minute: newDate.substr(14,2),
            location: $scope.location
        })
        .then(function() {
            $scope.date = "";
            $scope.title = "";
            $scope.description = "";
            $scope.location = "";
            $scope.addOneEvent($scope.events[$scope.events.length - 1]);
            $scope.getUpcomingEvents($scope.events[$scope.events.length - 1]);
            $scope.eventClick = false;
        });    
    }
    
    var correctTime = function(num) {
        if (num <= 8) {
            return num + 16;   
        } else {
            return num - 8;   
        }
    }
    
    var correctDay = function(day, hour) {
        if (hour <= 8) {
            return day - 1;   
        } else {
            return day;   
        }
    }
    
    $scope.clickEvent = function(date, jsEvent, view) {
        $scope.clicked = true;
        $scope.clickTitle = date.title;
        $scope.clickDesc = date.description;
        $scope.clickLocation = date.location;
        $scope.clickYear = date.year;
        $scope.clickMonth = date.month;
        $scope.clickHour = date.hour;
        $scope.clickMinute = date.minute;
        $scope.clickDay = date.day
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
        eventClick: $scope.clickEvent
      }
    }

    $scope.logIn = function() {
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        });
    }
    
    $scope.signIn = function() {
        $scope.submitClick = true;
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
            description: event.description,
            location: event.location,
            hour: event.hour,
            minute: event.minute,
            year: event.year,
            month: event.month,
            day: event.day
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

    $scope.removeUpcoming = function(index, data) {    
        $scope.upcomingEvents.splice(index, 1);
        $scope.events.$remove(data);
    }
    
    $scope.removePast = function(index, data) {
        $scope.pastEvents.splice(index, 1);
        $scope.events.$remove(data);
    }

    $scope.addToCalendar();
    
    $scope.eventSources = [$scope.newEvents];
    console.log($scope.upcomingEvents);
})

.controller('connectCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject){
	var ref = new Firebase("https://oca.firebaseio.com/");
    var membersRef = ref.child("members");
    $scope.members = $firebaseArray(membersRef); 

    $scope.addMember = function() {
        console.log("here")
        var newMember = $scope.date.toISOString();
        $scope.members.$add({
            name: $scope.name,
            year: Number(newMember.substr(0,4)),
            month: Number(newMember.substr(5,2)),
            day: Number(newMember.substr(8,2)),
            address: $scope.address,
            zip: $scope.zip,
            city: $scope.city,
            state: $scope.state,
            email: $scope.email,
            phone: $scope.phone
        })
        .then(function() {
            $scope.date = "";
            $scope.name = "";
        });    
    }
    
    //check to make sure this works
    $scope.checkMember = function() {
        $scope.emailInUse = false;
        $scope.members.forEach(function(data) {
            if (data.email === $scope.email) {
                $scope.emailInUse = true;
            }
        })
        .then(function() {
            if (!$scope.emailInUse) {
                $scope.addMember();       
            }    
        });
        
    }
})

