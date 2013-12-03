function surveyctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    loadQuestions();
    $scope.templateUrl = cartservice.getTemplateURL();
    function loadQuestions(){
        cartservice.loadsurvey($http, function(data){
            $scope.listData = data;
        });
    }

}

