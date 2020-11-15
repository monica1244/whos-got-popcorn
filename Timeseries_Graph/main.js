function onYScaleChanged(selVal) {
    //var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
	//var selVal = select.options[select.selectedIndex].value;
    chartScales.y = selVal;
	// Update chart
    updateChart();
    
}

function display_genre(key) {
	svg.append('text')
		.text(key)
		.style('fill', colors[key])
		.style('font-size', '22px')
		.attr('x', chartWidth - 10.5)
		.attr('y', 18)
		.attr('class', 'genre_label');
}

function remove_genre(key) {
	svg.selectAll('.genre_label').remove();
}

function onGenreSelected(key) {
	if (key == 'All') {
		for (let k in dict) {
			dict[k] = 1;
		}
	} else {
	dict[key] = 1;
	}
	updateChart();
}

function onGenreDeleted(key) {
	dict[key] = 0;
	updateChart();
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

var svg = d3.select('.svg1');
//svg.attr('width', window.innerWidth - 300);
//svg.attr('height', window.innerHeight - 400);
//var svg = select('body').append('svg');

// Get layout parameters
var svgWidth = $("#timeline_viz svg").parent().width();
var svgHeight = $("#timeline_viz svg").parent().height();
var vh = svgHeight/36.59;
var padding = {t: 2*vh, r: 2*vh, b: 3*vh, l: 10*vh};

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
		
//var svg2 = d3.select('body').append('svg').attr('width', 5000);
//var svg2 = d3.select('.svg2');
//var legendG = svg2.append('g')
   //.attr('transform', 'translate('+[180, padding.t]+')');

var dict = new Object();
var colors = new Object();
colors['Action'] = '#09ACB8';
colors['Adventure'] = '#6FA8CF';
colors['Animation'] = '#7781EE';
colors['Comedy'] = '#2E7FB8';
colors['Crime'] = '#3F9372';
colors['Documentary'] = '#73B334';
colors['Drama'] = '#6F837C';
colors['Family'] = '#B9B18F';
colors['Fantasy'] = '#7D6A89';
colors['History'] = '#EA967D';
colors['Horror'] = '#F1A9BB';
colors['Music'] = '#B784DE';
colors['Mystery']='#B74B9C';
colors['Romance'] = '#553E8F';
colors['Science Fiction'] = '#F0624F';
colors['Thriller'] = '#A23041';
colors['War'] = '#713E45';
colors['Western'] = '#E9B650';

//var div = d3.select("body").append("div")
  //          .attr("class", "tooltip")
  //          .style("opacity", 0);

d3.csv('./Timeseries_Graph/tmdb_movies_aggregated.csv', dataPreprocessor).then(function(dataset) {
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

	
	//const tooltip = d3.select("body").append("div")
    //.attr("class", "tooltip")
    //.style("opacity", 0)
    //.style("position", "absolute");
	
	chartScales = {x: 'release_year', y: 'count'};
	var genres = new Set();
	dataset.forEach(function(movie) {
		genres.add(movie.genres);
	});
	Array.from(genres).forEach(function(genre) {
		dict[genre] = 0;
	});
	dict['Action'] = 1;
	dict['Adventure'] = 1;
	dict['Animation'] = 1;
	dict['Comedy'] = 1;
	dict['Crime'] = 1;
	dict['Documentary'] = 1;
	dict['Mystery'] = 1;
	dict['Romance'] = 1;

	updateChart();
});

function updateChart() {
	var selected = [];
	for (let k in dict) {
			if (dict[k] == 1) {
				selected.push(k);
			}
		}
	var movies_filtered = movies.filter(function(d){ return selected.includes(d.genres) ;})
	movies_filtered.columns = movies.columns;

	if (movies_filtered.length == 0) {
		domainMap = {};
		movies.columns.forEach(function(column) {
			/*if(column != "release_year" && column != "genres") {
				domainMap[column] = [(0), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				})];
			}*/
			if(column != "release_year" && column != "genres") {
				if(column == "profit") {
					domainMap[column] = [d3.min(slices, function(c) {
					if(c.id == column) {
						return d3.min(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				}), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				})];
				} else {
				domainMap[column] = [(0), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				})];
				}
			}
		})

		xScale.domain(d3.extent(movies, function(d){
			return d.release_year})).nice();
		yScale.domain(domainMap[chartScales.y]);
	 		
			
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
			
		console.log(slices);

		svg.selectAll(".line").remove();
		svg.selectAll('.point').remove();
		svg.selectAll('.axis_label').remove();

		svg.append('text')
			.text(chartScales.y + " of movies")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', 10.5)
			.attr('y', 10.5)
			.attr('class', 'axis_label');

		svg.append('text')
			.text("release date")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', chartWidth - 5)
			.attr('y', chartHeight - 5)
			.attr('class', 'axis_label');

		slices.forEach(function (item) {
			console.log(item);
			if(item.id == chartScales.y) {
				slice = item;
			}
		});
		var x = 0
		Object.keys(slice.data).forEach(function(key) {
				x = x + 110;


				path = chartG.append("path")
				.datum(slice.data[key])
				.attr("class", function(d) { return "line"; })
				.attr("id", function(d) { return key; })
				.style('stroke', function() { // Add the colours dynamically
		                return colors[key]; })
				.style('stroke-width', 3)
				.style('fill', 'none')
				.attr('opacity', dict[key])
				.attr("d", function(d) { return line(d); });
				//.on('mouseover', function(d) { console.log('test'); })
				//.on('mouseout', function(d) { console.log('test'); });
		});
	}
	else {
		domainMap = {};
		movies_filtered.columns.forEach(function(column) {
			/*if(column != "release_year" && column != "genres") {
				domainMap[column] = [(0), d3.max(slices, function(c) {
					//return c.column;
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							}
						});
					}
				})];
			}*/
			if(column != "release_year" && column != "genres") {
				if(column == "profit") {
					domainMap[column] = [d3.min(slices, function(c) {
					if(c.id == column) {
						return d3.min(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							} 
						});
					}
				}), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							}
						});
					}
				})];
				} else {
				domainMap[column] = [(0), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							}
						});
					}
				})];
				}
			}
		})
		console.log(domainMap[chartScales.y]);
		xScale.domain(d3.extent(movies_filtered, function(d){
			return d.release_year})).nice();
		yScale.domain(domainMap[chartScales.y]);
	 		
			
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
		//var color = d3.scaleOrdinal();
		//color.domain(Array.from(genres)).range(
		//	['#09ACB8', '#6FA8CF', '#7781EE', '#2E7FB8', '#3F9372', '#73B334',
		//	'#6F837C', '#B9B18F', '#EA967D', '#F1A9BB', '#B784DE', '#7D6A89',
		//	'#B74B9C', '#553E8F', '#F0624F', '#A23041', '#713E45', '#E9B650']);
			
		console.log(slices);

		svg.selectAll(".line").remove();
		svg.selectAll('.point').remove();
		svg.selectAll('.axis_label').remove();

		svg.append('text')
			.text(chartScales.y + " of movies")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', 10.5)
			.attr('y', 10.5)
			.attr('class', 'axis_label');

		svg.append('text')
			.text("release date")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', chartWidth - 5)
			.attr('y', chartHeight - 5)
			.attr('class', 'axis_label');

		slices.forEach(function (item) {
			console.log(item);
			if(item.id == chartScales.y) {
				slice = item;
			}
		});
		var x = 0
		Object.keys(slice.data).forEach(function(key) {
			/*legendG.append('text').text(key)
				.attr('x', x > 990 ? x % 990 : x).attr('fill', color(key)).attr('text-anchor', 'middle')
				.attr('y', x > 990 ? 25 : 0).on("click", function(d, i) { 
					dict[key] = (dict[key] == 1) ? 0 : 1;
					updateChart(); });*/
			if (selected.includes(key)) {
				x = x + 110;


				path = chartG.append("path")
				.datum(slice.data[key])
				.attr("class", function(d) { return "line"; })
				.attr("id", function(d) { return key; })
				.style('stroke', function() { // Add the colours dynamically
		                return colors[key]; })
				.style('stroke-width', 3)
				.style('fill', 'none')
				.attr('opacity', dict[key])
				.attr("d", function(d) { return line(d); })
				.on('mouseover', function(d) { highlight_genre(key); display_genre(key);})
				.on('mouseout', function(d) { delight_genre(key); remove_genre(key);});
				
			   /*chartG.selectAll("circles")
		      .data(slice.data[key])
		      .enter()
		      .append("circle")
		        .attr("fill", "red")
		        .attr("stroke", "none")
				.attr('opacity', 0)
		        .attr("cx", function(d) { return xScale(d.date); })
		        .attr("cy", function(d) { return yScale(d.measurement); })
		        .attr("r", 3)
				.on("mouseover", function (d) {
					d3.select(this)
					  .transition()
					  .duration(200)
					  .attr("r", 5)
					  .attr('opacity', dict[key])
					  .style("cursor", "pointer");*/
				  
		                    /*div.transition()
		                        .duration(100)
		                        .style("opacity", dict[key]);
		                    div.html("<p>" + d.measurement + "</p>")
		                        .style("left", (d3.event.pageX) + "px")
		                        .style("top", (d3.event.pageY - 28) + "px");*/
				/*})
				.on("mouseout", function(d) {
					d3.select(this) 
					  .transition()
					  .duration(200)
					  .attr("r", 3)
					  .attr('opacity', 0)
					  .style("cursor", "none");  
				});*/
			}
		});
	}
	
}

function updateChart2(d) {
	var selected = [];
	for (let k in dict) {
			if (dict[k] == 1) {
				selected.push(k);
			}
		}
	//console.log(movies);
	var movies_filtered = movies.filter(function(d){ return selected.includes(d.genres) ;})
	movies_filtered.columns = movies.columns;

	if (movies_filtered.length == 0) {
		domainMap = {};
		movies.columns.forEach(function(column) {
			if(column != "release_year" && column != "genres") {
				if(column == "profit") {
					domainMap[column] = [d3.min(slices, function(c) {
					if(c.id == column) {
						return d3.min(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				}), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				})];
				} else {
				domainMap[column] = [(0), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							return d.measurement + 4; 
						});
					}
				})];
				}
			}
		})

		xScale.domain(d3.extent(movies, function(d){
			return d.release_year})).nice();
		yScale.domain(domainMap[chartScales.y]);
	 		
			
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
			
		console.log(slices);

		svg.selectAll(".line").remove();
		svg.selectAll('.point').remove();
		svg.selectAll('.axis_label').remove();

		svg.append('text')
			.text(chartScales.y + " of movies")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', 10.5)
			.attr('y', 10.5)
			.attr('class', 'axis_label');

		svg.append('text')
			.text("release date")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', chartWidth - 5)
			.attr('y', chartHeight - 5)
			.attr('class', 'axis_label');

		slices.forEach(function (item) {
			console.log(item);
			if(item.id == chartScales.y) {
				slice = item;
			}
		});
		var x = 0
		Object.keys(slice.data).forEach(function(key) {
				x = x + 110;


				path = chartG.append("path")
				.datum(slice.data[key])
				.attr("class", function(d) { return "line"; })
				.attr("id", function(d) { return key; })
				.style('stroke', function() { // Add the colours dynamically
		                return key == d.data.genres ? colors[key] : 'rgba(111, 168, 207,0.1)'; })
				.style('stroke-width', function() { 
		                return key == d.data.genres ? 5.5 : 3; })
				.style('fill', 'none')
				.style('z-index', function() { 
		                return key == d.data.genres ? 4 : 1; })
				.attr('opacity', function() { 
		                if (dict[key] == 1) {
		                	if (d.data.genres == key) {
		                		return 1;
		                	} else {
		                		return 1;
		                	}
		                } else {
		                	return 0;
		                }})
				.attr("d", function(d) { return line(d); });

				if (dict[key] == 1 && key == d.data.genres) {
					y_coord = null;
					if (chartScales.y == 'popularity') {
						y_coord = d.data.popularity;
					} else if (chartScales.y == 'budget') {
						y_coord = d.data.budget;
					} else if (chartScales.y == 'count') {
						y_coord = 1;
					} else if (chartScales.y == 'revenue') {
						y_coord = d.data.revenue;
					} else if (chartScales.y == 'average_rating') {
						y_coord = d.data.vote_average;
					} else if (chartScales.y == 'vote_count') {
						y_coord = vote_count_dic[d.data.id]
					} else if (chartScales.y == 'profit') {
						y_coord = d.data.revenue - d.data.budget;
					}
					if (y_coord > yScale.domain()[1]) {
						y_coord = yScale.domain()[1];
					} else if (y_coord < yScale.domain()[0]) {
						y_coord = yScale.domain()[0];
					} else {
						y_coord = y_coord;
					}
					y_coord = yScale(y_coord);
					console.log(yScale.domain());
					point = chartG.append('circle')
						.attr('cx', xScale(d.data.release_date.substring(0, 4)))
						.attr('cy', y_coord)
						.attr('r', 8)
						.attr('fill', colors[d.data.genres])
						.attr('class', 'point');
				}
		});
	}
	else {
		domainMap = {};
		movies_filtered.columns.forEach(function(column) {
			if(column != "release_year" && column != "genres") {
				if(column == "profit") {
					domainMap[column] = [d3.min(slices, function(c) {
					if(c.id == column) {
						return d3.min(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							}
						});
					}
				}), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							} 
						});
					}
				})];
				} else {
				domainMap[column] = [(0), d3.max(slices, function(c) {
					if(c.id == column) {
						return d3.max(c.values, function(d) {
							if (selected.includes(d.genre)) {
								return d.measurement + 4;
							} 
						});
					}
				})];
				}
			}
		})

		xScale.domain(d3.extent(movies_filtered, function(d){
			return d.release_year})).nice();
		yScale.domain(domainMap[chartScales.y]);
	 		
			
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
		//var color = d3.scaleOrdinal();
		//color.domain(Array.from(genres)).range(
		//	['#09ACB8', '#6FA8CF', '#7781EE', '#2E7FB8', '#3F9372', '#73B334',
		//	'#6F837C', '#B9B18F', '#EA967D', '#F1A9BB', '#B784DE', '#7D6A89',
		//	'#B74B9C', '#553E8F', '#F0624F', '#A23041', '#713E45', '#E9B650']);
			
		console.log(slices);

		svg.selectAll(".line").remove();
		svg.selectAll('.point').remove();
		svg.selectAll('.axis_label').remove();

		svg.append('text')
			.text(chartScales.y + " of movies")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', 10.5)
			.attr('y', 10.5)
			.attr('class', 'axis_label');

		svg.append('text')
			.text("release date")
			.style('fill', 'white')
			.style('font-size', '11px')
			.attr('x', chartWidth - 5)
			.attr('y', chartHeight - 5)
			.attr('class', 'axis_label');

		slices.forEach(function (item) {
			console.log(item);
			if(item.id == chartScales.y) {
				slice = item;
			}
		});
		var x = 0
		Object.keys(slice.data).forEach(function(key) {
			/*legendG.append('text').text(key)
				.attr('x', x > 990 ? x % 990 : x).attr('fill', color(key)).attr('text-anchor', 'middle')
				.attr('y', x > 990 ? 25 : 0).on("click", function(d, i) { 
					dict[key] = (dict[key] == 1) ? 0 : 1;
					updateChart(); });*/
			if (selected.includes(key)) {
				x = x + 110;


				path = chartG.append("path")
				.datum(slice.data[key])
				.attr("class", function(d) { return "line"; })
				.attr("id", function(d) { return key; })
				.style('stroke', function() { // Add the colours dynamically
		                return key == d.data.genres ? colors[key] : 'rgba(111, 168, 207,0.1)'; })
				.style('stroke-width', function() {
		                return key == d.data.genres ? 5.5 : 3; })
				.style('z-index', function() { 
		                return key == d.data.genres ? 4 : 1; })
				.style('fill', 'none')
				.attr('opacity', function() { 
		                if (dict[key] == 1) {
		                	if (d.data.genres == key) {
		                		return 1;
		                	} else {
		                		return 1;
		                	}
		                } else {
		                	return 0;
		                }})
				.attr("d", function(d) { return line(d); });
				if (dict[key] == 1 && key == d.data.genres) {
					y_coord = null;
					if (chartScales.y == 'popularity') {
						y_coord = d.data.popularity;
					} else if (chartScales.y == 'budget') {
						y_coord = d.data.budget;
					} else if (chartScales.y == 'count') {
						y_coord = 1;
					} else if (chartScales.y == 'revenue') {
						y_coord = d.data.revenue;
					} else if (chartScales.y == 'average_rating') {
						y_coord = d.data.vote_average;
					} else if (chartScales.y == 'vote_count') {
						y_coord = vote_count_dic[d.data.id]
					} else if (chartScales.y == 'profit') {
						y_coord = d.data.revenue - d.data.budget;
					}
					if (y_coord > yScale.domain()[1]) {
						y_coord = yScale.domain()[1];
					} else if (y_coord < yScale.domain()[0]) {
						y_coord = yScale.domain()[0];
					} else {
						y_coord = y_coord;
					}
					y_coord = yScale(y_coord);
					point = chartG.append('circle')
						.attr('cx', xScale(d.data.release_date.substring(0, 4)))
						.attr('cy', y_coord)
						.attr('r', 8)
						.attr('fill', colors[d.data.genres])
						.attr('class', 'point');
				}

			}
		});
	}
	
}