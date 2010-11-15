/*	Alvar Hansen
 *
 *	some code:
 *	© 2009 ROBO Design
 * 	http://www.robodesign.ro
 */


var updater1;
var biggest_obj_id = 0;
var updates = 0;
var auto_refresh_canvas = true;
var tool, context;


function drawEllipse(ctx, x, y, w, h, filled) {
	//http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas/2173084#2173084
	x = parseInt(x);
	y = parseInt(y);
	w = parseInt(w);
	h = parseInt(h);
	var kappa = .5522848;
	ox = (w / 2) * kappa, // control point offset horizontal
	oy = (h / 2) * kappa, // control point offset vertical
	xe = x + w,           // x-end
	ye = y + h,           // y-end
	xm = x + w / 2,       // x-middle
	ym = y + h / 2;       // y-middle

	ctx.beginPath();
	ctx.moveTo(x, ym);
	ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	ctx.closePath();
	if( filled ){
		ctx.fill();
	}else{
		ctx.stroke();
	}
}

if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas;

  function init () {
    // Find the canvas element.
    canvas = document.getElementById('pre_image_view');
    if (!canvas) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas.getContext) {
      alert('Error: no canvas.getContext!');
      return;
    }
	 
    // Get the 2D canvas context.
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }

    // Pencil tool instance.
    tool = new tool_pencil();

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
	 
	$("#toolbar").draggable({ handle: '.bar_drager', opacity: 0.35 });
	$("#colorpicker_container").draggable({ handle: '.bar_drager2', opacity: 0.35 });
	$(document).ready(function() {
		$('#colorpicker').farbtastic('#color');
	});
	
	//document.getElementById('pre_image_view').getContext('2d').fillRect(10,10,100,100);
	
	updater1 = setTimeout("refresh_drawing()",100);
  }

  

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    /*if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.//ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }*/
	ev._x = ev.pageX - canvas.offsetLeft;
	ev._y = ev.pageY - canvas.offsetTop

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  init();

}, false); }

// This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  function tool_pencil () {
    var tool = this;
    this.started = false;
	 var points = [];

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
		points[0] = [ ev._x, ev._y ];
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
		context.lineWidth   = parseInt( $("#line_width").val() );
		context.strokeStyle = $("#color").val();
        context.lineTo(ev._x, ev._y);
        context.stroke();
		points[points.length] = [ ev._x, ev._y ];
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
		//send data
		//make string
		var data_str = '';
		for( var i = 0; i < points.length; i++ ){
			data_str += 'p[' + i + '][x]=' + points[i][0] + '&';
			data_str += 'p[' + i + '][y]=' + points[i][1] + '&';
		}
		points = [];
		data_str += 'line_width=' + parseInt( $("#line_width").val() ) + '&';
		data_str += 'color=' + $("#color").val() + '&';
		data_str += 'action=add&type=1&';
		send_data( data_str, function(xml_resp){refresh_drawing();} );
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
    };
  }
  
function tool_rectangle( filled ) {
	var tool = this;
	this.started = false;
	 var points = [];

	this.mousedown = function (ev) {
		points[0] = [ ev._x, ev._y ];
		tool.started = true;
	};
	this.mousemove = function (ev) {
	  if (tool.started) {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.lineWidth   = parseInt( $("#line_width").val() );
		context.strokeStyle = $("#color").val();
		if( filled ){
			context.fillRect( points[0][0], points[0][1], ev._x - points[0][0], ev._y - points[0][1]);
			context.fillStyle   = $("#color").val();
		}else{
			context.strokeRect( points[0][0], points[0][1], ev._x - points[0][0], ev._y - points[0][1]);
		}
	  }
	};

	// This is called when you release the mouse button.
	this.mouseup = function (ev) {
	  if (tool.started) {
		tool.started = false;
		//send data
		//make string
		points[1] = [ ev._x, ev._y ];
		var data_str = '';
		for( var i = 0; i < points.length; i++ ){
			data_str += 'p[' + i + '][x]=' + points[i][0] + '&';
			data_str += 'p[' + i + '][y]=' + points[i][1] + '&';
		}
		points = [];
		data_str += 'line_width=' + parseInt( $("#line_width").val() ) + '&';
		data_str += 'color=' + $("#color").val() + '&';
		data_str += 'action=add&type=';
		if( filled ){
			data_str += '3&';
		}else{
			data_str += '2&';
		}
		send_data( data_str, function(xml_resp){refresh_drawing();} );
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	  }
	};
}

function tool_line () {
var tool = this;
this.started = false;
 var points = [];

// This is called when you start holding down the mouse button.
// This starts the pencil drawing.
this.mousedown = function (ev) {
	points[0] = [ ev._x, ev._y ];
	tool.started = true;
};

// This function is called every time you move the mouse. Obviously, it only 
// draws if the tool.started state is set to true (when you are holding down 
// the mouse button).
this.mousemove = function (ev) {
  if (tool.started) {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.lineWidth   = parseInt( $("#line_width").val() );
	context.strokeStyle = $("#color").val();
	context.beginPath();
	context.moveTo(points[0][0], points[0][1]);
	context.lineTo(ev._x, ev._y);
	context.stroke();
	points[1] = [ ev._x, ev._y ];
  }
};

// This is called when you release the mouse button.
this.mouseup = function (ev) {
  if (tool.started) {
	tool.mousemove(ev);
	tool.started = false;
	//send data
	//make string
	var data_str = '';
	data_str += 'p[' + 0 + '][x]=' + points[0][0] + '&';
	data_str += 'p[' + 0 + '][y]=' + points[0][1] + '&';
	data_str += 'p[' + 1 + '][x]=' + points[1][0] + '&';
	data_str += 'p[' + 1 + '][y]=' + points[1][1] + '&';
	points = [];
	data_str += 'line_width=' + parseInt( $("#line_width").val() ) + '&';
	data_str += 'color=' + $("#color").val() + '&';
	data_str += 'action=add&type=4&';
	send_data( data_str, function(xml_resp){refresh_drawing();} );
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }
};
}

function tool_circle( filled ) {
    var tool = this;
    this.started = false;
	 var points = [];

    this.mousedown = function (ev) {
		points[0] = [ ev._x, ev._y ];
        tool.started = true;
    };
    this.mousemove = function (ev) {
      if (tool.started) {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.lineWidth   = parseInt( $("#line_width").val() );
		context.strokeStyle = $("#color").val();
		if( filled ){
			radius = Math.sqrt( (ev._x - points[0][0])*(ev._x - points[0][0]) + (ev._y - points[0][1])*(ev._y - points[0][1]) );
			context.fillStyle   = $("#color").val();
			context.beginPath();
			context.arc(points[0][0], points[0][1],radius,0,Math.PI*2,true);
			context.closePath();
			context.fill();
		}else{
			radius = Math.sqrt( (ev._x - points[0][0])*(ev._x - points[0][0]) + (ev._y - points[0][1])*(ev._y - points[0][1]) );
			context.beginPath();
			context.arc(points[0][0], points[0][1],radius,0,Math.PI*2,true);
			context.closePath();
			context.stroke();
		}
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.started = false;
		//send data
		//make string
		points[1] = [ ev._x, ev._y ];
		var data_str = '';
		data_str += 'p[' + 0 + '][x]=' + points[0][0] + '&';
		data_str += 'p[' + 0 + '][y]=' + points[0][1] + '&';
		data_str += 'p[' + 1 + '][x]=' + points[1][0] + '&';
		data_str += 'p[' + 1 + '][y]=' + points[1][1] + '&';
		points = [];
		data_str += 'line_width=' + parseInt( $("#line_width").val() ) + '&';
		data_str += 'color=' + $("#color").val() + '&';
		data_str += 'action=add&type=';
		if( filled ){
			data_str += '6&';
		}else{
			data_str += '5&';
		}
		send_data( data_str, function(xml_resp){refresh_drawing();} );
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
    };
  }

function tool_ellipse( filled ) {
    var tool = this;
    this.started = false;
	 var points = [];

    this.mousedown = function (ev) {
		points[0] = [ ev._x, ev._y ];
        tool.started = true;
    };
    this.mousemove = function (ev) {
      if (tool.started) {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.lineWidth   = parseInt( $("#line_width").val() );
		context.strokeStyle = $("#color").val();
		if( filled ){
			context.fillStyle   = $("#color").val();
			drawEllipse( context, points[0][0], points[0][1], ev._x - points[0][0], ev._y - points[0][1], true);
		}else{
			drawEllipse( context, points[0][0], points[0][1], ev._x - points[0][0], ev._y - points[0][1], false);
		}
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.started = false;
		//send data
		//make string
		points[1] = [ ev._x, ev._y ];
		var data_str = '';
		data_str += 'p[' + 0 + '][x]=' + points[0][0] + '&';
		data_str += 'p[' + 0 + '][y]=' + points[0][1] + '&';
		data_str += 'p[' + 1 + '][x]=' + points[1][0] + '&';
		data_str += 'p[' + 1 + '][y]=' + points[1][1] + '&';
		points = [];
		data_str += 'line_width=' + parseInt( $("#line_width").val() ) + '&';
		data_str += 'color=' + $("#color").val() + '&';
		data_str += 'action=add&type=';
		if( filled ){
			data_str += '8&';
		}else{
			data_str += '7&';
		}
		send_data( data_str, function(xml_resp){refresh_drawing();} );
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
    };
}
  
function refresh_drawing(){
	clearTimeout( updater1 );
	send_data( 'action=get_all&start=' + biggest_obj_id, draw_from_data );
}

function clear_drawing(){
	send_data( 'action=clear_all', function(xml_resp){
			var resp = eval( '(' + xml_resp.responseText + ')' );
			refresh_drawing();
		} );
}

function draw_from_data( xml_r ){
	var resp = eval( '(' + xml_r.responseText + ')' );
	var drawings = resp['objects'];
	//console.log( drawings );
	var cont = document.getElementById('imageView').getContext('2d');

	for( var i = 0; i < drawings.length; i++ ){
		if( biggest_obj_id <= drawings[i].id ){
			biggest_obj_id = drawings[i].id;
		}
		if( drawings[i].type_id == 0 ){
			cont.clearRect( 0, 0, cont.canvas.width, cont.canvas.height );
		}else if( drawings[i].type_id == 1 ){
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.beginPath();
			cont.moveTo( drawings[i].points[0].x, drawings[i].points[0].y );
			for( var n = 1; n < drawings[i].points.length; n++ ){
				cont.lineTo( drawings[i].points[n].x, drawings[i].points[n].y );
			}
				cont.stroke();
		}else if( drawings[i].type_id == 2 ){
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.strokeRect(drawings[i].points[0].x,  
							drawings[i].points[0].y, 
							drawings[i].points[1].x - drawings[i].points[0].x, 
							drawings[i].points[1].y - drawings[i].points[0].y);
		}else if( drawings[i].type_id == 3 ){
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.fillStyle   = drawings[i].color;
			cont.fillRect(drawings[i].points[0].x,  
							drawings[i].points[0].y, 
							drawings[i].points[1].x - drawings[i].points[0].x, 
							drawings[i].points[1].y - drawings[i].points[0].y);
		}else if( drawings[i].type_id == 4 ){
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.beginPath();
			cont.moveTo( drawings[i].points[0].x, drawings[i].points[0].y );
			cont.lineTo( drawings[i].points[1].x, drawings[i].points[1].y );
			cont.stroke();
		}else if( drawings[i].type_id == 5 ){
			radius = Math.sqrt( (drawings[i].points[1].x - drawings[i].points[0].x )*(drawings[i].points[1].x - drawings[i].points[0].x )
					+ (drawings[i].points[1].y - drawings[i].points[0].y )*(drawings[i].points[1].y - drawings[i].points[0].y ) );
			
			
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.beginPath();
			cont.arc( drawings[i].points[0].x, drawings[i].points[0].y,radius,0,Math.PI*2,true);
			cont.closePath();
			cont.stroke();
		}else if( drawings[i].type_id == 6 ){
			radius = Math.sqrt( (drawings[i].points[1].x - drawings[i].points[0].x )*(drawings[i].points[1].x - drawings[i].points[0].x )
					+ (drawings[i].points[1].y - drawings[i].points[0].y )*(drawings[i].points[1].y - drawings[i].points[0].y ) );
			
			
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.fillStyle   = drawings[i].color;
			cont.beginPath();
			cont.arc( drawings[i].points[0].x, drawings[i].points[0].y,radius,0,Math.PI*2,true);
			cont.closePath();
			cont.fill();
		}else if( drawings[i].type_id == 7 ){
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.fillStyle   = drawings[i].color;
			drawEllipse( 	cont, 
							drawings[i].points[0].x,  
							drawings[i].points[0].y, 
							drawings[i].points[1].x - drawings[i].points[0].x, 
							drawings[i].points[1].y - drawings[i].points[0].y, 
							false );
			console.log( 'ellipse' );
		}else if( drawings[i].type_id == 8 ){
			cont.lineWidth   = drawings[i].line_width;
			cont.strokeStyle = drawings[i].color;
			cont.fillStyle   = drawings[i].color;
			drawEllipse( 	cont, 
							drawings[i].points[0].x,  
							drawings[i].points[0].y, 
							drawings[i].points[1].x - drawings[i].points[0].x, 
							drawings[i].points[1].y - drawings[i].points[0].y, 
							true );
		}
	}
	updates ++;
	document.getElementById('deb_container').innerHTML = 'Updates: ' + updates;
	if( auto_refresh_canvas ){
		updater1 = setTimeout("refresh_drawing()",1000);
	}
}

function toggle_auto_refresh_canvas(){
	if( auto_refresh_canvas ){
		auto_refresh_canvas = false;
	}else{
		auto_refresh_canvas = true;
		updater1 = setTimeout("refresh_drawing()",100);
	}
}

function increase_line_width(){
	//console.log( $("#line_width").val() );
	$("#line_width").val( ( parseInt ( $("#line_width").val() ) + 1 ) + 'px' );
}

function decrease_line_width(){
	//console.log( $("#line_width").val() );
	$("#line_width").val( ( parseInt( $("#line_width").val() ) - 1) + 'px' );
}

function select_tool( selected_tool ){
	$('.tool').removeClass('selected');
	if( selected_tool == 'pencil' ){
		tool = new tool_pencil();
		$('.tool.pencil').addClass('selected');
	}else if( selected_tool == 'rectangle' ){
		tool = new tool_rectangle(false);
		$('.tool.rectangle').addClass('selected');
	}else if( selected_tool == 'rectangle_filled' ){
		tool = new tool_rectangle(true);
		$('.tool.rectangle_filled').addClass('selected');
	}else if( selected_tool == 'line' ){
		tool = new tool_line();
		$('.tool.line').addClass('selected');
	}else if( selected_tool == 'circle' ){
		tool = new tool_circle(false);
		$('.tool.circle').addClass('selected');
	}else if( selected_tool == 'circle_filled' ){
		tool = new tool_circle(true);
		$('.tool.circle_filled').addClass('selected');
	}else if( selected_tool == 'ellipse' ){
		tool = new tool_ellipse(false);
		$('.tool.ellipse').addClass('selected');
	}else if( selected_tool == 'ellipse_filled' ){
		tool = new tool_ellipse(true);
		$('.tool.ellipse_filled').addClass('selected');
	}
}

function handler( xml_request, handl ) {
	if(xml_request.readyState == 4 && xml_request.status == 200) {
		// so far so good
		var isMSIE = /*@cc_on!@*/false;
		if( handl ){
			handl(xml_request);
		}
		////console.log( xml_request.responseText );
	}
}

function send_data( data_string, handl ){
	var url = 'actions.php';// + data_string;
	//console.log( url );
	var xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		handler( this, handl );
	};
	if(xhttp.overrideMimeType){
		xhttp.overrideMimeType( 'text/x-json; charset=UTF8' ); 
	}
	xhttp.open( 'POST', url, true );
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.setRequestHeader("Content-length", data_string.length);
	xhttp.setRequestHeader("Connection", "close");
	xhttp.send( data_string );
}

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

