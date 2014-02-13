function templateCtrl($scope, $rootScope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var STEP = 'step';
    var caretpos = 0;


    adminservice.loadMeta(STEP, $http, function(meta){
        $scope.propsEl = adminservice.buildForm(meta, null, $scope.obj);
    });

    init();
//    //showHtml();

    function init(){
        var stepID = $scope.obj._id;
        initDraft();
        adminservice.listObj('draft', {stepID:stepID}, $http, function(data){
            $scope.versions = data;
        });
    }
    function initDraft(){
        $scope.draft = {};
        $scope.draft.stepID = $scope.obj._id;
        $scope.draft.type = $scope.obj.name;
        $scope.draft.app = $scope.obj.app;
        $scope.draft.tenant = adminservice.getTenant();
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
        insertText(b.template, caretpos);
    }

    function insertText(text, position){
        if (position !== undefined){
            if ($scope.obj.rawhtml == undefined){
                $scope.obj.rawhtml = "";
            }
            $scope.obj.rawhtml =
                [$scope.obj.rawhtml.slice(0, position), text, $scope.obj.rawhtml.slice(position)].join('');
        }
    }

    $scope.tmplkeydown = function(event){
        caretpos = event.position + 1;
        if (event.metaKey || event.ctrlKey){
            if (event.which == 73){ //i
                console.log('keydown ctrl - i', event);
                insertText('^^^', caretpos);
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
        if ($scope.draft.time == undefined){
            $scope.draft.time = new Date();
        }
        $scope.draft.changed = new Date();
        $scope.draft.version = $scope.obj.rawhtml;
        adminservice.saveObj($scope.draft, 'draft', $http, function(){
            $scope.saveObj();
            initDraft();
        });
    }

    $scope.saveObj = function(){
        adminservice.saveObj($scope.obj, STEP, $http, function(s){
            $scope.loadCartSteps();
        });
    }

    $scope.publish = function(){
        if ($scope.draft.time == undefined){
            $scope.draft.time = new Date();
        }
        $scope.draft.changed = new Date();
        $scope.draft.published = new Date();
        $scope.draft.version = $scope.obj.rawhtml;
        adminservice.saveObj($scope.draft, 'draft', $http, function(){
            $scope.saveObj();
            initDraft();
        });
    }

    $scope.loadVersion = function(v){
        $scope.draft.version = v.version;
        $scope.obj.rawhtml = v.version;
    }

    $scope.showIntscript = function(){
        $scope.modalTemplPage = serverUrl + 'intScript.html';
    }
}