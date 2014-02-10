function surveyAdminCtrl($scope, $rootScope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var imgUrl = '/tmp/images/';
    var QUE = "survey";
    var ANSWER = "response";
    $scope.customField = 'Existing';

    init();

    function init(){
        loadCustAtts();
        adminservice.loadMeta(QUE, $http, function(meta){
            $scope.quetypes = meta[1].opts;
            openqueMap();
        });
    }

    function loadCustAtts(){
        var tenObj = adminservice.getTenant();
        adminservice.listObj('fields', {custom:true, tenant: tenObj.name}, $http, function(cust){
            $scope.customAtts = cust;
        });
    }


    $scope.editQue = function(que, parentLink, parent){
        $scope.selque = que;
        $scope.linkedAnswer = parentLink;
        $scope.parent = parent;
        $scope.queTitle = parent !== undefined && parent !== null ? parent.label + ' --> ' + $scope.selque.label : $scope.selque.label;
        var tenObj = adminservice.getTenant();
        $scope.selque = que;
        adminservice.listObj('fields', {fldname: que.value, custom:true, tenant: tenObj.name}, $http, function(cust){
            $scope.ca = cust[0];
            if ($scope.ca.fldtype.replace(/\W/g, '') == 'bool'){
                $scope.ca.fldopts = [];
                $scope.ca.fldopts.push(false);
                $scope.ca.fldopts.push(true);
            }

        });
        $scope.queTitle = "Edit Properties";
        $scope.modalSurveyPage = serverUrl + 'questionProps.html';
        $scope.subTools = serverUrl + 'queTools.html';
    }

    $scope.backtoParent = function(){
        $scope.editQue($scope.parent);
        $scope.linkedAnswer = null;
        $scope.parent = null;
    }

    $scope.editLinkedQue = function(a){
        $scope.editQue(a.link, a, $scope.selque);
    }

    $scope.removeLinkedQue = function(a){
        delete a.link;
        $scope.saveSurvey();
    }


    $scope.newQuestion = function(linkedAnswer, parent){
        var appObj = adminservice.getAppObj();
        var def = {};
        def.label = "New question";
        def.app = appObj.appID;
        $scope.ca = {};

        adminservice.loadMeta(QUE, $http, function(meta){
            $scope.selque = adminservice.buildobj(meta, def);
            $scope.selque.imageUrl = "/images/qmark.jpg";
            $scope.parent = parent;
            $scope.linkedAnswer = linkedAnswer;
            $scope.queTitle = parent !== undefined ? parent.label + ' --> ' + $scope.selque.label : $scope.selque.label;
        });
        $scope.modalSurveyPage = serverUrl + 'questionProps.html';
    }

    $scope.deleteQue = function(que){
        adminservice.deleteObj(que, QUE, $http, function(){
            $.each($scope.queMap, function(i, q){
               if (que._id == q._id){
                   $scope.queMap.splice(i, 1);
                   return;
               }
            });
        });
    }

    $scope.deleteSelField = function(){
        adminservice.deleteObj($scope.ca, 'fields', $http, function(){
            $scope.ca = null;
            $scope.selque.responses = [];
        });
    }
    $scope.saveSurvey = function(callback){
        var newobj = $scope.selque._id == undefined;
        //save custom field
        if ($scope.ca._id == undefined){
            console.log("save field called");
            var tenObj = adminservice.getTenant();
            $scope.ca.fldname = $scope.ca.label.replace(/ /g,"_").toLowerCase();
            $scope.selque.value = $scope.ca.fldname;
            $scope.ca.tenant = tenObj.name;
            $scope.ca.fldtype = "longtext";
            $scope.ca.objname = "consumer";
            $scope.ca.reportable = true;
            $scope.ca.editable = true;
            $scope.ca.visible = true;
            $scope.ca.custom = true;
            $scope.ca.fldopts = [];
            $.each($scope.selque.responses, function(i, r){
                $scope.ca.fldopts.push(r.value);
            });
            adminservice.saveObj($scope.ca, "fields", $http, function(f){
                console.log('saved field', f);
                loadCustAtts();
            });
        }
        //check for new options
        var newopts = 0;
        $.each($scope.selque.responses, function(i, r){
            r.order = i + 1;
            if (r.fresh == true && $scope.ca.fldopts !== undefined && $scope.ca.fldopts.indexOf(r.value) < 0){
                $scope.ca.fldopts.push(r.value);
                newopts++;
            }
            delete r.fresh;
        });

        var ft = $scope.ca.fldtype.replace(/\W/g, '');

        if ($scope.selque._id == undefined){
            $scope.selque.type = ft == "bool" ? "bool" : "multiple";
        }

        if (newopts > 0){
            adminservice.saveObj($scope.ca, "fields", $http, function(f){
                console.log('saved field', f);
            });
        }

        //save parent survey if passed
        if ($scope.parent !== undefined && $scope.parent !== null){
            $scope.selque.parentID = $scope.parent._id;
            $scope.linkedAnswer.link = $scope.selque;
            adminservice.saveObj($scope.parent, QUE, $http, function(p){

                if (newobj == true){
                    $scope.editQue($scope.selque);
                }
            });
        }
        else{
            //save main survey
            adminservice.saveObj($scope.selque, QUE, $http, function(s){
                $scope.selque = s;

                if (callback){
                    callback(s);
                }

                if (newobj == true){
                    $scope.editQue($scope.selque);
                }
            });
        }
    }

    $scope.surveyMap = function(){
        openqueMap();
    }

    function openqueMap(){
        $scope.linkedAnswer = null;
        $scope.parent = null;
        var appObj = adminservice.getAppObj(appObj);
        adminservice.listObj(QUE, {app:appObj.appID, order_by:{order:1}}, $http, function(d){
            $scope.queMap = [];
            for(var i = 0; i < d.length; i++){
                $scope.queMap.push(d[i]);
                for(var r = 0; r < d[i].responses.length; r++){
                    if (d[i].responses[r].link !== undefined){
                        $scope.queMap.push(d[i].responses[r].link);
                    }
                }
            }
            //$scope.queMap = d;
        });
        $scope.modalSurveyPage = serverUrl + 'survey.html';
    }

    $scope.saveMap = function(){
        $.each($scope.queMap, function(i, q){
            q.order = i + 1;
            adminservice.saveObj(q, QUE, $http, function(p){
            });
        });
    }

    $scope.onFieldChange = function(){
        var tenObj = adminservice.getTenant();
        $scope.selque.responses = [];
        adminservice.listObj('fields', {fldname: $scope.selque.value, tenant: tenObj.name}, $http, function(cust){
            $scope.ca = cust[0];
            if ($scope.ca.fldtype.replace(/\W/g, '') == 'bool'){
                $scope.ca.fldopts = [];
                $scope.ca.fldopts.push(false);
                $scope.ca.fldopts.push(true);
                //true
                var resp= {};
                createAnswer(resp, true);
                //false
                var respF= {};
                createAnswer(respF, false);
            }
            else{
            $.each($scope.ca.fldopts, function(i, fo){
                var resp= {};
                createAnswer(resp, fo);

            });
            }
        });
    }

    function createAnswer(resp, val){
        resp.value = val;
        $scope.selque.responses.push(resp);
        resp.order = $scope.selque.responses.length;
        resp.imageUrl = "/images/answer.gif";
    }

    $scope.newAnswer = function(que){
        adminservice.loadMeta(ANSWER, $http, function(meta){
            var resp= adminservice.buildobj(meta);
            if (que.responses == undefined){
                que.responses = [];
            }
            createAnswer(resp);
            resp.fresh = true;
        });
    }

    $scope.deleteAnswer = function(a, que){
        for (var i = 0; i < que.responses.length; i++){
            if (que.responses[i].order == a.order){
                que.responses.splice(i, 1);
            }
        }
    }

    $scope.newLinkedQue = function(answer, parent){
        $scope.newQuestion(answer, parent);
    }

    $scope.onQueImgUploaded = function(event){
        var fn = event.name;
        $scope.selque.imageUrl = imgUrl + fn;
    }

    $scope.onAnswerImgUploaded = function(event, a){
        var fn = event.name;
        a.imageUrl = imgUrl + fn;
        console.log("a", a);
    }
}