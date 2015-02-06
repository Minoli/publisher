var t_on = {
    'apiChart': 1,
    'subsChart': 1,
    'serviceTimeChart': 1,
    'tempLoadingSpace': 1
};
var currentLocation;

var chartColorScheme1 = ["#3da0ea", "#bacf0b", "#e7912a", "#4ec9ce", "#f377ab", "#ec7337", "#bacf0b", "#f377ab", "#3da0ea", "#e7912a", "#bacf0b"];
//fault colors || shades of red
var chartColorScheme2 = ["#ED2939", "#E0115F", "#E62020", "#F2003C", "#ED1C24", "#CE2029", "#B31B1B", "#990000", "#800000", "#B22222", "#DA2C43"];
//fault colors || shades of blue
var chartColorScheme3 = ["#0099CC", "#436EEE", "#82CFFD", "#33A1C9", "#8DB6CD", "#60AFFE", "#7AA9DD", "#104E8B", "#7EB6FF", "#4981CE", "#2E37FE"];
currentLocation = window.location.pathname;

require(["dojo/dom", "dojo/domReady!"], function (dom) {
    currentLocation = window.location.pathname;
    //Initiating the fake progress bar
    jagg.fillProgress('apiChart');
    jagg.fillProgress('subsChart');
    jagg.fillProgress('serviceTimeChart');
    jagg.fillProgress('tempLoadingSpace');

    jagg.post("/site/blocks/stats/api-usage-user/ajax/stats.jag", { action: "getFirstAccessTime", currentLocation: currentLocation  },
        function (json) {

            if (!json.error) {

                if (json.usage && json.usage.length > 0) {
                    var d = new Date();
                    var firstAccessDay = new Date(json.usage[0].year, json.usage[0].month - 1, json.usage[0].day);
                    var currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes());
//                    if (firstAccessDay.valueOf() == currentDay.valueOf()) {
//                        currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
//                    }
//                    var rangeSlider = $("#rangeSlider");
//                    //console.info(currentDay);
//                    rangeSlider.dateRangeSlider({
//                        "bounds": {
//                            min: firstAccessDay,
//                            max: currentDay
//                        },
//                        "defaultValues": {
//                            min: firstAccessDay,
//                            max: currentDay
//                        }
//                    });
//                    rangeSlider.bind("valuesChanged", function (e, data) {
//                        var from = convertTimeString(data.values.min);
//                        var to = convertTimeStringPlusDay(data.values.max);
//
//                        drawAPIUsageByUser(from, to);
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
                            $("#date-range").val(str)
                            drawAPIUsageByUser(from,to);

                        });

                        $('#hour-btn').on('click',function(){
                            var from = convertTimeString(currentDay);
                            var to = convertTimeString(currentDay-3600000);
                            var str= to+" to "+from;
                            $("#date-range").val(str)
                            drawAPIUsageByUser(from,to);
                        })

                        $('#week-btn').on('click',function(){
                            var from = convertTimeString(currentDay);
                            var to = convertTimeString(currentDay-604800000);
                            var str= to+" to "+from;
                            $("#date-range").val(str)
                            drawAPIUsageByUser(from,to);
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
                                  drawAPIUsageByUser(from,to);
                            })
                            .bind('datepicker-apply',function(event,obj)
                            {
                                 var from = convertTimeString(obj.date1);
                                 var to = convertTimeString(obj.date2);
                                 drawAPIUsageByUser(from,to);
                            })
                            .bind('datepicker-close',function()
                            {
                            });

                            var width = $("#rangeSliderWrapper").width();
                            $("#rangeSliderWrapper").affix();
                            $("#rangeSliderWrapper").width(width);
                }
                else {
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><span class="label top-level-warning"><i class="icon-warning-sign icon-white"></i>'
                        + i18n.t('errorMsgs.checkBAMConnectivity') + '</span><br/><img src="../themes/default/templates/stats/api-usage-user/images/statsThumb.png" alt="Smiley face"></div>'));
                }


            }
            else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content: json.message, type: "error"});
                }
            }
            t_on['apiChart'] = 0;
        }, "json");

});


var drawAPIUsageByUser = function (from, to) {
    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/api-usage-user/ajax/stats.jag", { action: "getAPIUsageByUser", currentLocation: currentLocation, fromDate: fromDate, toDate: toDate},
        function (json) {

            if (!json.error) {
                $('#tooltipTable').find("tr:gt(0)").remove();
                //$('#apiUsageByUserTable').find("tr:gt(0)").remove();
                var length = json.usage.length;
                $('#tempLoadingSpaceUsageByUser').empty();
                $('#chartContainer').empty();
                $('div#apiSelectTable_wrapper.dataTables_wrapper.no-footer').remove();

                //$('#apiUsageByUserTable').show();
//                $('#apiUsageByUserTable').hide();
//                $('#chartContainer').empty();
//                $('#tempLoadingSpaceUsageByUser').empty();
//
//                for (var i = 0; i < json.usage.length; i++) {
//                    $('#apiUsageByUserTable').append($('<tr><td>' + json.usage[i].apiName + '</td><td>' + json.usage[i].version + '</td><td>' + json.usage[i].userId + '</td><td width="20%"><p align="right">' + json.usage[i].count + '</td></tr>'));
//                }
//                if (length == 0) {
//                    $('#apiUsageByUserTable').hide();
//                    $('#tempLoadingSpaceUsageByUser').html('');
//                    $('#tempLoadingSpaceUsageByUser').append($('<span class="label label-info">' + i18n.t('errorMsgs.noData') + '</span>'));
//
//                } else {
//                    $('#tempLoadingSpaceUsageByUser').hide();
//
//                }
                var inputData=[];
                for (var i = 0; i < length; i++) {
                    inputData.push({
                        "api_name":json.usage[i].apiName,
                        "version":json.usage[i].version,
                        "user":json.usage[i].userId,
                        "count": json.usage[i].count
                    } );
                }

                 dataUsage = JSON.parse(JSON.stringify(inputData));


                 function orderByCountAscending(a, b) {
                     return b.count - a.count;
                 }

                 dataUsage = dataUsage.sort(orderByCountAscending);
                 var webapps = [];

                 for(x=0;x<dataUsage.length;x++){

                     var webappIndex = -1;
                     var webappVersionIndex = -1;

                     for(y=0;y<webapps.length;y++){
                         if(webapps[y][0] == dataUsage[x].api_name){
                             webappIndex = y;
                             var z;
                             for(z=0;z<webapps[y][1].length;z++){
                                 if(webapps[y][1][z][0] == dataUsage[x].version){
                                     webappVersionIndex = z;
                                     break;
                                 }
                             }
                             if((webappVersionIndex == -1) && (z == webapps[y].length)){
                                 break;
                             }
                         }
                     }

                     if(webappIndex == -1){
                         var version = [];
                         var requestCount = [];
                         requestCount.push([dataUsage[x].user,dataUsage[x].count.toString()]);
                         version.push([dataUsage[x].version,requestCount]);
                         webapps.push([dataUsage[x].api_name,version]);
                     }else{
                         if(webappVersionIndex == -1){
                             var requestCount = [];
                             requestCount.push([dataUsage[x].user,dataUsage[x].count.toString()]);
                             webapps[webappIndex][1].push([dataUsage[x].version,requestCount]);
                         }
                         else{
                             webapps[webappIndex][1][webappVersionIndex][1].push([dataUsage[x].user,dataUsage[x].count.toString()]);
                         }
                     }

                 }

                 if (dataUsage == null) {
                     obj = {
                         error:true
                     };
                 } else {
                     obj = {
                         error:false,
                         webapps:webapps
                     };
                 }

                 var parsedResponse = JSON.parse(JSON.stringify(webapps));
                 //  var parsedResponse =  [["Travel Claims", [["1", [["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"]]]]], ["Net Usage Analyser", [["1", [["admin", "30"]]]]], ["Leave Managment", [["1", [["admin", "30"]]]]], ["pizza", [["1", [["test", "29"]]]]], ["Travel Booking", [["1", [["admin", "29"]]]]], ["webappsample", [["1", [["test", "27"]]]]], ["sample", [["1", [["admin", "20"], ["test", "19"]]]]], ["Hardware Repo", [["1", [["admin", "18"]]]]], ["MyApp", [["1", [["test", "14"]]]]],["Travel Claims1", [["1", [["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"],["admin", "2"]]]]], ["Net Usage Analyser1", [["1", [["admin", "30"]]]]], ["Leave Managment1", [["1", [["admin", "30"]]]]], ["pizza1", [["1", [["test", "29"]]]]], ["Travel Booking1", [["1", [["admin", "29"]]]]], ["webappsample1", [["1", [["test", "27"]]]]], ["sample", [["1", [["admin", "20"], ["test", "19"]]]]], ["Hardware Repo1", [["1", [["admin", "18"]]]]], ["MyApp1", [["1", [["test", "14"]]]]],["MyApp2", [["1", [["test", "14"]]]]],["MyApp3", [["1", [["test", "14"]]]]]];
                 //var parsedResponse= [["HelloWorld",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["BDay",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],  ["WeatherPredictor",[["1.0.0",[["duser","14"],["admin","386"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["News",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Teacher",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["DateTracker",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]   , ["HelloWorld1",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds",[["1.0.0",[["admin","88"],["duser","18"],["subscriber","4"]]]]],["Employee",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student1",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["Calculator",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],    ["HelloWorld",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["BDay",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],  ["WeatherPredictor2",[["1.0.0",[["duser","14"],["admin","386"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["News2",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee2",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Teacher2",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["DateTracker2",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]   , ["HelloWorld2",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds2",[["1.0.0",[["admin","88"],["duser","18"],["subscriber","4"]]]]],["Employee",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student2",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["Calculator1",[["1.0.1",[["anonymous","11"],["admin","5"]]]]], ["HelloWorld3",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds3",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee3",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student3",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["BDay",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],  ["WeatherPredictor3",[["1.0.0",[["duser","14"],["admin","386"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["News3",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee3",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Teacher3",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["DateTracker3",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]   , ["HelloWorld13",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds34",[["1.0.0",[["admin","88"],["duser","18"],["subscriber","4"]]]]],["Employee34",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student143",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["Calculator",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],    ["HelloWorld334",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds34",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee344",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["BDay343",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],  ["WeatherPredictor243",[["1.0.0",[["duser","14"],["admin","386"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["News342",[["1.0.0",[["admin","88"],["duser","18"],["subscriber13434","4"]]]]],["Employee342",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Teacher2",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["DateTracker2",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]   , ["HelloWorld234",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds344432",[["1.0.0",[["admin","88"],["duser","18"],["subscriber","4"]]]]],["Employee3t5t",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student54fr2",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["Calculatorfr1",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],["HelloWorld390",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds390",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employee3",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student093",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["BDa909y",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],  ["Weath090erPredictor3",[["1.0.0",[["duser","14"],["admin","386"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["New09s3",[["1.0.0",[["admin","88"],["duser","18"],["subsc909riber1","4"]]]]],["Employe90e3",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Teachiuier3",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["DateTra9icker3",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]   , ["HelloWuiorld13",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeds34",[["1.0.0",[["admin","88"],["duser","18"],["subscriber","4"]]]]],["Empluioyee34",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Studenui143",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["Caluiculator",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],    ["HelloWouiurld334",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["YoutubeFeeiuds34",[["1.0.0",[["admin","88"],["duser","18"],["subscriber1","4"]]]]],["Employeuiue344",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["BuiDay343",[["1.0.1",[["anonymous","11"],["admin","5"]]]]],  ["Weathe9irPredictor243",[["1.0.0",[["duser","14"],["admin","386"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["Newus342",[["1.0.0",[["admin","88"],["duser","18"],["subscriber13434","4"]]]]],["Employeuiue342",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Teacu7uher2",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["DateTu7ru7acker2",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]   , ["HelloWu7uorld234",[["1.0.0",[["duser","147"],["admin","36"]]],["1.2.0",[["user","50"],["admin","9"]]],["2.0.0",[["duser","147"]]]]],["Youtub7ueFeeds344432",[["1.0.0",[["admin","88"],["duser","18"],["subscriber","4"]]]]],["Employee37ut5t",[["1.0.0",[["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"],["admin","5"]]]]],["Student54fttr2",[["1.0.0",[["duser","60"]]],["2.0.0",[["duser","15"],["duser","15"]]]]],["Calculatu7uorfr1",[["1.0.1",[["anonymous","11"],["admin","5"]]]]]];
                 var data=[];
	                for ( var i = 0; i < parsedResponse.length; i++) {
		                var count = 0;
		                var app ='';

		            for ( var j = 0; j < parsedResponse[i][1].length; j++) {
                        app =(parsedResponse[i][0].replace(/\s+/g, ''));

			            var maximumUsers = 0;
			            maximumUsers=parsedResponse[i][1][j][1].length;
                        var allcount = 0;
			                for ( var k = 0; k < maximumUsers; k++) {
				                count++;
				                allcount = Number(allcount)+Number(parsedResponse[i][1][j][1][k][1]);

			                }

                    data.push({
                                    API_name:app,
                                    Subscriber_Count:maximumUsers,
                                    Hits:allcount,
                                    API:app
                                });
		            }
		            userParsedResponse = parsedResponse;
                 }
//                data.push({
//                                API_name:"sample",
//                                Subscriber_Count:20,
//                                Hits:30,
//                                API:"sample"
//                          });

                var chart;
                var svg = dimple.newSvg("#chartContainer", 800, 600);

                  //resize chart
//                var chart = $("#chartContainer"),
//                                    aspect = chart.width() / chart.height(),
//                                    container = chart.parent();
//                                $(window).on("resize", function() {
//                                    var targetWidth = container.width();
//                                    chart.attr("width", targetWidth);
//                                    chart.attr("height", Math.round(targetWidth / aspect));
//                                }).trigger("resize");


                chart = new dimple.chart(svg, data);
               chart.setBounds("10%", "10%", "75%", "60%");

               var x= chart.addCategoryAxis("x", "API");
               x.showGridlines = true;
               x.tickSize="0";


                var y=chart.addMeasureAxis("y", "Subscriber_Count");
                y.title = "Subscriber Count";
                chart.addMeasureAxis("z", "Hits");
                s=chart.addSeries("API", dimple.plot.bubble);

                var div = d3.select("body").append("div").attr("class", "toolTip");



///////////////////////////////////////////////////////////////////////////////
//                $("#myTable > tbody").html("");
//                var table = $("#myTable");
//                var html_elements = "";
                var filterValues = dimple.getUniqueValues(data, "API");
                //alert(filterValues);


                var $dataTable =$('<table class="display" width="100%" cellspacing="0" id="apiSelectTable"></table>');

                $dataTable.append($('<thead class="tableHead"><tr>'+
                                        '<th width="10%"></th>'+
                                        '<th>API</th>'+
                                    '</tr></thead>'));

                for(var n=0;n<filterValues.length;n++){
                    $dataTable.append($('<tr><td >'
                     +'<input name="item_checkbox" onchange="javascript:void(0);" checked="true" id='+n+' type="checkbox"  data-item='+filterValues[n] +' class="ccf"/>'
                     +'</td>'
                     +'<td style="text-align:left;"><label for='+n+'>'+filterValues[n] +'</label></td></tr>'));
                    //$(html_elements).appendTo($("#myTable"));
                }

                 if (length == 0) {
                                    $('#apiUsageByUserTable').hide();
                                    $('#tempLoadingSpaceUsageByUser').html('');
                                    $('#tempLoadingSpaceUsageByUser').append($('<span class="label label-info">' + i18n.t('errorMsgs.noData') + '</span>'));

                                } else {
                                    //$('#tempLoadingSpaceUsageByUser').hide();
                                    $('#tableContainer').append($dataTable);
                                                        $('#tableContainer').show();
                                                        //$dataTable.tablesorter();
                                                        $('#apiSelectTable').DataTable({
                                                            //"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 ] } ],
                                                            "aoColumns": [
                                                            { "bSortable": false },
                                                            null
                                                            ]
                                                        });

                                }

// $("#itemList").on('click', '.ccf', function (e){
                 d3.selectAll(".ccf").on("click", function (d) {
                 //alert(filterValues)
                 var id =  $(this).attr('value');
                 var temp= $(this).attr('data-item');
                 //alert("data"+temp)
                   // This indicates whether the item is already visible or not
                    var hide = false;
                    var newFilters = [];

                    // If the filters contain the clicked shape hide it
//                    filterValues.forEach(function (f) {
//                    //alert(f)
//                      if () {
//                       // alert(e.aggField.slice(-1)[0]);
//                        hide = true;
//                      } else {
//                        //alert(e.aggField.slice(-1)[0]);
//                        newFilters.push(f);
//                      }
//                    });
            filterValues.forEach(function (f){
                    if(f==temp){
                        hide = true;
                    }
                    else{
                        newFilters.push(f);
                    }
            });

            if (hide) {
                      //d3.select(this).style("opacity", 0.2);
            } else {
                      newFilters.push(temp);
                      //d3.select(this).style("opacity", 0.8);
            }
                    filterValues = newFilters;
                    chart.data = dimple.filterData(data, "API", filterValues);
                    chart.draw();
                   });



//////////////////////////////////////////////////////////////////////////////
                s.afterDraw = function (shp, d) {
                var shape = d3.select(shp);

//                svg.append("text")
//                    .attr("x", shape.attr("cx"))
//                    .attr("y", shape.attr("cy") - shape.attr("r") - 5)
//                    .style("text-anchor", "middle")
//                    .style("font-family", "sans-serif")
//                    .style("font-size", "10px")
//                    .text(d.aggField + ": " + d.zValue);

//                svg.append("text")
//                    .attr("class", "y label")
//                    .attr("text-anchor", "end")
//                    .attr("y", 6)
//                    .attr("dy", ".75em")
//                    .attr("transform", "rotate(-90)")
//                    .text("Subscription Count");


//                  svg.append("text")
//                      .attr("class", "x label")
//                      .attr("text-anchor", "end")
//                      .attr("x", 400)
//                      .attr("y",650)
//                      .text("API");


                     var circle=d3.select("#"+d.aggField+"_"+d.aggField+"__");

                     circle.on("click", function(d){

                     //alert(d.aggField)
                     //circle on click
                     for ( var i = 0; i < parsedResponse.length; i++) {

                     var count = 0;
                     var app ='';

                         if(d.aggField == parsedResponse[i][0].replace(/\s+/g, '')){
                         var versionCount=[];
                            for ( var j = 0; j < parsedResponse[i][1].length; j++) {
                            app =(parsedResponse[i][0]);

                                      if (j != 0) {

                                      }

                                      var maximumUsers = parsedResponse[i][1][j][1].length;
                                      maxrowspan = parsedResponse[i][1][j][1].length;

                                      allcount = 0;
                                      for ( var k = 0; k < maximumUsers; k++) {

                                       if (k != 0) {
                                             // statement = statement + '<tr>'
                                       }
                                       count++;

                                       allcount = Number(allcount)+Number(parsedResponse[i][1][j][1][k][1]);

                                      }

                             versionCount.push({version:parsedResponse[i][1][j][0],count:allcount});
                            }


                            div.style("left", d3.event.pageX+10+"px");
                            div.style("top", d3.event.pageY-25+"px");
                            div.style("display", "inline-block");

                            var chartid= "chart"+k;
                            //alert(chartid)

                            div.html('<table class="table graphTable" id="tooltipTable"><thead><tr><th>version</th><th>Hits</th></tr></thead><tbody></tbody></table>');
                            //div.html('<div id="chartid"></div>');
                            for (var l=0;l<versionCount.length;l++){
                            console.log(versionCount.length)
                                var versionName=versionCount[l].version;
                                var version_Count=versionCount[l].count;

                                $('#tooltipTable tbody').append('<tr><td>'+versionName+'</td><td>'+version_Count+'</td></tr>');

                            }

                            //donut chart
                            //drawGraph(arr);

                         }
                     } //end of display table on hover

                    });

                    circle.on("mouseout", function(d){
                       div.style("display", "none");
                    });

                    };

                chart.draw();

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content: json.message, type: "error"});
                }
            }
            t_on['tempLoadingSpaceUsageByUser'] = 0;
        }, "json");


}


function drawGraph(dataset){
    var width = 160;
    var height = 160;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 25;

    var color = d3.scale.category20b();

    var svg = d3.select('#chartid')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) +
        ',' + (height / 2) + ')');

    var arc = d3.svg.arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius);

    var pie = d3.layout.pie()
      .value(function(d) { return d.count; })
      .sort(null);

    var path = svg.selectAll('path')
      .data(pie(dataset))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d, i) {
        return color(d.data.version);
      });
}

var convertTimeString = function(date){
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth()+1)) + "-" + formatTimeChunk(d.getDate())+" "+formatTimeChunk(d.getHours())+":"+formatTimeChunk(d.getMinutes());
    return formattedDate;
};

var convertTimeStringPlusDay = function (date) {
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth() + 1)) + "-" + formatTimeChunk(d.getDate() + 1);
    return formattedDate;
};

var formatTimeChunk = function (t) {
    if (t < 10) {
        t = "0" + t;
    }
    return t;
};
