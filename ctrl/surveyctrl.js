function surveyctrl($scope, $rootScope, $http, $location, cartservice){
    $scope.topUrl = topUrl;
    loadQuestions();
    $scope.step = cartservice.currentstep();
    $scope.templateUrl = cartservice.getTemplateURL();
    $scope.quecats = [];
    $scope.quecatsNames = [];
    $scope.queindex = 0;
    $scope.quepath = [];
    function loadQuestions(){
        cartservice.loadsurvey($http, function(data){
            $scope.listData = data;
            //set current que
            if ($scope.listData.length > 0){
                $scope.showsurveyQue($scope.listData[0]);
            }
            //init cats
            $.each($scope.listData, function (i, q){

                if ($scope.quecatsNames.indexOf(q.cat) < 0){
                    $scope.quecatsNames.push(q.cat);
                    var c = {};
                    c.name = q.cat;
                    c.class = "";
                    $scope.quecats.push(c);
                }
            })
        });
    }

    $scope.showsurveyQue = function(q){
        assignCurrent(q);
        $scope.queTemplate = $scope.currentQue.templateUrl;
    }

    $scope.nextque = function(){
        $.each($scope.currentQue.responses, function(i, r){
            if (r.selected && r.link){
                $scope.showsurveyQue(r.link);
                return;
            }
        });
        if ($scope.queindex < $scope.listData.length -1){
            $scope.queindex++;
            $scope.showsurveyQue($scope.listData[$scope.queindex]);
        }
        else{
            $scope.next();
        }
    }

    function assignCurrent(q){
        $scope.currentQue = q;
        $scope.quepath.push(q);
        $.each($scope.quecats, function(i, c){
           if (c.name == $scope.currentQue.cat) {
               c.class = "active";
           }
            else{
               c.class = "";
           }
        });
        var rescount = $scope.currentQue.responses.length;
        $.each($scope.currentQue.responses, function(x, r){
            if (rescount == 2 && x == 0){
                r.selected = true;
            }
            else{
                r.selected = false;
            }
        });
    }

    $scope.prevque = function(){
        if ($scope.quepath.length > 0){
            var ind = $scope.quepath.length - 1;
            var cq = $scope.quepath[ind];
            if (cq.parentID == undefined){
                $scope.queindex--;
            }
            $scope.quepath.splice(ind, 1);
            $scope.showsurveyQue(cq);
        }
    }

    $scope.answer = function(r){
        $scope.c = cartservice.getCustomer();
        //r.selected = r.selected == undefined || r.selected == false ? true : false;
        var quetype = $scope.currentQue.type;
        if (quetype == "multiple"){
            if ($scope.c[$scope.currentQue.value] == undefined){
                $scope.c[$scope.currentQue.value] = [];
            }
            if (r.selected){
                $scope.c[$scope.currentQue.value].push(r.value);
            }
            else{
                for (var i = $scope.c[$scope.currentQue.value].length - 1; i >= 0; i--){
                        var v = $scope.c[$scope.currentQue.value][i];
                        if (v == r.value){
                            $scope.c[$scope.currentQue.value].splice(i, 1);
                        }
                    }
            }
        }
        else if (quetype == "bool"){
            updateBool($scope.currentQue, r);
        }
        cartservice.updateCustomer();
        console.log("updated custom values:", $scope.c);
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

