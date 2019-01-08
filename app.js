var data;
var cnt = 1; 
var tInterval = 300;

// Continents Colors
var continentColors = {
		"americas": "#95e308",
		"europe": "#066781",
		"asia": "#ffbf66",
		"africa": "#ff5600"
}

// Point radius
function pRadius(r) {
	return Math.max(2, 2 * Math.sqrt(r));
}

// Year is auto-updated every yT seconds
var yT = 5000;

// Transition
var t = d3.transition().duration(3000)

// Margins
var margin = {top:70, right: 100, bottom: 70, left: 70};

// Canvas Size
var canvasWidth = 800;
var canvasHeight = 480;

// Chart Size
var chartWidth = canvasWidth - margin.left - margin.right;
var chartHeight = canvasHeight - margin.top - margin.bottom;
console.log(chartWidth + " x " + chartHeight);

// Format Chart Area
d3.select("#chart-area")
	.style("width", canvasWidth)
	.style("height", canvasHeight);

// Set Canvas
var canvas = d3.select("#chart-area")
	.append("svg")
	.attr("width", canvasWidth)
	.attr("height", canvasHeight);

// Plotting Area
var chartArea = canvas.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top +")");

// Set Year Label (right upper corner)
var yearLabel = chartArea.append("text")
	.attr("x", (chartWidth - margin.right)/2 +40)
	.attr("y", 5)
	.attr("font-size", 70)
	.attr("font-family", "serif")
	.attr("fill", "lightgray")
	.attr("text-anchor", "middle");
	
// X-axis placeholder
var xAxis = chartArea.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0, " + chartHeight + ")");

// X-axis Label
chartArea.append("text") 
	.attr("class", "x-axis-label")
	.attr("x", chartWidth)
	.attr("y", chartHeight - 10)
	.attr("font-size", "11px")
	.attr("font-family", "arial")
	.attr("fill", "gray")
	.attr("text-anchor", "end")
	.text("Income ($)");

// Y-axis placeholder 	
var yAxis = chartArea.append("g")
	.attr("class", "y-axis")

// Y-axis Label
var yLabel = chartArea.append("text") 
	.attr("class", "y-axis-label")
	.attr("x", -190)
	.attr("y", -35)
	.attr("font-size", "20px")
	.attr("font-family", "sans-serif")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)");

// Y - Scale
var y = d3.scaleLinear()
	.range([chartHeight, 0])
	.domain([0, 100]);

// Y - axis
var yAxisCall = d3.axisLeft(y)
  .ticks(5);	
yAxis.call(yAxisCall);

// X - Scale
var x = d3.scaleLog()
	.range([0, chartWidth])
	.domain([100, 120000]);

// X - axis
var xAxisCall = d3.axisBottom(x).tickValues([100, 300, 800, 2000, 5000, 10000, 20000, 40000, 80000])
    .tickFormat( function(d) {return d} );
xAxis.call(xAxisCall);

// Legend 
var legend = chartArea.append("g")
	.attr("transform", "translate(" + 50 + "," + 15 + ")");

var delta = 0;
for ( var cont in continentColors ){
	delta +=20;
	var legendRow = legend.append("g")
		.attr("transform", "translate(0, " + delta + ")");
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", continentColors[cont]);
	
	legendRow.append("text")
		.attr("x", 20)
		.attr("y", 10)
		.attr("font-size", 12)
		.attr("text-anchor", "start")
		.style("text-transform", "capitalize")
		.text(cont)
}

// Tooltips
var tooltip = d3.select("#chart-area").append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("font-size", "12px")
	.style("background-color", "white")
	.style("padding","2px")
	.style("border-radius", "2px")
	.style("visibility", "hidden");

d3.json("data/data.json").then(function(data){
	update( data[0] )

	var animate = setInterval(function(){
		var dset = data[cnt % data.length];
		update(dset);
		cnt += 1;
		/*
		if (cnt == data.length) {
			clearInterval(animate);
		}*/
	}, tInterval)
})

function update(dset) {
	// Year update
	var year = dset["year"];
	yearLabel.text(year);
	
	// Cleaning countries dataset
	var cData = [];
	
	for ( let cntry of dset["countries"] ){
		if ( cntry.income && cntry.life_exp && cntry.population ) {
			cData.push({
				"continent": cntry.continent,
				"country": cntry.country,
				"income": +cntry.income,
				"life_exp": +cntry.life_exp,
				"population": +cntry.population/1000000
			});
		}
	}
	
	cData.sort(function(x, y){
		if(x.population < y.population) {
			return 1;
		}
		else if (x.population > y.population) {
			return -1;
		}
		else return 0;
	});
	
	// Data binding: we bind on country variable
	var points = chartArea.selectAll("circle")
		.data(cData, function(d){
			return d.country;
		});
	
	// Remove old points
	points.exit().remove();
	
	// Update exisiting points
	points
		.attr("cx", function(d, i){
			return x(d.income);
		})
		.attr("cy", function(d, i) {
			return y(d.life_exp);
		})
		.attr("r", function(d){
			return pRadius(d.population) ;
		})
		.style("opacity", 0.85)
		.attr("fill", function(d){
			switch(d.continent) {
			  case "americas":
			      return continentColors["americas"];
			  case "europe":
				  return continentColors["europe"];
			  case "asia":
				  return continentColors["asia"];			  
			  case "africa":
			      return continentColors["africa"];
			  default:
				  return "red";
			}
		})
		.attr("stroke", "black")
	    .on("mouseover", function(d){ 
	    	return tooltip.style("visibility", "visible").text(d.country);
	    })
	    .on("mousemove", function(){ 
	    	return tooltip.style("top", (d3.event.pageY-15)+"px").style("left",(d3.event.pageX+15)+"px");
	    })
	    .on("mouseout", function(){ 
	    	return tooltip.style("visibility", "hidden");
	    });
	
	// Add new points	
	points.enter()	
	.append("circle")
		.attr("cx", function(d, i){
			return x(d.income);
		})
		.attr("cy", function(d, i) {
			return y(d.life_exp);
		})
		.attr("r", function(d){
			return pRadius(d.population) ;
		})
		.style("opacity", 0.85)
		.attr("fill", function(d){
			switch(d.continent) {
			  case "americas":
			      return continentColors["americas"];
			  case "europe":
				  return continentColors["europe"];
			  case "asia":
				  return continentColors["asia"];			  
			  case "africa":
			      return continentColors["africa"];
			  default:
				  return "red";
			}
		})
		.attr("stroke", "black")
	    .on("mouseover", function(d){ 
	    	return tooltip.style("visibility", "visible").text(d.country);
	    })
	    .on("mousemove", function(){ 
	    	return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
	    })
	    .on("mouseout", function(){ 
	    	return tooltip.style("visibility", "hidden");
	    });
}
