angular.module('cart').directive('selfld', function(adminservice, $http) {
        return{
            restrict: 'E',
            scope: { fld: '@fld', obj: '@obj', data:'=data' },
            template:'<input type="hidden">',
            link: function(scope, elem, attr){
                elem.select2({
                    minimumInputLength: 1,
                    query: function(q){
                        adminservice.listFldObj(scope.obj, scope.fld, q.term + '*', $http, function(data){
                            var d = {};
                            d.results = [];
                            $.each(data, function(i, item){
                                d.results.push({id: item[scope.fld], text: item[scope.fld]});
                            });
                            q.callback(d);
                        });
                    }
                }).on('change', function(e){
                           scope.data[scope.fld] = e.val;
                    }).val(scope.data[scope.fld]);
                console.log(scope.data[scope.fld]);
                }

        }
    }
);

