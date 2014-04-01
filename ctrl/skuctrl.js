function skuctrl($scope, $http, adminservice){
    $scope.rootUrl = topUrl;
    var serverUrl = topUrl + adminURL + '/templ/';
    var OBJ = 'product';
    $scope.selProduct = adminservice.getSelObj();


    adminservice.loadMeta(OBJ, $http, function(meta){
        $scope.fieldList = adminservice.bindObj(meta, $scope.selProduct, prepareField);
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
        dummy.title = 'Drag from the available list on the right';
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
        $scope.bundleMap = {};
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
                $scope.bundleMap[t._id] = t;
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
                var bundle = $scope.bundleMap[item['$scope'].i._id];
                if (bundle !== undefined){
                    $scope.selProduct.bundles.push(bundle);
                }
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
        adminservice.loadMeta(OBJ, $http, function(meta){
            $scope.bundleDetail = serverUrl + 'bundleDetail.html';
            $scope.bundlefieldList = adminservice.bindObj(meta, p, prepareBundleField);
        });
    }

    $scope.saveBundle= function(p){
        saveProduct(function(){
            $scope.loadBundles();
        });
    }

    $scope.loadBundleFees = function(p){
        if (p.fees == undefined){
            p.fees = [];
        }
        $scope.newBundleFee = {};
    }

    $scope.saveBundleFee= function(f, p){
        saveProduct(function(){
            $scope.loadBundleFees(p);
        });
    }

    $scope.addBundleFee = function(p){
        p.fees.push($scope.newBundleFee);
        saveProduct(function(){
            $scope.loadBundleFees(p);
        });
    }

    $scope.removeBundleFee = function(f, p){
        for(var i = p.fees.length - 1; i >=0; i--){
            if (f.title == p.fees[i].title){
                p.fees.splice(i, 1);
            }
        }
        saveProduct(function(){
            $scope.loadBundleFees(p);
        });
    }


    $scope.loadBundleRebates = function(p){
        if (p.rebates == undefined){
            p.rebates = [];
        }
        $scope.newBundleRebate = {};
    }

    $scope.addBundleRebate = function(p){
        p.rebates.push($scope.newBundleRebate);
        saveProduct(function(){
            $scope.loadBundleRebates(p);
        });
    }

    $scope.saveBundleRebate= function(r, p){
        saveProduct(function(){
            $scope.loadBundleRebates(p);
        });
    }

    $scope.removeBundleRebate = function(r, p){
        for(var i = p.rebates.length - 1; i >=0; i--){
            if (r.title == p.rebates[i].title){
                p.rebates.splice(i, 1);
            }
        }
        saveProduct(function(){
            $scope.removeBundleRebate(p);
        });
    }

    function prepareBundleField(metafld){
        var mf = metafld;
        if (metafld.fldname !== 'title' && metafld.fldname !== 'desc' && metafld.fldname !== 'priceNow' && metafld.fldname !== 'origPrice'){
            mf = null;
        }

        return mf;
    }


    function saveProduct(callback){
        adminservice.bindObjData($scope.selProduct, $scope.fieldList);
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