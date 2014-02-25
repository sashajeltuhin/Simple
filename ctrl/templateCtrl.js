function templateCtrl($scope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var STEP = 'step';
    var caretpos = 0;
    $scope.tenant = adminservice.getTenant().name;


    adminservice.loadMeta(STEP, $http, function(meta){
        //$scope.propsEl = adminservice.buildForm(meta, null, $scope.obj);
        $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
    });

    init();
//    //showHtml();

    function prepareField(metafld){
        var mf = metafld;
        if (metafld.fldname == "script" || metafld.fldname == "controller" || metafld.fldname == "rawhtml" || metafld.fldname == "integration"){
            mf = null;
        }
        return mf;
    }

    function init(){
        $scope.obj.isSurvey = $scope.obj.name == "survey";
        initDraft();
        loadVersions();

    }

    function loadVersions(){
        var stepID = $scope.obj._id;
        adminservice.listObj('draft', {stepID:stepID}, $http, function(data){
            $scope.versions = data;
            $.each($scope.versions, function(i, v){
                var date = new Date(v.changed);
                var time = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                v.changedFormatted = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + ' ' + time;
            })
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
        adminservice.listObj('block', {cat:"input"}, $http, function(ibs){
            $scope.inputblocks = ibs;
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
        var appObj = currentApp();
        $scope.modalTemplPage = serverUrl + 'stepTmpl.html';
        $scope.masterTmpl = appObj.template;
    }

    function currentApp(){
        var appObj;
        var tenObj = adminservice.getTenant();
        $.each(tenObj.appObjects, function(i, a){
            if (a.appID === $scope.obj.app){
                appObj = a;
            }
        });
        return appObj;
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
        adminservice.saveObj($scope.draft, 'draft', $http, function(saved){
            $scope.saveObj();
            initDraft();
            loadVersions();
        });
    }

    $scope.saveObj = function(){
        var n = $scope.obj._id == undefined;
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        adminservice.saveObj($scope.obj, STEP, $http, function(s){
            $scope.obj = s;
            if (n == true){
                var appObj = currentApp();
                $scope.loadCartSteps(appObj);
            }
        });
    }

    $scope.publish = function(){
        if ($scope.draft.time == undefined){
            $scope.draft.time = new Date();
        }
        $scope.draft.changed = new Date();
        $scope.draft.published = new Date();
        $scope.draft.version = $scope.obj.rawhtml;
        adminservice.publishTemplate($scope.draft, $scope.obj, 'draft', $http, function(saved){
            $scope.obj = saved;
            initDraft();
            loadVersions();
        });
    }

    $scope.loadVersion = function(v){
        $scope.draft.version = v.version;
        $scope.obj.rawhtml = v.version;
    }

    $scope.showIntscript = function(){
        $scope.modalTemplPage = serverUrl + 'intScript.html';
    }

    $scope.newBlock = function(){
        var block = {};
        adminservice.setSelObj(block, backToEdit);
        var obj = {};
        obj.view = 'blockDetail.html';
        obj.title = "New UI Element";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function backToEdit(b){

    }


}