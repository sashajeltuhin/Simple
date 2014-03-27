function templateCtrl($scope, $http, adminservice){
    var serverUrl = topUrl + adminURL + '/templ/';
    var STEP = 'step';
    var caretpos = 0;
    $scope.tenant = adminservice.getTenant().name;
    $scope.appObj = adminservice.getAppObj();

    refreshDetail();
    init();

    function refreshDetail(){
        adminservice.loadMeta(STEP, $http, function(meta){
            $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
        });
    }
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
        if (stepID !== undefined){
            adminservice.listObj('draft', {stepID:stepID}, $http, function(data){
                $scope.versions = data;
                $.each($scope.versions, function(i, v){
                    var date = new Date(v.changed);
                    var time = date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                    var month = date.getMonth() + 1;
                    v.changedFormatted = date.getDate() + '-' +  month + '-' + date.getFullYear() + ' ' + time;
                })
            });
        }
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
        if (appObj.template !== undefined && $scope.obj.template !== undefined){
            $scope.modalTemplPage = serverUrl + 'stepTmpl.html';
            $scope.masterTmpl = appObj.template;
        }
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

    $scope.saveObj = function(callback){
        var n = $scope.obj._id == undefined;
        adminservice.bindObjData($scope.obj, $scope.fieldList);
        adminservice.saveObj($scope.obj, STEP, $http, function(s){
            console.log("saved step:", s);
            $scope.obj = s;
            if (n == true){
                var appObj = currentApp();
                $scope.loadCartSteps(appObj);
            }
            if (callback !== undefined){
                callback();
            }
        });
    }

    $scope.publish = function(){
        if ($scope.draft.comment !== undefined && $scope.draft.comment !== ''){
            if ($scope.draft.time == undefined){
                $scope.draft.time = new Date();
            }
            $scope.draft.changed = new Date();
            $scope.draft.published = new Date();
            $scope.draft.version = $scope.obj.rawhtml;
            adminservice.publishTemplate($scope.draft, $scope.obj, 'draft', $http, function(saved){
                console.log("published step:", saved);
                $scope.obj = saved;
                console.log('published and saved:', $scope.obj);
                refreshDetail();
                initDraft();
                loadVersions();
            });
        }
    }

    $scope.loadVersion = function(v){
        $scope.draft.version = v.version;
        $scope.obj.rawhtml = v.version;
    }

    function getDummyProv(){
        var dummy = {};
        dummy._id = 0;
        dummy.label = 'Drag from the list on the right';
        return dummy;
    }

    $scope.loadFields = function(){
        $scope.existingFields = [];
        if ($scope.obj.fields== undefined){
            $scope.obj.fields = [];
            $scope.myfields = [];
            $scope.myfields.push(getDummyProv());
        }
        else{
            var filter = {};
            var flds = {};
            flds.oper = 'in';
            flds.val = $scope.obj.fields;
            filter._id = flds;

            adminservice.listObj('fields', filter, $http, function(data){
                $scope.myfields = data;
                if ($scope.myfields.length == 0){
                    $scope.myfields.push(getDummyProv());
                }
            });
        }
        var f = {};
        if ($scope.obj.fields.length > 0){
            var fv = {};
            fv.oper = '<>';
            fv.val = $scope.obj.fields;
            f._id = fv;
        }
        adminservice.loadMetaCustom('consumer', $http, function(data){
            $.each(data, function(i, t){
                var item = {};
                item._id = t._id;
                item.name = t.fldname;
                item.desc = t.label;
                $scope.existingFields.push(item);
            });
        }, f);
    }

    $scope.onAddField = function(list){
        $.each(list, function(i, item){
            if (item['$scope'].a !== undefined && item['$scope'].a._id !== 0){
                var fid = item['$scope'].a._id;
                if (fid !== undefined){
                    $scope.obj.fields.push(fid);
                    $scope.saveObj(function(){
                        $scope.loadFields();
                    });
                }
            }
        });
    }

    $scope.removeField = function(f){
        var ind = $scope.obj.fields.indexOf(f._id);
        $scope.obj.fields.splice(ind, 1);
        $scope.saveObj(function(){
            $scope.loadFields();
        });

    }

    $scope.removeVersion = function(v){
        adminservice.deleteObj(v, 'draft', $http, function(){
            loadVersions();
        });
    }

    $scope.showIntscript = function(){
        $scope.modalTemplPage = serverUrl + 'intScript.html';
    }

    $scope.newBlock = function(){
        var block = {};
        adminservice.setSelObj(block);
        var obj = {};
        obj.view = 'blockDetail.html';
        obj.title = "New UI Element";
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

   $scope.showTrackTags = function(){

   }

    $scope.openRules = function(){
        var p = {};
        p.adRule = false;
        p.stepID = $scope.obj._id;
        adminservice.setRuleParams(p);
        $scope.stepRuleTemplate = serverUrl + "templsegrules.html"
    }

    $scope.openValidation = function(){
        $scope.stepRuleTemplate = serverUrl + "templvalrules.html"
    }

    $scope.openNextRules = function(){
        $scope.stepRuleTemplate = serverUrl + "templnextrules.html"
    }
}