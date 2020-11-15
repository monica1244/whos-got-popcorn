console.log("Enter");

function filterBy(category, value){
	console.log(category, value);
	if(category == 'Genre') {
		genre.push(value);
	} else if(category == 'Actor') {
		actors.push(value);
	} else if(category == 'Director') {
		director.push(value);
	} else if(category == 'Production Company') {
		production.push(value);
	} else if(category == 'Keyword') {
		keywords.push(value);
	}
	createBubbles('popularity');
	
}

function removeFilter(category, value){
	console.log(category, value);
	if(category == 'Genre') {
		genre = genre.filter(function(item) {
			return item !== value
		})
	} else if(category == 'Actor') {
		actors = actors.filter(function(item) {
			return item !== value
		})
	} else if(category == 'Director') {
		director = director.filter(function(item) {
			return item !== value
		})
	} else if(category == 'Production Company') {
		production = production.filter(function(item) {
			return item !== value
		})
	} else if(category == 'Keyword') {
		keywords = keywords.filter(function(item) {
			return item !== value
		})
	}
	createBubbles('popularity');
}
