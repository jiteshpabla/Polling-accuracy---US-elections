
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  //lineSvg = d3.select('#map2');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/us-states.json'),
               d3.csv('data/election_data.csv')])
          .then(function(values){
    
    mapData = values[0];
    //timeData = values[1];
    electionData = values[1];

    for (var i = 0; i < electionData.length; i++) {

      // Grab State Name
      var dataState = electionData[i].state;//data[i].state;

      // Grab data value 
      var dataValue = electionData[i].actual//electionData[i].visited;//data[i].visited;

      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < mapData.features.length; j++)  {
        var jsonState = mapData.features[j].properties.name;

        if (dataState == jsonState) {

        // Copy the data value into the JSON
        // for map 1
        mapData.features[j].properties.actual = dataValue; 
        mapData.features[j].properties.right_wrong = electionData[i].right_wrong;
        mapData.features[j].properties.winner = electionData[i].winner;
        mapData.features[j].properties.projected_winner = electionData[i].projected_winner;

        // for map2
        mapData.features[j].properties.error_TOT = electionData[i].error_TOT;

        // Stop looking through the JSON
        break;
        }
      }
    }

      // map tooltip div
  var tooltip_map_div2 = d3.select("body").append("div")
    .attr("class", "tooltip-map2")
    .style("display", "none");

  tooltip_map_div2.append("text")
    .attr("id", "tooltip-map2-text1");

  tooltip_map_div2.append("br");

  tooltip_map_div2.append("text")
    .attr("id", "tooltip-map2-text2");


    // map tooltip div
  var tooltip_map_div = d3.select("body").append("div")
    .attr("class", "tooltip-map")
    .style("display", "none");

  tooltip_map_div.append("text")
    .attr("id", "tooltip-map-text1");

  tooltip_map_div.append("br");

  tooltip_map_div.append("text")
    .attr("id", "tooltip-map-text2");

  tooltip_map_div.append("br");

  tooltip_map_div.append("text")
    .attr("id", "tooltip-map-text3");

    var scale_map = 900;
   
    drawMap(scale_map, tooltip_map_div, tooltip_map_div2);
    drawMap2(scale_map, tooltip_map_div, tooltip_map_div2);
  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap(scale_map, tooltip_map_div, tooltip_map_div2) {




  // create the map projection and geoPath
  let projection = d3.geoAlbersUsa()
                      .scale(scale_map)
                      //.center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);



  var color = d3.scaleLinear()
        //.range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
        .range(["red", "green"])
        .domain([0,1]);

  
  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .style("fill", function(d) {

    // Get data value
    var value = d.properties.right_wrong;

    if (value) {
    //If value exists…
    return color(value);
    } else {
    //If value is undefined…
    return "rgb(213,222,217)";
    }
  })
    .on('mouseover', function(d,i) {
      //console.log('mouseover on ' + d.properties.name);
      d3.select("#"+d.properties.name+"2")
        .style("stroke", "cyan")
        .style("stroke-width", "4px");
      tooltip_map_div
        .style("display", "inline");
      d3.select(this)
        .style("stroke", "cyan")
        .style("stroke-width", "4px");
      tooltip_map_div2
        .style("display", "inline");
    })
    .on('mousemove',function(d,i) {
      //console.log('mousemove on ' + d.properties.name);
      tooltip_map_div
        //.text("Country: " + d.properties.name)// + "<br />" + "GDP: " + yearData[d.properties.name])
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px");
      tooltip_map_div.select("#tooltip-map-text1")
        .text("State: " + d.properties.name);
      tooltip_map_div.select("#tooltip-map-text2")
        //.text("GDP: " + yearData[d.properties.state_turnout]);
        .text("actual winner: " + d.properties.winner);
      tooltip_map_div.select("#tooltip-map-text3")
        .text("projected winner: " + d.properties.projected_winner);

      tooltip_map_div2
        //.text("Country: " + d.properties.name)// + "<br />" + "GDP: " + mapData[d.properties.name])
        .style("left", (d3.event.pageX+890 + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px");
      tooltip_map_div2.select("#tooltip-map2-text1")
        .text("State: " + d.properties.name);
      tooltip_map_div2.select("#tooltip-map2-text2")
        .text("Cumulative poll error: " + Math.round(d.properties.error_TOT * 100) / 100 + " %");
    })
    .on('mouseout', function(d,i) {
      //console.log('mouseout on ' + d.properties.name);
      d3.select("#"+d.properties.name+"2")
        .style("stroke", "black")
        .style("stroke-width", "1px");
      tooltip_map_div
        .style("display", "none");
      tooltip_map_div
        .style("left", (d3.event.pageX - 34) + "px")
        .style("top", (d3.event.pageY - 12) + "px");
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", "1px");
      tooltip_map_div2
        .style("display", "none");
      tooltip_map_div
        .style("left", (d3.event.pageX - 34) + "px")
        .style("top", (d3.event.pageY - 12) + "px");
    });



        //legend
    var keys_vals = [0, 1]
    var keys_vals_text = ["Incorrectly predicted by polls", "Correctly predicted by polls"]
    mapSvg.append('g').selectAll("myrects")
        .data(keys_vals)
        .enter()
        .append("rect")
        .attr("x", 60)
        .attr("y",  function(d,i){ return lineHeight -70 + i*(20) - (lineMargin.top / 2)} )
        .attr("width", 16)
        .attr("height", 16)
        .style("fill", function(d) { return color(d); } )

    mapSvg.append('g').selectAll("myrects")
        .data(keys_vals_text)
        .enter()
        .append("text")
        .attr("x", 80)
        .attr("y",  function(d,i){ return lineHeight -70 + 8 + i*(20) - (lineMargin.top / 2)} )
        .text( function(d) { return d } )
        .style("font-size", "11px")
        .style("font-family", "sans-serif")
        .attr("alignment-baseline","middle")


        // title
    mapSvg.append("text")             
        .attr("transform",
              "translate(" + (lineWidth/2) + " ," + ( lineMargin.top + 20) + ")")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight",  700)
        .style("text-anchor", "middle")
        .text("States predicted by Polls vs Reality");

    
    
}

function drawMap2(scale_map, tooltip_map_div, tooltip_map_div2) {


  // create the map projection and geoPath
  let projection = d3.geoAlbersUsa()
                      .scale(scale_map)
                      //.center(d3.geoCentroid(mapData))
                      .translate([+lineSvg.style('width').replace('px','')/2,
                                  +lineSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);


  //let mapData = timeData.filter( d => d.Year == year)[0];
  
  // get the min/max GDP values for the selected year
  let extent_err = d3.extent(electionData, function(d) { return d.error_TOT; })
  console.log(extent_err);

  color_error = d3.scaleSequential(d3.interpolateOranges).domain(extent_err);

  
  // draw the map on the #map svg
  let g = lineSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name+"2"})
    .attr('class','countrymap')
    //.style("fill", "red")
    .style('fill', d => {
      let val = +d.properties.error_TOT;
      if(isNaN(val)) 
        return 'white';
      return color_error(val);
    })
    .on('mouseover', function(d,i) {
      //console.log('mouseover on ' + d.properties.name);
      d3.select("#"+d.properties.name)
        .style("stroke", "cyan")
        .style("stroke-width", "4px");
      tooltip_map_div
        .style("display", "inline");
      d3.select(this)
        .style("stroke", "cyan")
        .style("stroke-width", "4px");
      tooltip_map_div2
        .style("display", "inline");
    })
    .on('mousemove',function(d,i) {
      //console.log('mousemove on ' + d.properties.name);
      tooltip_map_div
        //.text("Country: " + d.properties.name)// + "<br />" + "GDP: " + yearData[d.properties.name])
        .style("left", (d3.event.pageX-890 + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px");
      tooltip_map_div.select("#tooltip-map-text1")
        .text("State: " + d.properties.name);
      tooltip_map_div.select("#tooltip-map-text2")
        //.text("GDP: " + yearData[d.properties.state_turnout]);
        .text("actual winner: " + d.properties.winner);
      tooltip_map_div.select("#tooltip-map-text3")
        .text("projected winner: " + d.properties.projected_winner);

      tooltip_map_div2
        //.text("Country: " + d.properties.name)// + "<br />" + "GDP: " + mapData[d.properties.name])
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px");
      tooltip_map_div2.select("#tooltip-map2-text1")
        .text("State: " + d.properties.name);
      tooltip_map_div2.select("#tooltip-map2-text2")
        .text("Cumulative poll error: " + Math.round(d.properties.error_TOT * 100) / 100 + " %");
    })
    .on('mouseout', function(d,i) {
      //console.log('mouseout on ' + d.properties.name);
      d3.select("#"+d.properties.name)
        .style("stroke", "black")
        .style("stroke-width", "1px");
      tooltip_map_div
        .style("display", "none");
      tooltip_map_div2
        .style("left", (d3.event.pageX - 34) + "px")
        .style("top", (d3.event.pageY - 12) + "px");
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", "1px");
      tooltip_map_div2
        .style("display", "none");
      tooltip_map_div2
        .style("left", (d3.event.pageX - 34) + "px")
        .style("top", (d3.event.pageY - 12) + "px");
    })
    /*.on('click', function(d,i) {
      //console.log('clicked on ' + d.properties.name);
      lineSvg.selectAll("*").remove();
      drawLineChart(d.properties.name);
    });*/


    function draw_legend(){
      axisScale = d3.scaleLinear()
        .domain(color_error.domain())
        .range([lineMargin.left - 70, lineInnerWidth - lineMargin.right - 350]);

      axisBottom = g => g
        .attr("class", `x-axis`)
        .attr("transform", `translate(0,${lineInnerHeight + 20})`)
        .call(d3.axisBottom(axisScale)
        .ticks(10)
        .tickSize(-20));

      const defs = lineSvg.append("defs");
      
      const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
      
      linearGradient.selectAll("stop")
        .data(color_error.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: color_error(t) })))
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

      lineSvg.append('g')
        .attr("transform", `translate(0,${lineInnerHeight})`)
        .append("rect")
        .attr('transform', `translate(${lineMargin.left - 70}, 0)`)
        .attr("width", 300)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");

      lineSvg.append('g')
        .call(axisBottom);
      };

    draw_legend();


            // title
    lineSvg.append("text")             
        .attr("transform",
              "translate(" + (lineWidth/2) + " ," + ( lineMargin.top + 20) + ")")
        .attr("font-family", "sans-serif")
        .attr("font-size", "14px")
        .attr("font-weight",  700)
        .style("text-anchor", "middle")
        .text("Actual Polling margins vs Reality");

// legend text
        lineSvg.append("text")             
        //.attr("transform",
        //      "translate(" + (lineWidth/2)-400 + " ," + ( lineHeight - 60) + ")")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .style("text-anchor", "middle")
        .attr("x", + 160)
        .attr("y",  function(d,i){ return lineHeight -30 + 8 + i*(20) - (lineMargin.top / 2)} )
        .text("% Error in Polls");
    

    
}
