function rulectrl($scope, $rootScope, $http, adminservice, mkPopup){
    var RULE = "rule";
    var SEG = "segment";
    var prodMeta = [];
    var type = 'teas';
    init();
    loadRules();

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
        var extra = {};
        var appObj = adminservice.getAppObj();
        extra.app = appObj.appID;
        extra.type = 'teas';
        extra.order_by = {order:1};
        adminservice.listObj(RULE, extra, $http, function(meta){
            $scope.ruleData = meta;
        });
    }

    function refreshRules(){
        if ($scope.adRule){
            $scope.loadRules();
        }
        else{
            $scope.loadQualRules();
        }
    }

    $scope.loadTeasRules = function(){
        loadRules();
    }

    $scope.loadQualRules = function(){
        $scope.viewTitle = "Rules for Targeted Offers";
        $scope.ruletypeUrl = '/images/targetlist.gif';
        $scope.adRule = false;
        var extra = {};
        var appObj = adminservice.getAppObj();
        extra.app = appObj.appID;
        extra.type = 'qual';
        extra.order_by = {order:1};
        adminservice.listObj(RULE, extra, $http, function(meta){
            $scope.ruleData = meta;
        });
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

    $scope.createSegment = function(rule){
        if (rule.dems == undefined){
            rule.dems = [];
        }
        var exp = {};
        exp.obj = "consumer";
        adminservice.createObj('New Demographic Segment', exp, SEG, mkPopup, $scope, $http, function(){
            rule.dems.push($scope.obj);
            adminservice.saveObj(rule, RULE, $http, function(){
            });
        });
    }

    $scope.createProdRule = function(rule){
        if (rule.conds == undefined){
            rule.conds = [];
        }
        var exp = {};
        exp.obj = "product";
        adminservice.createObj('New Product Condition', exp, SEG, mkPopup, $scope, $http,  function(){
            rule.conds.push($scope.obj);
            adminservice.saveObj(rule, RULE, $http, function(){
            });
        },updateProdFieldList);
    }

    $scope.editSegment = function(seg, rule){
        adminservice.editObj(seg.title, seg, SEG, mkPopup, $scope, $http, function(){
            adminservice.saveObj(rule, RULE, $http, function(){
            });
        });
    }

    $scope.editProdRule = function(seg, rule){
        adminservice.editObj(seg.title, seg, SEG, mkPopup, $scope, $http, function(){
            adminservice.saveObj(rule, RULE, $http, function(){
            });
        },updateProdFieldList);
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
