$(document).ready(function(){
	var $btn = $("#btn"),
		$list = $("#list"),
		clicks = ASQ.react.of(),
		msgs = ASQ.react.of(),
		latest;

	$btn.click(function(evt){
		// push click event messages into stream
		clicks.push(evt);
	});

	// sample clicks stream
	setInterval(function(){
		if (latest) {
			msgs.push("clicked!");
			latest = null;
		}
	},1000);

	// subscribe to click stream
	clicks.val(function(evt){
		latest = evt;
	});

	// subscribe to sampled message stream
	msgs.val(function(msg){
		$list.append($("<div>" + msg + "</div>"));
	});
});
