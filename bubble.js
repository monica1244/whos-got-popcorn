var svg2 = d3.select("#svg2"),
    margin = 10,
    diameter = 65*vh,
    g = svg2.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var bubble_color = new Object();
bubble_color['Action'] = '#09ACB8';
bubble_color['Adventure'] = '#6FA8CF';
bubble_color['Animation'] = '#7781EE';
bubble_color['Comedy'] = '#2E7FB8';
bubble_color['Crime'] = '#3F9372';
bubble_color['Documentary'] = '#73B334';
bubble_color['Drama'] = '#6F837C';
bubble_color['Family'] = '#B9B18F';
bubble_color['Fantasy'] = '#7D6A89';
bubble_color['History'] = '#EA967D';
bubble_color['Horror'] = '#F1A9BB';
bubble_color['Music'] = '#B784DE';
bubble_color['Mystery']='#B74B9C';
bubble_color['Romance'] = '#553E8F';
bubble_color['Science Fiction'] = '#F0624F';
bubble_color['Thriller'] = '#A23041';
bubble_color['War'] = '#713E45';
bubble_color['Western'] = '#E9B650';

var nodes = null;
var node = null;
var actors = [];
var genre = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Mystery', 'Romance'];
var director = [];
var production = [];
var keywords = [];

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);
var highlight = 0;
var highlight_color = "";
var scale_option = "popularity";

createBubbles('popularity');

function onBubbleScaleChanged(selVal) {
    console.log(selVal);
	svg2.selectAll("circle").remove();
	scale_option = selVal;
    createBubbles(selVal);
}

function createBubbles(scaleBy){
	
	  svg2.selectAll("g > *").remove(); 
	  
	  d3.json("data.json").then(function(root) {
		  console.log("Scale "+scaleBy);

		  // apply filter
			  for(c in root.children) {
				root.children[c].children = root.children[c].children.filter(function( obj ) {
					
					g_flag = false;
					a_flag = false;
					d_flag = false;
					p_flag = false;
					k_flag = false;
					if(parseInt(obj.release_date.split('-')[0]) >= 1980) {
						if(genre.length > 0) {
							if(genre.includes(obj.genres)) {
								g_flag = true;
							}
						} else if(genre.length == 0) {
							g_flag = true;
						}
						if(actors.length > 0 &&  actors.length <= 3) {
							if(actors.every(i => obj.cast.includes(i))) {
								a_flag = true;
							}
						} else if(actors.length == 0){
							a_flag = true;
						}
						if(director.length == 1) {
							if(obj.director == director[0]) {
								d_flag = true;
							}
						}else if(director.length == 0){
							d_flag = true;
						}
						if(production.length > 0) {
							if(production.every(i => obj.production_companies.includes(i))) {
								p_flag = true;
							}
						} else if(production.length == 0) {
							p_flag = true;
						}
						if(keywords.length > 0) {
							if(keywords.every(i => obj.keywords.includes(i))) {
								k_flag = true;
							}
						}else if(keywords.length == 0) {
							k_flag = true;
						}
					}
					
					if(g_flag && a_flag && d_flag && p_flag && k_flag) {
						return obj;
					}
				});
			  }	
			  
			  root.children = root.children.filter(function( obj ) {
					return obj.children.length != 0;
				});
		  
		  
		var div = d3.select("body").append("div")
	        .attr("class", "tooltip-title")
	        .style("opacity", 0);

		root = d3.hierarchy(root)
			  .sum(function(d) { 
				if(scaleBy == 'popularity') {return d.popularity;}
				else if(scaleBy == 'revenue') {return d.revenue;}
				else if(scaleBy == 'budget') {return d.budget;}
				else if(scaleBy == 'rating') {return d.vote_average;}
				else { return d.popularity;}
			  })
			  .sort(function(a, b) { return b.value - a.value; });
		  
		  var focus = root,
			  nodes = pack(root).descendants(),
			  view;

		  var circle = g.selectAll("circle")
			.data(nodes)
			.enter().append("circle")
			  .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf"+" "+d.data.id : "node node--root"; })
			  .style("fill", function(d) {
			   if(d.children){
					return "#0b0817"
				}else{
					if(d.data.genres){
						if(d.data.genres in bubble_color){
							return bubble_color[d.data.genres];
						}
						else{
							return '#09ACB8';
						}
					}else {
						return '#09ACB8';
				}}})
			  .on("click", function(d) {
			   if (focus !== d) zoom(d), d3.event.stopPropagation(); 
			   if (!d.children){
			   	d3.select("#overlay_info").style("width", "40.15%");
			   	d3.select(".info_title").text(d.data.title);
			   	d3.select(".info_overview").text(d.data.overview);
			   	if(d.data.tagline=="None"){
			   		d3.select(".info_tagline").text(d.data.title);
			   	}
			   	else{
			   		d3.select(".info_tagline").text(d.data.tagline);
			   	}
			   	var dur = runtime_dic[d.data.id]
			   	if(dur>0){
				   	var hours = Math.floor(dur/60);
				   	var mins = dur%60;
				   	var st = d.data.release_date.split('-')[0];
				   	d3.select(".info_bar").text(st.concat(" | ",d.data.genres," | ",hours," HR ",mins," MIN"));
				}
				else{
					var st = d.data.release_date.split('-')[0];
				   	d3.select(".info_bar").text(st.concat(" | ",d.data.genres));
				}
			   }
			   })
			  .on("mouseover", function(d) {
			  		if (!d.children){
			  		 	updateChart2(d);
			  		 	d3.select(this).transition()
		               .duration('50')
		               .attr('opacity', '.85');
		          		div.transition()
		               .duration(50)
		               .style("opacity", 1);
		               div.html(d.data.title)
		               .style("left", (d3.event.pageX + 10) + "px")
               			.style("top", (d3.event.pageY + 5) + "px");
			  		}
			  	})
			  .on("mouseout", function(d) {if (!d.children){
			   updateChart();
               d3.select(this).transition()
               .duration('50')
               .attr('opacity', '1');
		          div.transition()
		               .duration('50')
		               .style("opacity", 0);
			}});

		  var text = g.selectAll("text")
			.data(nodes)
			.enter().append("text")
			  .attr("class", "label")
			  .style("fill-opacity", function(d) { return d.children ? 1 : 0; })
			  .style("display", function(d) { return d.children ? "inline" : "none"; })
			  .text(function(d) { return d.data.title; });

		  var node = g.selectAll("circle,text");

		  svg2
			  .on("click", function() { zoom(root); });

		  zoomTo([root.x, root.y, root.r * 2 + margin]);

		  function zoom(d) {
			var focus0 = focus; focus = d;

			var transition = d3.transition()
				.duration(d3.event.altKey ? 7500 : 750)
				.tween("zoom", function(d) {
				  var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
				  return function(t) { zoomTo(i(t)); };
				});

			// transition.selectAll("text")
			//   .filter(function(d) { return d.parent === focus; })
			//   .style("fill-opacity", function(d) { return d === focus ? 1 : 0; })
			// 	.on("start", function(d) { if (d === focus && d.parent != root) this.style.display = "inline"; })
			// 	.on("end", function(d) { if (d !== focus) this.style.display = "none"; });
		 //  }
		  }

		  function zoomTo(v) {
			var k = diameter / v[2]; view = v;
			node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
			circle.attr("r", function(d) { return d.r * k; });
		  }
	  
	  });
}
	  
function highlight_genre(genre){
	highlight = 1;
	highlight_color = genre;
	svg2.selectAll("circle").style("fill", function(d) {
		   if(d.children){
		  		return "#0b0817"
		  	}else{
		  		if(!highlight){
			  		if(d.data.genres){
			  			if(d.data.genres in bubble_color){
			  				return bubble_color[d.data.genres];
			  			}
			  			else{
			  				return '#09ACB8';
			  			}
			  		}else {
			  			return '#09ACB8';
		  			}
		  		}
		  		else{
		  			if(d.data.genres){
		  				if(d.data.genres in bubble_color){
		  					if(d.data.genres == highlight_color){
		  						return bubble_color[d.data.genres];
		  					}
		  				}
		  			}
		  			return 'rgba(16, 57, 95,0.5)';
		  		}
	  		}})
}

function delight_genre(genre){
	highlight = 0;
	svg2.selectAll("circle").style("fill", function(d) {
		   if(d.children){
		  		return "#0b0817"
		  	}else{
		  		if(!highlight){
			  		if(d.data.genres){
			  			if(d.data.genres in bubble_color){
			  				return bubble_color[d.data.genres];
			  			}
			  			else{
			  				return '#09ACB8';
			  			}
			  		}else {
			  			return '#09ACB8';
		  			}
		  		}
		  		else{
		  			if(d.data.genres){
		  				if(d.data.genres in bubble_color){
		  					if(d.data.genres == highlight_color){
		  						return bubble_color[d.data.genres];
		  					}
		  				}
		  			}
		  			return 'rgba(16, 57, 95,0.5)';
		  		}
	  		}})
}

