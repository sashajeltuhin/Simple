function surveyctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    loadQuestions();
    $scope.step = cartservice.currentstep();
    $scope.templateUrl = cartservice.getTemplateURL();
    function loadQuestions(){
        cartservice.loadsurvey($http, function(data){
            $scope.listData = data;
        });
    }

    $scope.toggleAnswer = function(q){
        $scope.c = cartservice.getCustomer();
        if($scope.c[q.value] == undefined || $scope.c[q.value] == false){
            $scope.c[q.value] = true;
            q.yes = true;
        }
        else if ($scope.c[q.value] == true){
            $scope.c[q.value] = false;
            q.yes = false;
        }
        cartservice.updateCustomer();
    }

}

