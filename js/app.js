// Create app
var myApp = angular.module('myApp', ['ngRoute', 'firebase', 'ui.calendar'])

// Configure app
.config(function($routeProvider) {
    $routeProvider
		.when('/', {
		  templateUrl: 'templates/home.html',
		  controller: 'homeCtrl',
		})
		.when('/about/', {
			templateUrl: 'templates/about.html',
			controller: 'aboutCtrl'
		})
		.when('/blog/', {
			templateUrl: 'templates/blog.html',
			controller: 'blogCtrl'
		})
		.when('/events/', {
			templateUrl: 'templates/events.html',
			controller: 'eventsCtrl'
		})
		.when('/connect/', {
			templateUrl: 'templates/connect.html',
			controller: 'connectCtrl'
		})
        .otherwise({
            redirectTo: '/'
        });
})


.controller('homeCtrl', function($scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject){
    var ref = new Firebase("https://oca.firebaseio.com/");
    var eventsRef = ref.child("events");
    $scope.events = $firebaseArray(eventsRef);
    $scope.authObj = $firebaseAuth(ref);
    var authData = $scope.authObj.$getAuth();
     
	$http.get('json/blogs.json')
		.then(function(dat) {
			$scope.blogs = dat.data;
	});
    
    $(document).ready(function () {
        $('.bxslider').bxSlider();
    })
    
})

.controller('aboutCtrl', function($scope, $http){
	// Gets data containing artwork information
	$http.get('json/profiles.json').success(function(response){
		$scope.profiles = response;
	})
})

/* Uses Yahoo YQL API*/
.controller('blogCtrl', function($scope, $http) {
    $scope.feedLinks = ['http://ocaseattle.org/feed','http://www.iexaminer.org/feed/'];
    for (var i = 0; i < $scope.feedLinks.length; i++) {
        $scope.feeds = [];
        $http({
            method: 'GET',
            url: 'http://query.yahooapis.com/v1/public/yql?q=select title, pubDate, link, creator, description, content:encoded from rss where url="' + $scope.feedLinks[i] + '"&format=json'
        }).then(function succesCallback(response) {
            var objectItems = response.data.query.results.item;
            for (var j = 0; j < objectItems.length; j++) {
                objectItems[j].dateobj = new Date(objectItems[j].pubDate);
                objectItems[j].date = objectItems[j].dateobj.toLocaleDateString();
                
                /* Tries to find image post*/
                var div = document.createElement("div");
                div.innerHTML = objectItems[j].encoded;
                var img = div.querySelectorAll("img")[0];
                
                objectItems[j].imgsrc = img ? img.src : "";
                $scope.feeds.push(objectItems[j]);
            }
        })
    }
    console.log($scope.feeds);
})

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
   
   //Method to sign user up 
   $scope.signUp = function() {
       $scope.authObj.$createUser({
           email: $scope.adminMail,
           password: $scope.adminPass
       });
       $scope.adminClick = false;
   }
    
    //Create and adds events to database
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
            $scope.getEvents($scope.events[$scope.events.length - 1]);
            $scope.eventClick = false;
        });    
    }
    
    //returns correct time
    var correctTime = function(num) {
        if (num <= 8) {
            return num + 16;   
        } else {
            return num - 8;   
        }
    }
    
    //returns correct day
    var correctDay = function(day, hour) {
        if (hour <= 8) {
            return day - 1;   
        } else {
            return day;   
        }
    }
    
    //makes date clickable in calendar to view more info about event
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
    
    //initializes calendar object
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        header:{
          left: 'month agendaWeek',
          center: 'title',
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

    $scope.remove = function(data) {
        $scope.events.$remove(data);
    }

    $scope.removeUpcoming = function(index, data) {    
        $scope.upcomingEvents.splice(index, 1);
        $scope.events.$remove(data);
    }
    
    $scope.removePast = function(index, data) {
        var newIndex = $scope.pastEvents.length - 1 - index
        $scope.pastEvents.splice(newIndex, 1);
        $scope.events.$remove(data);
    }

    $scope.addToCalendar();
    
    //final source of events angular looks for
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
            $scope.name = "";
            $scope.date = "";
            $scope.address = "";
            $scope.zip = "";
            $scope.city = "";
            $scope.state = "";
            $scope.email = "";
            $scope.phone = "";
        });    
    }
    
    $scope.checkMember = function() {
        $scope.emailInUse = false;
        console.log("here")
        $scope.members.forEach(function(data) {
            if (data.email === $scope.email) {
                $scope.emailInUse = true;
            }
        })
        $scope.checkInUse();
    }

    $scope.checkInUse = function() {
        if(!$scope.emailInUse) {
            $scope.addMember();
            $scope.message = "You have successfully registered!"
        }
    }

})

myApp.controller ('navCtrl', function($scope, $location) {
    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
    console.log($scope.isActive);
    console.log($location.path());
})