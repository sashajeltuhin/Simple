function consumerctrl($scope, $http, cartservice, adminservice){

    $scope.w = adminservice.giveMeWidget('consumerctrl');
    $scope.c = cartservice.getCustomer();
    loadConsumerInfoFields();

    function loadConsumerInfoFields(){
        var filter = {}; // fields associated with the widget
        var fv = {};
        fv.oper = "in";
        fv.val = $scope.w.fields;
        filter._id = fv;
        adminservice.listObj('fields', filter, $http, function(meta){
            $scope.meta = meta;
            updateConsumerInfo();
        });
    }

    function updateConsumerInfo(){
        $scope.consFields = adminservice.bindObj($scope.meta, $scope.c, prepareField);
    }

    function prepareField(metafld){
        var mf = metafld;

        return mf;
    }

    $scope.onfldChange = function(fd){
        adminservice.bindObjData($scope.c, $scope.consFields);
        console.log('consumer field changed', $scope.c)
        $scope.$emit("EV_CONSUMER_UPDATED", $scope.c);
    }

    $scope.$on("EV_CONSUMER_CHANGED", function(event, obj){
        console.log('EV_CONSUMER_CHANGED called', obj);
        $scope.c = obj;
        updateConsumerInfo();
    });

    $scope.searchMeta = function(){
        reloadOtherFields();
    }

    function reloadOtherFields(){
        if ($scope.metafind !== undefined && $scope.metafind !== ''){
            var filter = {label:$scope.metafind + "*"};
            adminservice.loadMetaCustom('consumer', $http, function(meta){
                updateConsumer(meta);
            }, filter);
        }
    }
    function updateConsumer(meta){
        $scope.fieldList = adminservice.bindObj(meta, $scope.c, prepareField);
    }

}