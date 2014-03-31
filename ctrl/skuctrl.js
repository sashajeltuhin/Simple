function skuctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    var OBJ = 'product';
    $scope.selProduct = adminservice.getSelObj();


    adminservice.loadMeta(OBJ, $http, function(meta){
        $scope.obj = $scope.selProduct;
        $scope.fieldList = adminservice.bindObj(meta, $scope.obj, prepareField);
    });


    function prepareField(metafld){
        var mf = metafld;
//        if (metafld.fldname !== 'name' && metafld.fldname !== 'parentID' && metafld.fldname !== 'logo'){
//            mf = null;
//        }
//        if (metafld.fldname == "parentID"){
//            mf.opts = parentTenants;
//        }
        return mf;
    }


    function getDummyProv(){
        var dummy = {};
        dummy._id = 0;
        dummy.name = 'Drag from the available list on the right';
        return dummy;
    }


    $scope.onChangeImage = function(event){
        var url = event.url.replace(topUrl, "");
        $scope.selProduct.logo = url;
        saveProduct();
    }


    $scope.loadBundles = function(){
        loadBundles();
    }

    function loadBundles(){
        $scope.availableSection = 'Products';
        $scope.existingList = [];

        if ($scope.selProduct.bundles == undefined){
            $scope.selProduct.bundles = [];
        }

        if ($scope.selProduct.bundles.length == 0){
            $scope.selProduct.bundles.push(getDummyProv());
        }


        var ids = [];
        $.each($scope.selProduct.bundles, function(i, p){
            ids.push(p._id);
        });
        var f = {};
        f.type = "content";

        if (ids.length > 0){
            var fv = {};
            fv.oper = '<>';
            fv.val = ids;
            f._id = fv;
        }

        adminservice.listObj('product', f, $http, function(data){
            $.each(data, function(i, t){
                var item = {};
                item._id = t._id;
                item.name = t.title;
                item.imageUrl = t.prodimgUrl;
                $scope.existingList.push(item);
            });
        });
    }

    $scope.onAddToBundle = function(list){
        for(var i = 0; i < list.length; i++){
            var item = list[i];
            console.log('adding to bundle', item);
            if (item['$scope'].i !== undefined){
                $scope.selProduct.bundles.push(item['$scope'].i);
            }
        }
        for (var b = $scope.selProduct.bundles.length - 1; b >=0; b--){
            var bun = $scope.selProduct.bundles[b];
            if (bun._id == 0){
                $scope.selProduct.bundles.splice(b, 1);
            }
        }
        saveProduct(function(){
            loadBundles();
        });
    }

    $scope.removeFromBundle = function(t){
        for(var i = $scope.selProduct.bundles.length - 1; i >=0; i--){
            if (t._id == $scope.selProduct.bundles[i]._id){
                $scope.selProduct.bundles.splice(i, 1);
            }
        }
        saveProduct(function(){
            $scope.loadBundles();
        });
    }

    $scope.manageBundle = function(p){
        adminservice.setSelObj(p);
        var obj = {};
        obj.view = 'productDetail.html';
        obj.title = p.title;
        $scope.$emit("EV_SWITCH_VIEW", obj);
    }

    function saveProduct(callback){
        adminservice.saveObj($scope.selProduct, 'product', $http, function(saved){
            $scope.selProduct = saved;
            if (callback !== undefined){
                callback();
            }
        });
    }

    $scope.saveNewObj = function(){

        adminservice.saveObj($scope.selProduct, 'tenant', $http, function(saved){
            var u = adminservice.getSelUser();
            u.tenants.push(saved);
            $scope.editTenant(saved);
        });
    }

    $scope.saveObj = function(){
        saveProduct();
    }

    $scope.loadFees = function(){
        if ($scope.selProduct.fees == undefined){
            $scope.selProduct.fees = [];
        }

        $scope.newFee = {};
    }

    $scope.saveFee= function(f){
        saveProduct(function(){
            $scope.loadFees();
        });
    }

    $scope.addFee = function(){
        $scope.selProduct.fees.push($scope.newFee);
        saveProduct(function(){
            $scope.loadFees();
        });
    }

    $scope.removeFee = function(f){
        for(var i = $scope.selProduct.fees.length - 1; i >=0; i--){
            if (f.title == $scope.selProduct.fees[i].title){
                $scope.selProduct.fees.splice(i, 1);
            }
        }
        saveProduct(function(){
            $scope.loadFees();
        });
    }

    $scope.loadRebates = function(){
        if ($scope.selProduct.rebates == undefined){
            $scope.selProduct.rebates = [];
        }

        $scope.newRebate = {};

    }

    $scope.addRebate = function(){
        $scope.selProduct.rebates.push($scope.newRebate);
        saveProduct(function(){
            $scope.loadRebates();
        });
    }

    $scope.saveRebate= function(r){
        saveProduct(function(){
            $scope.loadRebates();
        });
    }

    $scope.removeRebate = function(r){
        for(var i = $scope.selProduct.rebates.length - 1; i >=0; i--){
            if (r.title == $scope.selProduct.rebates[i].title){
                $scope.selProduct.rebates.splice(i, 1);
            }
        }
        saveProduct(function(){
            $scope.loadRebates();
        });
    }

}