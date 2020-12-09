var scatterplotSvg;
var beeswarmSvg;
var width;
var height;
var innerHeight;
var innerWidth;
var data;
var tooltip;

document.addEventListener('DOMContentLoaded', function() {
  scatterplotSvg = d3.select('#scatterplot');
  beeswarmSvg = d3.select('#beeswarmchart');

  tooltip = d3.select("body").append("div")
              .attr("id","tooltip")
              .style("position", "absolute")
              .style("padding-left", "10px")
              .style("padding-right", "10px")
              .style("text-align", "center")
              .style("font-size", "12px")
              .style("opacity", ".9")
              .style("background", "#FFFFFF")
              .style("border", "1px solid")
              .style("border-radius", "8px")
              .style("pointer-events", "none")
              .style("display", "none");

  Promise.all([d3.csv('data/faces.csv')])
          .then(function(values){  
      data = values[0];
      drawScatterplot(data);
      drawBeeswarm(data);
  })
});

function drawScatterplot(data) {
  var margin = {top: 20, right: 40, bottom: 40, left: 60};
  width = +scatterplotSvg.style('width').replace('px','');
  height = +scatterplotSvg.style('height').replace('px','');
  innerWidth = width - margin.left - margin.right;
  innerHeight = height - margin.top - margin.bottom;

  scatterplotSvg.append("svg")
    .attr("width", innerWidth + margin.left + margin.right)
    .attr("height", innerHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.l; }))
    .range([ 30, innerWidth ]);
  
  scatterplotSvg.append("g")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(d3.axisBottom(x)
    .tickSizeOuter(0));

  var y = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return new Date(d.date); }))
    .range([ innerHeight, 25]);
  
  scatterplotSvg.append("g")
    .attr("transform", "translate(25," + 0 + ")")
    .call(d3.axisRight(y)
      .tickSize(0))
    .call(g => g.select(".domain")
        .remove())
    .call(g => g.selectAll(".tick text")
        .attr("x", 4)
        .attr("dy", -2));

  scatterplotSvg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", 10)
    .attr("cx", function(d) { return x(d.l); })
    .attr("cy", function(d) { return y(new Date(d.date)); })
    .style("opacity", 0.9)
    .style("fill", function (d) { return d.tone })
    .on('mouseover', function(d,i) {
          d3.select('#tooltip')
            .style("display", "inline")
    })
    .on('mousemove',function(d,i) {
          d3.select('#tooltip')
            .html("<p>"+d.model+"</p>")
            .style("color", d.tone)
            .style("left", (d3.event.pageX+20) + "px")
            .style("top", (d3.event.pageY-20) + "px");
    })
    .on('mouseout', function(d,i) {
          d3.select('#tooltip')
            .style("display", "none");
    });

  //lighter/darker labels for x-axis
  scatterplotSvg.append("text")             
      .attr("transform", "translate(" + (innerWidth-20) + " ," + (innerHeight + margin.top + 15) + ")")
      .attr("font-size","11px")
      .style("letter-spacing","5px")
      .style("text-anchor", "middle")
      .text("Lighter");

  scatterplotSvg.append("text")             
      .attr("transform", "translate(" + 50 + " ," + (innerHeight + margin.top + 15) + ")")
      .attr("font-size","11px")
      .style("letter-spacing","5px")
      .style("text-anchor", "middle")
      .text("Darker");

  //year label for y-axis
  scatterplotSvg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x",0 - (innerHeight / 2))
      .attr("dy", "1em")
      .attr("font-size","11px")
      .style("letter-spacing","5px")
      .style("text-anchor", "middle")
      .text("Years");
}

function drawBeeswarm(data) {  
  width = +beeswarmSvg.style('width').replace('px','');
  height = +beeswarmSvg.style('height').replace('px','');
  innerWidth = width - 30;

  beeswarmSvg.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform","translate(" + 25 + "," + 0 + ")");

  var x = d3.scaleLinear()
      .range([30, innerWidth])  
      .domain(d3.extent(data, function(d) { return d.l; }));
  
  function tick(){
    d3.selectAll('.circles')
      .attr('cx', function(d){return d.x})
      .attr('cy', function(d){return d.y})
  }

  beeswarmSvg.selectAll('.circles')
    .data(data)
    .enter()
    .append('circle')
    .classed('circles', true)
    .attr('r', 10)
    .attr('cx', function(d){return x(d.l);})
    .attr('cy', function(){return height/2;})
    .style("fill", function (d) { return d.tone })
    .on('mouseover', function(d,i) {
          d3.select('#tooltip')
            .style("display", "inline")
    })
    .on('mousemove',function(d,i) {
          d3.select('#tooltip')
            .html("<p>"+d.model+"</p>")
            .style("color", d.tone)
            .style("left", (d3.event.pageX - 80) + "px")
            .style("top", (d3.event.pageY + 20) + "px");
    })
    .on('mouseout', function(d,i) {
          d3.select('#tooltip')
            .style("display", "none");
  });

  var sim = d3.forceSimulation(data)
    .force('x', d3.forceX(function(d){return x(d.l)}).strength(0.5))
    .force('y', d3.forceY(height/2).strength(0.05)) 
    .force('collide', d3.forceCollide(11))
    .alphaDecay(0)
    .alpha(0.12)
    .on('tick', tick); 

  setTimeout(function(){ sim.alphaDecay(0.1); }, 12000);  

  //lighter/darker labels for x-axis
  beeswarmSvg.append("text")             
      .attr("transform", "translate(" + (width-70) + " ," + (height - 100) + ")")
      .attr("font-size","12px")
      .style("letter-spacing","5px")
      .style("text-anchor", "middle")
      .text("Lighter");

  beeswarmSvg.append("text")             
      .attr("transform", "translate(" + 70 + " ," + (height - 100) + ")")
      .attr("font-size","12px")
      .style("letter-spacing","5px")
      .style("text-anchor", "middle")
      .text("Darker");
}