angular.module('cart').directive('mkGrid', function() {
        return{
            restrict: 'E',
            scope: { data: '=data', meta:'=meta'},
            template: ' <div style="width: 100%;  height: 500px; margin: 20px"></div>',
            link: function(scope, elem, attr){

                var paintGrid = function() {
                    var gridOptions = {
                        editable: true,
                        enableAddRow: true,
                        enableCellNavigation: true,
                        asyncEditorLoading: false,
                        autoEdit: true
                    }
                    scope.opt = gridOptions;
                    var columns = [];
                    var rowSelector = {};
                    rowSelector.id = "mk_rowsel";
                    rowSelector.name = "";
                    rowSelector.field = "mk_rowsel";
                    rowSelector.width = 20;
                    rowSelector.editor = Slick.Editors.Checkbox;
                    rowSelector.formatter = Slick.Formatters.Checkmark;
                    columns.push(rowSelector);
                    $.each(scope.meta, function(i, fm){
                        var col = {};
                        col.id = fm.fldname;
                        col.name = fm.label;
                        col.field = fm.fldname;

                        switch (fm.fldtype){
                            case "text":
                                col.editor = Slick.Editors.Text;
                                col.width =  100;
                                break;
                            case "longtext":
                            case "array":
                                col.editor = Slick.Editors.LongText;
                                col.width =  200;
                                break;
                            case "bool":
                                col.editor = Slick.Editors.Checkbox;
                                col.formatter = Slick.Formatters.Checkmark;
                                col.width =  50;
                                break;
                            default:
                                col.editor = Slick.Editors.Text;
                                col.width =  100;
                                break;
                        }
                        columns.push(col);
                    });


                    grid = new Slick.Grid(elem, scope.data, columns, gridOptions);

                    grid.setSelectionModel(new Slick.CellSelectionModel());

                    grid.onCellChange.subscribe(function(e,args){
                        scope.recordChanged(args.item);
                    });

                }
                //scope.$watch('opt', paintGrid);
                scope.$watch('data', paintGrid);

            }
        }
    }
);