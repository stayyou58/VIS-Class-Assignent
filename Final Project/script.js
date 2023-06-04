//depth slider
$(function() {
    $( "#depth-slider-range" ).slider({
        range: true,
        min: 0,
        max: 720,
        values: [ 50, 170 ],
        slide: function( event, ui ) {
            $("#depth_amount").val(ui.values[ 0 ] + "km - " + ui.values[ 1 ] + "km");
        }
    });
    $("#depth_amount").val($("#depth-slider-range").slider("values", 0) + "km - " + $("#depth-slider-range").slider("values", 1) + "km");
});
//$("#depth-slider-range").autocomplete(false);

//scale slider
$(function() {
    $( "#scale-slider-range" ).slider({
        range: true,
        min: 4,
        max: 9.5,
        values: [ 5, 6 ],
        slide: function( event, ui ) {
            $("#scale_amount").val(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
        }
    });
    $("#scale_amount").val($("#scale-slider-range").slider("values", 0) + " - " + $("#scale-slider-range").slider("values", 1));
});

//time
$(function() {

    $( "#from" ).datepicker({
        defaultDate: new Date(2019, 7 - 1, 10),
        changeYear: true,
        changeMonth: true,
        numberOfMonths: 1,
        minDate: new Date(2019, 1 - 1, 1), 
        maxDate: new Date(2023, 2 - 1, 27),
        onClose: function( selectedDate ) {
            var temp = new Date(selectedDate);
            temp.setDate(temp.getDate() + 1);
            $( "#to" ).datepicker( "option", "minDate", temp );
        },
        beforeShow: function(){
            setTimeout(
                function(){
                    $('#ui-datepicker-div').css("z-index", 10);
                }, 100
            );
        }
    });

    $( "#to" ).datepicker({
        defaultDate: new Date(2021, 7 - 1, 10),
        changeYear: true,
        changeMonth: true,
        numberOfMonths: 1,
        minDate: new Date(2019, 1 - 1, 1), 
        maxDate: new Date(2023, 2 - 1, 27),
        onClose: function( selectedDate ) {
            var temp = new Date(selectedDate);
            temp.setDate(temp.getDate() - 1);
            $( "#from" ).datepicker( "option", "maxDate", temp );
        },
        beforeShow: function(){
            setTimeout(
                function(){
                    $('#ui-datepicker-div').css("z-index", 10);
                }, 100
            );
        }
    });

});

//map array 必須在Global命名
var draw_map = [];

//load data
d3.csv("Global_Earthquake_Data_Refined.csv").then( function(csvdata) {

    document.getElementById('depth-slider-range').autocomplete = "off";

    //search button
    document.getElementById('search_button').onclick = function findEarthquake() {
        // 在重新搜索之前移除先前的無搜索結果提示
        d3.select("#map").select(".no-data-message").remove();
        d3.select("#barchart_depth").html("");
        d3.select("#barchart_mag").html("");

        if (isZoomed) {
            // 將地圖縮放為原始大小
            svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
            // 更新縮放狀態
            isZoomed = false;
        }
        
        setTimeout(function() {
            // 在重新搜索之前移除先前的無搜索結果提示
            d3.select("#map").select(".no-data-message").remove();
            // Remove previous points
            svg.selectAll(".city-circle").remove();

            //continent
            var in_continent_Earthquake = document.getElementById('continent').value;
            var out_continent_Earthquake = document.getElementById('out_continent_Earthquake_id');
            out_continent_Earthquake.textContent = "Continent: " + in_continent_Earthquake;


            //depth
            var in_depth_Earthquake1= $( "#depth-slider-range" ).slider( "values", 0 );
            var in_depth_Earthquake2 = $( "#depth-slider-range" ).slider( "values", 1 );
            var out_depth_Earthquake = document.getElementById('out_depth_Earthquake_id');
            out_depth_Earthquake.textContent = "Depth: " + in_depth_Earthquake1 + "-" + in_depth_Earthquake2 + " km";


            //scale
            var in_scale_Earthquake1= $( "#scale-slider-range" ).slider( "values", 0 );
            var in_scale_Earthquake2 = $( "#scale-slider-range" ).slider( "values", 1 );
            var out_scale_Earthquake = document.getElementById('out_scale_Earthquake_id');
            var mbCheckbox = document.querySelector('input[name="mb"]');
            var mwwCheckbox = document.querySelector('input[name="mww"]');
            var othersCheckbox = document.querySelector('input[name="others"]');
            var mbChecked = mbCheckbox.checked ? mbCheckbox.value +"/" : '';
            var mwwChecked = mwwCheckbox.checked ? mwwCheckbox.value +"/" : '';
            var othersChecked = othersCheckbox.checked ? othersCheckbox.value : '';
            out_scale_Earthquake.textContent = "Scale: " + in_scale_Earthquake1 + "-" + in_scale_Earthquake2 + " "+ mbChecked  + mwwChecked + othersChecked;


            //time
            var date_min = new Date($( "#from" ).datepicker().val());
            var date_max = new Date($( "#to" ).datepicker().val());
            var out_time_Earthquake = document.getElementById('out_time_Earthquake_id');
            out_time_Earthquake.textContent = "Time: " + date_min + "-" + date_max;
            
            //type
            var in_type_Earthquake = document.querySelectorAll('input[type=checkbox]:checked');
            // var out_type_Earthquake = document.getElementById('out_type_Earthquake_id');
            // out_type_Earthquake.textContent = in_type_Earthquake;
            
            //篩選後的結果儲存陣列draw_map

            var str = '';
            var result_id = document.getElementById('result_id');
            // Reset draw_map for each search
            draw_map = [];
            //search data
            for (var i = 0; i < csvdata.length; i++) {

                //continent
                if(in_continent_Earthquake == "Worldwide" || csvdata[i].Continent_full == in_continent_Earthquake){
                    //time
                    var date = new Date(csvdata[i].time);
                    if (date <= date_max && date >= date_min) {
                        //depth
                        if (csvdata[i].depth >= in_depth_Earthquake1 && csvdata[i].depth <= in_depth_Earthquake2) {
                            //scale
                            if (csvdata[i].mag >= in_scale_Earthquake1 && csvdata[i].mag <= in_scale_Earthquake2) {
                                //type
                                for (var j = 0; j < in_type_Earthquake.length; j++) {
                                    if (csvdata[i].magType == in_type_Earthquake[j].value || in_type_Earthquake[j].value == "others"
                                        && csvdata[i].magType != "mb" && csvdata[i].magType != "mww") {

                                        //search target and push into map array
                                        draw_map.push({
                                            id : csvdata[i].id,
                                            latitude: csvdata[i].latitude, 
                                            longitude : csvdata[i].longitude,
                                            time : csvdata[i].time,
                                            Continent_full : csvdata[i].Continent_full,
                                            Continent_simplified : csvdata[i].Continent_simplified,
                                            Country : csvdata[i].Country,
                                            depth : csvdata[i].depth,
                                            mag : csvdata[i].mag,
                                            magType : csvdata[i].magType,
                                            nst : csvdata[i].nst,
                                            gap : csvdata[i].gap,
                                            dmin : csvdata[i].dmin,
                                            rms : csvdata[i].rms,
                                            place : csvdata[i].place,
                                            magNst : csvdata[i].magNst,
                                            On_the_sea : csvdata[i].On_the_sea
                                        });

                                    }
                                }
                            }
                        }
                    }
                }

                // Add a scale for bubble size
                const z = d3.scaleLinear()
                .domain([4, 9.5])
                .range([ 4, 30]);

                // Draw the cities as circles
                svg.selectAll(".city-circle")
                    // .data(cities)           //初始化dot才開
                    .data(draw_map)             //redraw讀入的資料改為這個陣列的
                    .enter()
                    .append("circle")
                    .attr("class", "city-circle")
                    .attr("cx", function(d) {
                        return projection([d.longitude, d.latitude])[0];
                    })
                    .attr("cy", function(d) {
                        return projection([d.longitude, d.latitude])[1];
                    })
                    .attr("r", d => z(d.mag))
                    .attr("fill", "rgba(239,35,60,0.5)")
                    .sort((a, b) => d3.descending(a.mag, b.mag))    //讓小泡泡浮在大泡泡上面
                    
                // Hover circle
                .on("mouseenter", function(){  
                                                            
                    d3.select(this).attr("fill", "rgba(69,123,157,0.8)");
                    const selectObj = d3.select(this).data();
                    
                    tooltip
                        .transition()
                        .duration(200)
                        .style('opacity', 1)
                    tooltip
                        .html(`
                        <div class="tooltip-text">
                        <h5>Earthquake NO.：${selectObj[0].id}</h5>
                        <p>
                            Continent_full：${selectObj[0].Continent_full}</br>
                            Continent_simplified：${selectObj[0].Continent_simplified}</br>
                            Country：${selectObj[0].Country}</br>
                            Time：${selectObj[0].time}</br>
                            Latitude：${selectObj[0].latitude}</br>
                            Longitude：${selectObj[0].longitude}</br>
                            Depth：${selectObj[0].depth}Km</br>
                            mag：${selectObj[0].mag}</br>
                            magType：${selectObj[0].magType}</br>
                            nst：${selectObj[0].nst}</br>
                            gap：${selectObj[0].gap}</br>
                            dmin：${selectObj[0].dmin}</br>
                            rms：${selectObj[0].rms}</br>
                            place：${selectObj[0].place}</br>
                            magNst：${selectObj[0].magNst}</br>
                            On_the_sea：${selectObj[0].On_the_sea}</br>
                        </p>
                        <div>
                        `)
                        .style("left", (event.x+50) + "px")
                        .style("top", (event.y-100) + "px")
                        .style("background-color", "rgba(56, 92, 125, 0.9)")
                        .style("border", "solid")
                        .style("border-width", "1px")
                        .style("border-radius", "5px")
                        .style("padding", "10px")
                        .select(".tooltip-text")

                    //增加與長條圖連動的功能
                    var name = d3.select(this).data()[0].id;        // 透過這樣取得ID
                        d3.selectAll("rect").each(function(d,i){
                            if(d.id == name)
                                d3.select(this).attr("fill","rgba(69,123,157,0.8)");
                        })
                    
                })
            .on("mouseleave ", function(){
                d3.select(this).attr("fill", "rgba(249,65,68,0.5)");
                var name = d3.select(this).data()[0].id;        // 透過這樣取得ID
                        d3.selectAll("rect").each(function(d,i){
                            if(d.id == name)
                                d3.select(this).attr("fill","rgba(218, 238, 255,0.8)");
                        })
                // 滑鼠離開清空tooltip
                d3.select(".tooltip")
                    .html("")
                    .style('opacity', 0)
                    .style("padding", "0px")
            })
            }
            // 如果沒有篩選出資料，在地圖顯示建議
            if (draw_map.length == 0){
                console.log("no data")
                d3.select("#map")
                    .append("text")
                    .html(`
                        <div class="no-data-message">
                            There's no data that matches the condition you set.</br>
                            Try adjusting the filter.</br>
                            Extending the range is recommended.</br>
                        </div>
                    `)
                    .style("position", "absolute")
                    .style("bottom", "35px")
                    .style("left", "10px")
                    .style("color", "white")
                    .style("font-size", "14px")
            }
        }, 600);
        
        
        //show map array
        console.log(draw_map);
        
      }

});






