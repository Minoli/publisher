var t_on = {
    'apiChart':1,
    'subsChart':1,
    'serviceTimeChart':1,
    'tempLoadingSpace':1
};
var currentLocation;

var chartColorScheme1 = ["#3da0ea","#bacf0b","#e7912a","#4ec9ce","#f377ab","#ec7337","#bacf0b","#f377ab","#3da0ea","#e7912a","#bacf0b"];
//fault colors || shades of red
var chartColorScheme2 = ["#ED2939","#E0115F","#E62020","#F2003C","#ED1C24","#CE2029","#B31B1B","#990000","#800000","#B22222","#DA2C43"];
//fault colors || shades of blue
var chartColorScheme3 = ["#0099CC","#436EEE","#82CFFD","#33A1C9","#8DB6CD","#60AFFE","#7AA9DD","#104E8B","#7EB6FF","#4981CE","#2E37FE"];
currentLocation=window.location.pathname;

require(["dojo/dom", "dojo/domReady!"], function(dom){
    currentLocation=window.location.pathname;
    //Initiating the fake progress bar
    jagg.fillProgress('apiChart');jagg.fillProgress('subsChart');jagg.fillProgress('serviceTimeChart');jagg.fillProgress('tempLoadingSpace');

    jagg.post("/site/blocks/stats/api-usage-destination/ajax/stats.jag", { action:"getFirstAccessTime",currentLocation:currentLocation  },
        function (json) {

            if (!json.error) {

                if( json.usage && json.usage.length > 0){
                    var d = new Date();
                    var firstAccessDay = new Date(json.usage[0].year, json.usage[0].month-1, json.usage[0].day);
                    var currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes());
//                    if(firstAccessDay.valueOf() == currentDay.valueOf()){
//                        currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1);
//                    }
//                    var rangeSlider =  $("#rangeSlider");
//                    //console.info(currentDay);
//                    rangeSlider.dateRangeSlider({
//                        "bounds":{
//                            min: firstAccessDay,
//                            max: currentDay
//                        },
//                        "defaultValues":{
//                            min: firstAccessDay,
//                            max: currentDay
//                        }
//                    });
//                    rangeSlider.bind("valuesChanged", function(e, data){
//                        var from = convertTimeString(data.values.min);
//                        var to = convertTimeStringPlusDay(data.values.max);
//
//                        drawAPIUsageByDestination(from,to);
//
//                    });
//                    var width = $("#rangeSliderWrapper").width();
//                    $("#rangeSliderWrapper").affix();
//                    $("#rangeSliderWrapper").width(width);

                        //date picker
                        $('#today-btn').on('click',function(){
                            var from = convertTimeString(currentDay);
                            var to = convertTimeString(currentDay-86400000);
                            var str= to+" to "+from;
                            $("#date-range").val(str);
                            drawAPIUsageByDestination(from,to);

                        });

                        $('#hour-btn').on('click',function(){
                            var from = convertTimeString(currentDay);
                            var to = convertTimeString(currentDay-3600000);
                            var str= to+" to "+from;
                            $("#date-range").val(str);
                            drawAPIUsageByDestination(from,to);
                        })

                        $('#week-btn').on('click',function(){
                            var from = convertTimeString(currentDay);
                            var to = convertTimeString(currentDay-604800000);
                            var str= to+" to "+from;
                            $("#date-range").val(str);
                            drawAPIUsageByDestination(from,to);
                        })

                        $('#date-range').dateRangePicker(
                            {
                                startOfWeek: 'monday',
                                separator : ' to ',
                                format: 'DD-MM-YYYY HH:mm',
                                autoClose: false,
                                time: {
                                    enabled: true
                                },
                                shortcuts:'hide',
                                startDate:firstAccessDay,
                                endDate:currentDay
                            })
                            .bind('datepicker-change',function(event,obj)
                            {     var from = convertTimeString(obj.date1);
                                  var to = convertTimeString(obj.date2);
                                  drawAPIUsageByDestination(from,to);
                            })
                            .bind('datepicker-apply',function(event,obj)
                            {
                                 var from = convertTimeString(obj.date1);
                                 var to = convertTimeString(obj.date2);
                                 drawAPIUsageByDestination(from,to);
                            })
                            .bind('datepicker-close',function()
                            {
                            });

                            var width = $("#rangeSliderWrapper").width();
                            $("#rangeSliderWrapper").affix();
                            $("#rangeSliderWrapper").width(width);

                }
                else{
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><span class="label top-level-warning"><i class="icon-warning-sign icon-white"></i>'
                        +i18n.t('errorMsgs.checkBAMConnectivity')+'</span><br/><img src="../themes/default/templates/stats/api-usage-destination/images/statsThumb.png" alt="Smiley face"></div>'));
                }


            }
            else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['apiChart'] = 0;
        }, "json");

});


var drawAPIUsageByDestination = function(from,to){
    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/api-usage-destination/ajax/stats.jag", { action:"getAPIUsageByDestination", currentLocation:currentLocation,fromDate:fromDate,toDate:toDate},
        function (json) {
            if (!json.error) {
                //$('#destinationBasedUsageTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#tempLoadingSpaceDestination').empty();


                $('div#destinationBasedUsageTable_wrapper.dataTables_wrapper.no-footer').remove();
                var $dataTable =$('<table class="display" width="100%" cellspacing="0" id="destinationBasedUsageTable"></table>');

                $dataTable.append($('<thead class="tableHead"><tr>'+
                                        '<th>API</th>'+
                                        '<th>VERSION</th>'+
                                        '<th>CONTEXT</th>'+
                                        '<th>DESTINATION ADDRESS</th>'+
                                        '<th>NO OF ACCESS</th>'+
                                    '</tr></thead>'));


                //$('#destinationBasedUsageTable').show();
                for (var i = 0; i < json.usage.length; i++) {
                    $dataTable.append($('<tr><td>' + json.usage[i].apiName + '</td><td>' + json.usage[i].version + '</td><td>' + json.usage[i].context + '</td><td>' + json.usage[i].destination + '</td><td class="tdNumberCell">' + json.usage[i].count + '</td></tr>'));
                }
                if (length == 0) {
                    $('#destinationBasedUsageTable').hide();
                    $('#tempLoadingSpaceDestination').html('');
                    $('#tempLoadingSpaceDestination').append($('<span class="label label-info">'+i18n.t('errorMsgs.noData')+'</span>'));

                }else{
                    //$('#tempLoadingSpaceDestination').hide();
                    $('#tableContainer').append($dataTable);
                    $('#tableContainer').show();
                    $('#destinationBasedUsageTable').DataTable();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content:json.message,type:"error"});
                }
            }
            t_on['tempLoadingSpaceDestination'] = 0;
        }, "json");

}

var convertTimeString = function(date){
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth()+1)) + "-" + formatTimeChunk(d.getDate())+" "+formatTimeChunk(d.getHours())+":"+formatTimeChunk(d.getMinutes());
    return formattedDate;
};

var convertTimeStringPlusDay = function(date){
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth()+1)) + "-" + formatTimeChunk(d.getDate()+1);
    return formattedDate;
};

var formatTimeChunk = function (t){
    if (t<10){
        t="0" + t;
    }
    return t;
};

