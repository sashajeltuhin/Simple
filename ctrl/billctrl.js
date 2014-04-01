function billctrl($scope, cartservice){
    var serverUrl = topUrl + '/templ/';
    $scope.topUrl = topUrl;
    var months = ["Jan", "Feb", "Mar", "Apr", 'May', "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    $scope.recalc = function(){
        whatIf();
    }

    function whatIf(){
        var packages = cartservice.getProdsInCart();
        $scope.whatifs = [];
        $scope.monthBills = [];
        if (packages !== undefined && packages.length > 0){
            var today = new Date();
            var monNum = today.getMonth();
            for(var m = 1; m <= 12; m++){
                var mobj = {};
                mobj.name = Number(m + monNum) >= 12 ? months[m + monNum - 12] : months[m + monNum];
                console.log("m", m);
                console.log("monNum", monNum);
                mobj.prods = [];
                $scope.monthBills.push(mobj);
                for(var i = 0; i < packages.length; i++) {
                    var rec = 0;
                    var p = packages[i];
                    if (m == 1){
                        $scope.whatifs.push(p);
                    }
                    var recprice = p.priceNow == undefined ? 0 : Number(p.priceNow);
                    rec = Number(Number(rec) + Number(recprice)).toFixed(2);
                    console.log('rec before', rec);
                    var fees = calculateFees(p, m);
                    console.log('added price', fees);
                    rec = Number((Number(rec) + Number(fees))).toFixed(2);
                    console.log('rec after', rec);
                    if (p.bundles !== undefined){
                        for(var b = 0; b < p.bundles.length; b++){
                            var adon = p.bundles[b];
                            var recad = adon.priceNow == undefined ? 0 : Number(adon.priceNow);
                            rec = Number(Number(rec) + Number(recad)).toFixed(2);
                            console.log('rec before', rec);
                            var fads = calculateFees(adon, m);
                            console.log('added price bundle', fads);
                            rec = Number((Number(rec) + Number(fads))).toFixed(2);
                            console.log('rec after', rec);
                        }
                    }
                    mobj.prods.push(rec);
                }
            }
        }
    }

    function calculateFees(p, month){
        var rec = 0;
        if (p.fees !== undefined){

            for(var f = 0; f < p.fees.length; f++){
                var fee = p.fees[f];
                if (fee.valnum == undefined  || Number(fee.valnum) == 0 || Number(fee.valnum) >= Number(month)){
                    var recfee = fee.priceNow == undefined ? 0 : Number(fee.priceNow);
                    rec = Number(Number(rec) + Number(recfee)).toFixed(2);
                }
            }
        }

        if (p.rebates !== undefined){
            for(var f = 0; f < p.rebates.length; f++){
                var reb = p.rebates[f];
                if (reb.valnum == undefined  || Number(reb.valnum) == 0 || Number(reb.valnum) >= Number(month)){
                    var recreb = reb.priceNow == undefined ? 0 : Number(reb.priceNow);
                    rec = Number(Number(rec) - Number(recreb)).toFixed(2);
                }
            }
        }

        return Number(rec);

    }
}



