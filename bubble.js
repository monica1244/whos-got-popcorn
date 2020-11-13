var svg2 = d3.select("#svg2"),
    margin = 20,
    diameter = +svg2.attr("width"),
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
bubble_color['Fantasy'] = '#EA967D';
bubble_color['History'] = '#F1A9BB';
bubble_color['Horror'] = '#B784DE';
bubble_color['Music'] = '#7D6A89';
bubble_color['Mystery']='#B74B9C';
bubble_color['Romance'] = '#553E8F';
bubble_color['Science Fiction'] = '#F0624F';
bubble_color['Thriller'] = '#A23041';
bubble_color['War'] = '#713E45';
bubble_color['Western'] = '#E9B650';

var nodes = null;
var node = null;
var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

createBubbles('popularity');

function onBubbleScaleChanged(selVal) {
    console.log(selVal);
	svg2.selectAll("circle").remove();
    createBubbles(selVal);
}

function createBubbles(scaleBy) {
	d3.json("data.json").then(function(root) {
	  console.log("hi  "+scaleBy);

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
		  .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
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
		  .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

	  // var text = g.selectAll("text")
	  //   .data(nodes)
	  //   .enter().append("text")
	  //     .attr("class", "label")
	  //     .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
	  //     .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
	  //     .text(function(d) { return d.data.name; });

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

		transition.selectAll("text")
		  .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
		  .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
			.on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
			.on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
	  }

	  function zoomTo(v) {
		var k = diameter / v[2]; view = v;
		node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
		circle.attr("r", function(d) { return d.r * k; });
	  }
	});
}

