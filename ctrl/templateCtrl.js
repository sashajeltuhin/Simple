function templateCtrl($scope, $rootScope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    adminservice.loadMeta('step', $http, function(meta){
        $scope.propsEl = adminservice.buildForm(meta, null, $scope.obj);
    });
    //showHtml();

    function init(){
        var stepID = $scope.obj._id;
        adminservice.listObj('draft', {stepID:stepID}, $http, function(data){
            $scope.versions = data;
        });
    }

    function showHtml(){
        adminservice.listObj('block', {cat:"action"}, $http, function(abs){
            $scope.actionblocks = abs;
        });
        adminservice.listObj('block', {cat:"data"}, $http, function(dbs){
            $scope.datablocks = dbs;
        });
        $scope.modalTemplPage = serverUrl + 'rawHtml.html';
    }
    $scope.openUpload = function(){
        $scope.modalTemplPage = serverUrl + 'uploadTmpl.html';
    }

    $scope.showRaw = function(){
        showHtml();
    }

    $scope.insertBlock = function(b){

    }

    $scope.tmplkeydown = function(event){
        if (event.metaKey || event.ctrlKey){
            if (event.which == 73){ //i
                console.log('keydown ctrl - i', event);
                if (event.position !== undefined){
                    $scope.obj.rawhtml =
                        [$scope.obj.rawhtml.slice(0, event.position), '^^^', $scope.obj.rawhtml.slice(event.position)].join('');
                }
            }
        }
    }

    $scope.showTemplate = function(){
        var appObj;
        var tenObj = adminservice.getTenant();
        $.each(tenObj.appObjects, function(i, a){
            if (a.appID === $scope.obj.app){
                appObj = a;
            }
        });
        $scope.modalTemplPage = serverUrl + 'stepTmpl.html';
        $scope.masterTmpl = appObj.template;
    }

    $scope.onTmplUploaded = function(fi){
        console.log(fi);

    }

    $scope.saveDraft = function(){

    }

    $scope.publishDraft = function(){

    }

    $scope.showIntscript = function(){
        $scope.modalTemplPage = serverUrl + 'intScript.html';
    }
}