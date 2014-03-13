function rulectrl($scope, $rootScope, $http, adminservice, mkPopup){
    var RULE = "rule";
    var SEG = "segment";
    var prodMeta = [];
    var type = 'teas';
    var params = adminservice.getRuleParams();
    $scope.adRule = true;
    if (params !== undefined && params !== null){
        $scope.adRule = params.adRule;
        $scope.selRule = params.selRule;
    }
    init();
    refreshRules();

    function init(){

        adminservice.listObj("fields", {objname:"product", order_by:{"title":1}}, $http, function(meta){
            prodMeta = meta;
        });
    }

    $scope.$on("EV_SAVE_CHANGES", function(event){
        $.each($scope.ruleData, function(i, item){
            item.order = i + 1;
            adminservice.saveObj(item, RULE, $http, function(fld){
                if (i == $scope.ruleData.length -1){
                    mkPopup(
                        {
                            template: '<div>Complete success</div>',
                            title: 'Confirmation',
                            scope: $scope,
                            backdrop: false,
                            success: {label: 'OK'}
                        });

                }

            });
        });
    });

    $scope.showDetail = function(rule){
        rule.showDetail = rule.showDetail == undefined || rule.showDetail == false ? true : false;
    }


    function loadRules(){
        $scope.viewTitle = "Rules for Targeted Recommendations";
        $scope.ruletypeUrl = '/images/targetad.jpg';

        $scope.adRule = true;
        $scope.surveyRule = false;
        var extra = {};
        var appObj = adminservice.getAppObj();
        extra.app = appObj.appID;
        extra.type = 'teas';
        extra.order_by = {order:1};
        adminservice.listObj(RULE, extra, $http, function(meta){
            $scope.ruleData = meta;
        });
    }

    function loadQualRules(){
        $scope.viewTitle = "Rules for Targeted Offers";
        $scope.ruletypeUrl = '/images/targetlist.gif';
        $scope.adRule = false;
        $scope.surveyRule = false;
        var extra = {};
        var appObj = adminservice.getAppObj();
        extra.app = appObj.appID;
        extra.type = 'qual';
        extra.order_by = {order:1};
        adminservice.listObj(RULE, extra, $http, function(meta){
            $scope.ruleData = meta;
        });
    }

    function loadSurveyRules(){
        $scope.viewTitle = "Rules for Targeted Dialogs";
        $scope.ruletypeUrl = '/images/targetlist.gif';
        $scope.adRule = false;
        $scope.surveyRule = true;
        var extra = {};
        var appObj = adminservice.getAppObj();
        extra.app = appObj.appID;
        extra.type = 'survey';
        extra.order_by = {order:1};
        adminservice.listObj(RULE, extra, $http, function(meta){
            $scope.ruleData = meta;
        });
    }

    function refreshRules(){
        if ($scope.adRule){
            loadRules();
        }
        else{
            loadQualRules();
        }

        adminservice.setRuleParams(null);
    }

    $scope.loadTeasRules = function(){
        loadRules();
    }

    $scope.loadQualRules = function(){
        loadQualRules();
    }

    $scope.loadSurveyRules = function(){
        loadSurveyRules();
    }

    $scope.deleteRule = function(rule){
        adminservice.deleteObj(rule, RULE, $http, function(){
            var ind = $scope.ruleData.indexOf(rule);
            $scope.ruleData.splice(ind, 1);
        } );
    }

    $scope.cloneRule = function(rule){
        var newRule = {};
        for(var key in rule){
            if (key !== '_id'){
                newRule[key] = rule[key];
            }
        }
        adminservice.editObj(newRule.name, newRule, RULE, mkPopup, $scope, $http, function(){
            refreshRules();
        });
    }

    $scope.editRule = function(rule){
        adminservice.editObj(rule.name, rule, RULE, mkPopup, $scope, $http, function(){
            adminservice.saveObj($scope.obj, RULE, $http, function(){
            });
        });
    }

    $scope.createRule = function(){
        adminservice.createObj('New Rule', {}, RULE, mkPopup, $scope, $http, function(){
            adminservice.saveObj($scope.obj, RULE, $http, function(){
                refreshRules();
            });
        });
    }

    function updateProdFieldList(metafld, exp){

        if (exp.obj == "product" && metafld.fldname == "field"){
            return prodMeta;
        }
        return null;
    }

    $scope.newObj = function(){
        var appObj = adminservice.getAppObj();
        var rule = {};
        rule.app = appObj.appID;
        rule.type = $scope.adRule == true ? 'teas' : 'qual';
        if ($scope.surveyRule == true){
            rule.type = "survey";
        }
        rule.limit = 2;
        rule.name = "New Rule";
        $scope.ruleData.push(rule);
    }


    $scope.createSegment = function(rule){
        $scope.selrule = rule;
        var cond = {};
        cond.app = rule.app;
        cond.obj = 'consumer';
        adminservice.setSelObj(cond, addSegment);
        var obj = {};
        obj.view = 'ruleDetail.html';
        obj.title = "New Demographic Segment";
        obj.toolbar = 'ruleTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function addSegment(seg){
        if ($scope.selrule.dems == undefined){
            $scope.selrule.dems = [];
        }
        $scope.selrule.dems.push(seg);
        afterSegEdit();
    }

    $scope.createProdRule = function(rule){
        $scope.selrule = rule;
        var cond = {};
        cond.app = rule.app;
        cond.obj = $scope.surveyRule == true? 'survey':'product';
        adminservice.setSelObj(cond, addProdGroup);
        var obj = {};
        obj.view = 'ruleDetail.html';
        obj.title = "New Product Group";
        obj.toolbar = 'ruleTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function addProdGroup(seg){
        if ($scope.selrule.conds == undefined){
            $scope.selrule.conds = [];
        }
        $scope.selrule.conds.push(seg);
        afterSegEdit();

    }

    function saveRule(rule, callback){
        adminservice.saveObj(rule, RULE, $http, function(){
            if (callback !== undefined){
                callback();
            }
        });
    }


    $scope.editSegment = function(seg, rule){
        $scope.selrule = rule;
        adminservice.setSelObj(seg, afterSegEdit);
        var obj = {};
        obj.view = 'ruleDetail.html';
        obj.title = seg.title;
        obj.toolbar = 'ruleTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    $scope.editProdRule = function(seg, rule){
        $scope.selrule = rule;
        adminservice.setSelObj(seg, afterSegEdit);
        var obj = {};
        obj.view = 'ruleDetail.html';
        obj.title = seg.title;
        obj.toolbar = 'ruleTools.html';
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function afterSegEdit(){
        var p = {};
        p.adRule = $scope.adRule;
        p.selRule = $scope.selrule;
        adminservice.setRuleParams(p);
        saveRule($scope.selrule, function(){
            $scope.loadSegments();
        });

    }

    $scope.deleteSegment = function(rule, seg){
        var ind = rule.dems.indexOf(seg);
        rule.dems.splice(ind, 1);
        adminservice.saveObj(rule, RULE, $http, function(){
        });
    }

    $scope.deleteProdRule = function(rule, seg){
        var ind = rule.conds.indexOf(seg);
        rule.conds.splice(ind, 1);
        adminservice.saveObj(rule, RULE, $http, function(){
        });
    }

}
