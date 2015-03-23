var videoPortalApp = angular.module("videoPortalApp", ['ngRoute', 'AdalAngular'])
	.factory('videosFactory', ['$http', function ($http) {
		var factory = {};

		var baseUrl = "https://junction.sharepoint.com/portals/hub/_api/videoService/";

		factory.getFeaturedVideos = function () {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'spotlightVideos?$top=4&$expand=Video');
		};
		factory.getPopularVideos = function () {

		};
		factory.getChannelVideos = function (channelId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')?$expand=Videos');
		};
		factory.getVideo = function (channelId, videoId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/videos(guid\'' + videoId + '\')');
		};
		factory.getPlaybackUrl = function(channelId, videoId) {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels(guid\'' + channelId + '\')/videos(guid\'' + videoId + '\')/getPlaybackUrl');			
		};

		factory.getChannels = function() {
			$http.defaults.useXDomain = true;
			delete $http.defaults.headers.common['X-Requested-With'];
			return $http.get(baseUrl + 'channels?$top=3&$expand=Videos');
    	};

		return factory;
	}]);

videoPortalApp.config(['$routeProvider', '$httpProvider', 'adalAuthenticationServiceProvider', function ($routeProvider, $httpProvider, adalProvider) {  
	$routeProvider
		.when('/',
			{
				controller: 'HomeController',
				templateUrl: 'partials/home.html',
				requireADLogin: true
			})
		.when('/channels',
			{
				controller: 'ChannelsController',
				templateUrl: 'partials/channels.html'
			})
		.when('/channels/:channelId',
			{
				controller: 'ChannelController',
				templateUrl: 'partials/channel.html'
			})
		.when('/channels/:channelId/videos/:videoId',
			{
				controller: 'VideoController',
				templateUrl: 'partials/video.html'
			})
		.otherwise({redirectTo: '/' });

	adalProvider.init(
		{ 
			tenant: 'junction.onmicrosoft.com', 
			clientId: '5e188fc6-f4ac-40cb-9373-a75d7efa4e1c', 
			extraQueryParameter: 'nux=1', 
			endpoints: {
				"https://junction.sharepoint.com/portals/hub/_api/": "https://junction.sharepoint.com"
			}
			//cacheLocation: 'localStorage', // enable this for IE, as sessionStorage does not work for localhost. 
		}, 
		$httpProvider); 

}]);

videoPortalApp.controller("HomeController", function($scope, videosFactory) {
	videosFactory.getFeaturedVideos().success(function (results) {
		$scope.featuredVideos = results.value;
		console.log("Featured videos returned: " + $scope.featuredVideos.length);
	});
	videosFactory.getChannels().success(function (results) { 
		$scope.channels = results.value; 
		console.log("Channels returned: " + $scope.channels.length);
	});
});

videoPortalApp.controller("ChannelsController", function($scope, videosFactory) {
	$scope.channels = videosFactory.getChannels();
});

videoPortalApp.controller("ChannelController", function($scope, $routeParams, videosFactory) {
	$scope.channelVideos = videosFactory.getChannelVideos($routeParams.channelId);
});

videoPortalApp.controller("VideoController", function($scope, $routeParams, $sce, videosFactory) {
	videosFactory.getPlaybackUrl($routeParams.channelId, $routeParams.videoId).success(function (results) {
		console.log("Playback URL success");
		var splitUrl = results.value.split("&token=");
		var url = encodeURIComponent(splitUrl[0].split("?playbackUrl=")[1]);
		var token = splitUrl[1];
		var videoEmbedUrl = "//aka.ms/azuremediaplayeriframe?url=" + url + "&protection=aes&token=" + token + "&autoplay=false";
		$scope.videoEmbedUrl = $sce.trustAsResourceUrl(videoEmbedUrl);
		console.log("Playback URL returned");
	});
	videosFactory.getVideo($routeParams.channelId, $routeParams.videoId).success(function (results) { 
		$scope.video = results; 
		console.log("Video returned");
	});

});