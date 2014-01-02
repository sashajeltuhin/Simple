function surveyctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    loadQuestions();
    $scope.step = cartservice.currentstep();
    $scope.templateUrl = cartservice.getTemplateURL();
    $scope.quecats = [];
    $scope.queindex = 0;
    $scope.quepath = [];
    function loadQuestions(){
        cartservice.loadsurvey($http, function(data){
            $scope.listData = data;
            //set current que
            if ($scope.listData.length > 0){
                showsurveyQue($scope.listData[0]);
            }
            //init cats
            $.each($scope.listData, function (i, q){
                if ($scope.quecats.indexOf(q.cat) < 0){
                    $scope.quecats.push(q.cat);
                }
            })
        });
    }

    $scope.showsurveyQue = function(q){
        $scope.currentQue.class = "";
        assignCurrent(q);
        $scope.currentQue.class = "active";
        $scope.queTemplate = $scope.currentQue.templateUrl;
    }

    $scope.nextque = function(){
        $.each($scope.currentQue.responses, function(i, r){
            if (r.selected && r.link){
                showsurveyQue(r.link);
                return;
            }
        });
        if ($scope.queindex < $scope.listData.length -1){
            $scope.queindex++;
            showsurveyQue($scope.listData[$scope.queindex]);
        }
    }

    function assignCurrent(q){
        $scope.currentQue = q;
        $scope.quepath.push(q);
    }

    $scope.prevque = function(){
        if ($scope.quepath.length > 0){
            var ind = $scope.quepath.length - 1;
            var cq = $scope.quepath[ind];
            if (cq.parentID == undefined){
                $scope.queindex--;
            }
            $scope.quepath.splice(ind, 1);
            showsurveyQue(cq);
        }
    }

    $scope.answer = function(r){
        $scope.c = cartservice.getCustomer();
        r.selected = r.selected == undefined || r.selected == false ? true : false;
        var quetype = $scope.selque.type;
        if (quetype == "multiple"){
            if ($scope.c[$scope.selque.value] == undefined){
                $scope.c[$scope.selque.value] = [];
            }
            if (r.selected){
                $scope.c[$scope.selque.value].push(r.value);
            }
            else{
                $scope.c[$scope.selque.value].pop(r.value);
            }

        }
        else if (quetype == "bool"){
            updateBool($scope.selque, r);
        }
        cartservice.updateCustomer();
    }

    $scope.toggleAnswer = function(q){
        $scope.c = cartservice.getCustomer();
        updateBool(q);
        cartservice.updateCustomer();
    }

    function updateBool(q, r){
        if (r !== undefined){
            $scope.c[q.value] = r.value;
        }
        else{
            if($scope.c[q.value] == undefined || $scope.c[q.value] == false){
                $scope.c[q.value] = true;
                q.yes = true;
            }
            else if ($scope.c[q.value] == true){
                $scope.c[q.value] = false;
                q.yes = false;
            }
        }
    }
}

