// Global functions called when select elements changed

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
	var selVal = select.options[select.selectedIndex].value;
    chartScales.y = selVal;
	// Update chart
    updateChart();
	/*d3.select("#"+selVal)
                    .transition().duration(100)
                    .style("opacity", 0);*/
    
}

// Load data and use this function to process each row
function dataPreprocessor(row) {
    return {
        'release_year': row['release_year'],
        'count': +row['count'],
        'vote_count': +row['vote_count'],
        'budget': +row['budget'],
		'genres': row['genres'],
        'popularity': +row['popularity'],
        'revenue': +row['revenue'],
		'average_rating': +row['average_rating'],
        'profit': +row['profit']
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 60, b: 40, l: 100};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

xAx = chartG.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate('+[0, chartHeight]+')');
yAx = chartG.append('g')
		.attr('class', 'axis');
		
var svg2 = d3.select('body').append('svg').attr('width', 5000);
var legendG = svg2.append('g')
    .attr('transform', 'translate('+[180, padding.t]+')');

var dict = new Object();
genres = new Set();

d3.csv('tmdb_movies_aggregated.csv', dataPreprocessor).then(function(dataset) {
    // **** Your JavaScript code goes here ****

	movies = dataset;
	
	slices = dataset.columns.slice(2).map(function(id) {
        return {
            id: id,
            values: dataset.map(function(d){
                return {
					id: id,
                    date: d.release_year,
					genre: d.genres,
                    measurement: +d[id]
                }
            }),
			data: dataset.map(function(d){
                return {
					id: id,
                    date: d.release_year,
					genre: d.genres,
                    measurement: +d[id]
                }
            }).reduce((r, a) => {
					r[a.genre] = r[a.genre] || [];
					r[a.genre].push(a);
					return r;
				}, {})
        };
    });

	console.log(slices);
	
	xScale = d3.scaleLinear().range([0,chartWidth]);
	yScale = d3.scaleLinear().rangeRound([chartHeight, 0]);

	domainMap = {};

	dataset.columns.forEach(function(column) {
		if(column != "release_year" && column != "genres") {
			domainMap[column] = [(0), d3.max(slices, function(c) {
				if(c.id == column) {
					return d3.max(c.values, function(d) {
						return d.measurement + 4; 
					});
				}
			})];
		}
	})
	
	const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");
	
	chartScales = {x: 'release_year', y: 'budget'};

	dataset.forEach(function(movie) {
		genres.add(movie.genres);
		//dict[key] = (key == "Action" || key == "Adventure" || key == "Animation") 
		//	? true : false;
	});
	Array.from(genres).forEach(function(genre) {
		dict[genre] = (genre == "Action" || genre == "Adventure" || genre == "Animation")
			? 1 : 0;
	});
	console.log(dict);

	updateChart();
});

function updateChart() {

	xScale.domain(d3.extent(movies, function(d){
		return d.release_year})).nice();
	yScale.domain(domainMap[chartScales.y]).nice();
 		
		
	xAx.transition()
		.duration(350)
		.call(d3.axisBottom(xScale));
	yAx.transition()
		.duration(350)
		.call(d3.axisLeft(yScale))
		
	const line = d3.line()
		.x(function(d) { return xScale(d.date); })
		.y(function(d) { return yScale(d.measurement); });

	let id = 0;
	const ids = function () {
		return "line-"+id++;
	}

	//----------------------------LINES-----------------------------//
	var color = d3.scaleOrdinal();
	color.domain(Array.from(genres)).range(
		['#ff9900', '#ff3300', '#ccff33', '#993366', '#99ff33', '#cc0099',
		'#009900', '#ff00ff', '#339933', '#9933ff', '#6600cc', '#00ffff',
		'#669999', '#006699', '#0033cc', '#336699', '#000066', '#993333']);
	console.log(slices);
	/*const lines = chartG.selectAll("lines")
		.data(slices)
		.enter()
		.append("g");

		lines.append("path")
		.attr("class", ids)
		.attr("id", function(d) { return d.id; })
		.attr("d", function(d) { return line(d.values); });*/

	svg.selectAll(".line").remove();

	slices.forEach(function (item) {
		console.log(item);
		if(item.id == chartScales.y) {
			slice = item;
		}
	});
	var x = 0
	Object.keys(slice.data).forEach(function(key) {
		legendG.append('text').text(key)
			.attr('x', x > 990 ? x % 990 : x).attr('fill', color(key)).attr('text-anchor', 'middle')
			.attr('y', x > 990 ? 25 : 0).on("click", function(d, i) { 
				dict[key] = (dict[key] == 1) ? 0 : 1;
				updateChart(); });
		x = x + 110;
		console.log(x)
		console.log(key);
		const path = chartG.append("path")
		.datum(slice.data[key])
		.attr("class", function(d) { return "line"; })
		.attr("id", function(d) { return key; })
		.style('stroke', function() { // Add the colours dynamically
                return color(key); })
		.style('fill', 'none')
		.attr('opacity', dict[key])
		.attr("d", function(d) { return line(d); });
		
		path.selectAll("circles")
		.data(slice.data[key])
		.enter()
		.append("circle")
		.attr("cx", function(d) { return xScale(d.date); })      
		.attr("cy", function(d) { return yScale(d.measurement); })    
		.attr('r', 10)
		.style("opacity", 0)

	//append this
		.on('mouseover', function(d) {
			tooltip.transition()
				.delay(30)
				.duration(200)
				.style("opacity", 1);

			tooltip.html(d.measurement)
			.style("left", (d3.event.pageX + 25) + "px")
			.style("top", (d3.event.pageY) + "px")  
		})

		.on("mouseout", function(d) {      
			tooltip.transition()        
			.duration(100)      
			.style("opacity", 0);   
		});
		
	});

	
}

// Remember code outside of the data callback function will run before the data loads