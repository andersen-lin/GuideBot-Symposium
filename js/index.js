 /**
  * Copyright (c) 2015, Austin Meyers (AK5A) & Mark Silliman
  * Copyright (c) 2018, Scott Lin & Andersen Lin
  * All rights reserved.
  * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  *
  * http://learn.turtlebot.com/
  *
  * @file The interaction part of this web page, this file is part of Guidebot project
  *       This program is free software, is licensed under Apache 2.0
  * @author Mark Silliman
  * @author Scott Lin
  * @author Andersen Lin
  * @version v1.4.1
  */

myDomain = "http://" + window.location.host;
var map = document.getElementById('map');
var ctx = map.getContext("2d");
var img = new Image();
var timer;
img.src = '';

/**
 * Configure the initial interface once this page finish loading
 * 
 * @event
 * @param {number} x is the abscissa of the red ball
 * @param {number} y is the ordinate of the red ball
 * @param {number} mapx is the abscissa of the yellow ball
 * @param {number} mapy is the ordinate of the yellow ball
 */
window.onload = function () {
    
    document.querySelector('#setCoordsView').style.display = 'block';
    document.querySelector('#orderView').style.display = 'none';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.querySelector('#canvas_on').style.display = 'block';
    document.querySelector('#pinch_on').style.display = 'none';
    destination = 'empty';
    localStorage['flag'] = 0;
    localStorage['x'] = 2.59;
    localStorage['y'] = 3.41;
    localStorage['mapx'] = 2.59;
    localStorage['mapy'] = 3.41;
    localStorage['canx'];
    localStorage['cany'];
    localStorage['canmapx'];
    localStorage['canmapy'];
}

/**
 * Get the mouse coordinate and draw the red ball as target position
 * 
 * @param {Object} event includes returned coordinate from the 'mousedown' listener
 */
function mousedownCallback(event) {
        M.toast({html: 'I am a toast!'});
    var x = event.point.x;
    var y = event.point.y;
    var x_new = localStorage['touchx'];
    var y_new = localStorage['touchy'];
    var ratio = localStorage['ratio'];
    // modify the x and y to make it fit the current:
    // ratio, touchx, touchy
    
    console.log("Update X: " + x + ", " + "Update Y: " + y);

    // if there is pinch-zoom, means there exists touchx/touchy/ratio
    if ((ratio >= 1.95) && (ratio <= 2.05)) {
        // convert the click coords to the real ori can coords for push use
        localStorage['canx'] = (1 / ratio) * x + x_new * (1 - (1 / ratio));
        localStorage['cany'] = (1 / ratio) * y + y_new * (1 - (1 / ratio));
        localStorage['canmapx'] = (1 / ratio) * (localStorage['mapx'] * 4 + 84.28) + x_new * (1 - (1 / ratio));
        localStorage['canmapy'] = (1 / ratio) * (localStorage['mapy'] * (-4) + 172) + y_new * (1 - (1 / ratio));

        localStorage['x'] = (localStorage['canx'] - 84.28) / 4;
        localStorage['y'] = (localStorage['cany'] - 172.16) / -4;
        
        // convert mapx to canmapx, should again convert to the current container
        drawMap(x, y, 
                ((4 * localStorage['mapx'] + 84.28) - x_new * (1 - (1 / ratio))) * ratio, 
                ((-4 * localStorage['mapy'] + 172.16) - y_new * (1 - (1 / ratio))) * ratio
               );
    } else if (ratio == 1) {
        localStorage['x'] = (x - 84.28) / 4;
        localStorage['y'] = (y - 172.16) / -4;
        
        drawMap(x, y, 4 * localStorage['mapx'] + 84.28, -4 * localStorage['mapy'] + 172.16);
    } else { // other ratios except 1 and 2, generated by pinching
        localStorage['canx'] = (1 / ratio) * x + x_new;
        localStorage['cany'] = (1 / ratio) * y + y_new;
        localStorage['canmapx'] = (1 / ratio) * (localStorage['mapx'] * 4 + 84.28) + x_new;
        localStorage['canmapy'] = (1 / ratio) * (localStorage['mapy'] * (-4) + 172) + y_new;

        localStorage['x'] = (localStorage['canx'] - 84.28) / 4;
        localStorage['y'] = (localStorage['cany'] - 172.16) / -4;
        
        drawMap(x, y, 
                ((4 * localStorage['mapx'] + 84.28) - x_new) * ratio, 
                ((-4 * localStorage['mapy'] + 172.16) - y_new) * ratio
               );
    }
    
    // document.getElementById('x').innerHTML = parseFloat(localStorage['x']).toFixed(3);
    // document.getElementById('y').innerHTML = parseFloat(localStorage['y']).toFixed(3);;
};

// Create a global object with element and function we need
window.tool = {};
window.tool.captureMouse = function (element, mousedownCallback) {
    
    /**
     * Subtract the offset position of the current mouse coordinate from that of the element
     *
     * @inner
     * @param {number} x is the abscissa of mouse relate to the element
     * @param {number} y is the ordinate of mouse relate to the element
     * @return {Object} event includes the mouse coordinate relate to the element
     */
    function getPoint(event) {
        // Compatible with IE browser
        event = event || window.event;
        
        var x = (event.pageX || event.clientX + document.body.scrollLeft 
                 + document.documentElement.scrollLeft);
        x -= element.offsetLeft;
        var y = (event.pageY || event.clientY + document.body.scrollTop 
                 + document.documentElement.scrollTop);
        y -= element.offsetTop;
        
        return {
            x: x, 
            y: y
        };
    };
    
    if (!element) {
        return;
    }
    
    /**
     * Pass the coordinate from getPoint to the callback function
     *
     * @param {Object} event includes coordinate computed by getPoint
     */
    element.addEventListener('mousedown', function (event) {
        event.point = getPoint(event);
        mousedownCallback && mousedownCallback.call(this, event);
    }, false);
};

tool.captureMouse(map, mousedownCallback);

/**
 * Request full screen display from the user
 * 
 * @param {Object} element the user would like to receive full screen
 */
function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

guidebot.onclick = function () {
    launchIntoFullscreen(document.documentElement);
}

canvas_on.onclick = function () {
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'none';
    document.querySelector('#pinch_on').style.display = 'block';
    
    if ((localStorage['ratio'] >= 1.95) && (localStorage['ratio'] <= 2.05)) {

        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else if (localStorage['ratio'] == 1) {
        drawMap(4 * localStorage['x'] + 84.28, -4 * localStorage['y'] + 172.16, 4 * localStorage['mapx'] + 84.28, -4 * localStorage['mapy'] + 172.16);
    } else {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;

        drawMap(
        (localStorage['canx']-localStorage['touchx'])*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'])*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'])* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'])* localStorage['ratio']
        );
        
    }
}

pinch_on.onclick = function ()  {
    document.getElementById('map').className = 'hide';
    document.getElementById('pinch').className = 'show';
    document.querySelector('#pinch_on').style.display = 'none';
    document.querySelector('#canvas_on').style.display = 'block';
}

Next.onclick = function () {

    if (localStorage['ratio'] != 1) {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else {
        drawMap(4 * localStorage['x'] + 84.28, 
                -4 * localStorage['y'] + 172.16, 
                4 * localStorage['mapx'] + 84.28, 
                -4 * localStorage['mapy'] + 172.16
               );
    }

    // document.getElementById('x').innerHTML = localStorage['x'];
    // document.getElementById('y').innerHTML = localStorage['y'];
    
	document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'none';
    document.querySelector('#pinch_on').style.display = 'block';
    isOrdered();
}

function set_goal(destination) {
    var xCoord;
    var yCoord;
    if (destination=="empty")
        alert("please try again");
    else {
        switch (destination) {
        case "vcipl":    
            xCoord = 2.59;
            yCoord = 3.41;
            break;
        case "Bioengineering lab":
            xCoord = 3.09;
            yCoord = 29.80;
            break;
        case "CEAT Facilities Service office":
            xCoord = -4.497;
            yCoord = 39.59;
            break;
        case "Industrial assessment center":
            xCoord = -17.16;
            yCoord = 26.61;
            break;
        case "Building Airflow & contaminant Transport lab":
            xCoord = 11.54;
            yCoord = -9.02;
            break;
        }
        localStorage['x'] = $.trim(xCoord);
        localStorage['y'] = $.trim(yCoord);

        if (localStorage['ratio'] != 1) {
            localStorage['canx'] = localStorage['x'] * 4 + 84.28;
            localStorage['cany'] = localStorage['y'] * -4 + 172.16;
            localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
            localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;

            drawMap(
            (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

            (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

            (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

            (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
            );
        } else {
            drawMap(4 * localStorage['x'] + 84.28, 
                    -4 * localStorage['y'] + 172.16, 
                    4 * localStorage['mapx'] + 84.28, 
                    -4 * localStorage['mapy'] + 172.16
                   );
            // document.getElementById('x').innerHTML = xCoord;
            // document.getElementById('y').innerHTML = yCoord;
        }

        document.querySelector('#setCoordsView').style.display = 'none';
        document.querySelector('#orderView').style.display = 'block';
        document.querySelector('#instView').style.display = 'none';
        document.querySelector('#aboutView').style.display = 'none';
        document.getElementById('pinch').className = 'hide';
        document.getElementById('map').className = 'show';
        isOrdered();
    }
}

bio.onclick = function () {

    var xCoord = 3.09;
    var yCoord = 29.80;
	localStorage['x'] = $.trim(xCoord);
    localStorage['y'] = $.trim(yCoord);

    // document.getElementById('x').innerHTML = xCoord;
    // document.getElementById('y').innerHTML = yCoord;
    
    if (localStorage['ratio'] != 1) {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else {
        drawMap(4 * localStorage['x'] + 84.28, 
                -4 * localStorage['y'] + 172.16, 
                4 * localStorage['mapx'] + 84.28, 
                -4 * localStorage['mapy'] + 172.16
               );
    }
    
	document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'block';
    document.querySelector('#pinch_on').style.display = 'none';
    isOrdered();
}

fac.onclick = function () {
    
	var xCoord = -4.50;
	var yCoord = 39.59;
	localStorage['x'] = $.trim(xCoord);
    localStorage['y'] = $.trim(yCoord);

    // document.getElementById('x').innerHTML = xCoord;
    // document.getElementById('y').innerHTML = yCoord;
    
    if (localStorage['ratio'] != 1) {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else {
        drawMap(4 * localStorage['x'] + 84.28, 
                -4 * localStorage['y'] + 172.16, 
                4 * localStorage['mapx'] + 84.28, 
                -4 * localStorage['mapy'] + 172.16
               );
    }
    
	document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'block';
    document.querySelector('#pinch_on').style.display = 'none';
    isOrdered();
}

assess.onclick = function () {
    
	var xCoord = -17.16;
	var yCoord = 26.61;
	localStorage['x'] = $.trim(xCoord);
    localStorage['y'] = $.trim(yCoord);

    // document.getElementById('x').innerHTML = xCoord;
    // document.getElementById('y').innerHTML = yCoord;
    
    if (localStorage['ratio'] != 1) {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else {
        drawMap(4 * localStorage['x'] + 84.28, 
                -4 * localStorage['y'] + 172.16, 
                4 * localStorage['mapx'] + 84.28, 
                -4 * localStorage['mapy'] + 172.16
               );
    }
    
	document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'block';
    document.querySelector('#pinch_on').style.display = 'none';
    isOrdered();
}

trans.onclick = function () {

    var xCoord = 11.54;
    var yCoord = -9.02;
	localStorage['x'] = $.trim(xCoord);
    localStorage['y'] = $.trim(yCoord);

    // document.getElementById('x').innerHTML = xCoord;
    // document.getElementById('y').innerHTML = yCoord;
    
    if (localStorage['ratio'] != 1) {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else {
        drawMap(4 * localStorage['x'] + 84.28, 
                -4 * localStorage['y'] + 172.16, 
                4 * localStorage['mapx'] + 84.28, 
                -4 * localStorage['mapy'] + 172.16
               );
    }
    
	document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'block';
    document.querySelector('#pinch_on').style.display = 'none';
    isOrdered();
}

visual.onclick = function () {

    var xCoord = 2.59;
    var yCoord = 3.41;
	localStorage['x'] = $.trim(xCoord);
    localStorage['y'] = $.trim(yCoord);

    // document.getElementById('x').innerHTML = xCoord;
    // document.getElementById('y').innerHTML = yCoord;
    
    if (localStorage['ratio'] != 1) {
        localStorage['canx'] = localStorage['x'] * 4 + 84.28;
        localStorage['cany'] = localStorage['y'] * -4 + 172.16;
        localStorage['canmapx'] = localStorage['mapx'] * 4 + 84.28;
        localStorage['canmapy'] = localStorage['mapy'] * -4 + 172.16;
        
        drawMap(
        (localStorage['canx']-localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['cany']-localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))*localStorage['ratio'], 

        (localStorage['canmapx'] - localStorage['touchx'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio'],

        (localStorage['canmapy'] - localStorage['touchy'] * (1 - (1 / localStorage['ratio'])))* localStorage['ratio']
        );
    } else {
        drawMap(4 * localStorage['x'] + 84.28, 
                -4 * localStorage['y'] + 172.16, 
                4 * localStorage['mapx'] + 84.28, 
                -4 * localStorage['mapy'] + 172.16
               );
    }
    
	document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    document.querySelector('#canvas_on').style.display = 'block';
    document.querySelector('#pinch_on').style.display = 'none';
    isOrdered();
}
// Push the target coordinate to the server
// Receive and update the order information
orderButton.onclick = function () {

	push_xy(myDomain, localStorage['x'], localStorage['y']);

    timer = setInterval(function () {
        
        if (localStorage['id']) {
            statusCheck(myDomain, localStorage['id']);
        }
        coordsGet(myDomain);
        
        localStorage['flag'] = 1;
        drawMap(4 * localStorage['x'] + 84.28, -4 * localStorage['y'] + 172.16, 4 * localStorage['mapx'] + 84.28, -4 * localStorage['mapy'] + 172.16);
    }, 1000);
}

cancelButton.onclick = function () {
    
    localStorage['flag'] = 0;
    
    clearInterval(timer);
	cancel(myDomain, localStorage['id']);
	localStorage.removeItem('id');
	isOrdered();
}

setcoords.onclick = function () {
    
	document.querySelector('#orderView').style.display = 'none';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
	document.querySelector('#setCoordsView').style.display = 'block';
    document.querySelector('#mapContainer').style.display = 'block';
    document.querySelector('#recordButton').style.display = 'block';
    document.getElementById('map').className = 'hide';
    document.getElementById('pinch').className = 'show';
    document.getElementById('pinch_on').style.display = 'none';
    document.getElementById('canvas_on').style.display = 'block';
}

makeorder.onclick = function () {
    
    var x_new = localStorage['touchx'];
    var y_new = localStorage['touchy'];
    var ratio = localStorage['ratio'];
    // convert x to canx, and continue converting to 
    // coordinates under the current container to draw the ball
    drawMap(
        ((4 * localStorage['x'] + 84.28) - x_new * (1 - (1 / ratio))) * ratio, 
        ((-4 * localStorage['y'] + 172.16) - y_new * (1 - (1 / ratio))) * ratio, 
        ((4 * localStorage['mapx'] + 84.28) - x_new * (1 - (1 / ratio))) * ratio, 
        ((-4 * localStorage['mapy'] + 172.16) - y_new * (1 - (1 / ratio))) * ratio
    );
    // document.getElementById('x').innerHTML = localStorage['x'];
    // document.getElementById('y').innerHTML = localStorage['y'];

	document.querySelector('#setCoordsView').style.display = 'none';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'block';
    document.querySelector('#mapContainer').style.display = 'block';
    document.querySelector('#recordButton').style.display = 'block';
    document.getElementById('pinch').className = 'hide';
    document.getElementById('map').className = 'show';
    isOrdered();
}

instructions.onclick = function () {
    
    document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'none';
    document.querySelector('#mapContainer').style.display = 'none';
    document.querySelector('#recordButton').style.display = 'none';
    document.querySelector('#instView').style.display = 'block';
    document.getElementById('map').className = 'hide';
    document.getElementById('pinch').className = 'show';
}

aboutus.onclick = function () {
    
    document.querySelector('#setCoordsView').style.display = 'none';
	document.querySelector('#orderView').style.display = 'none';
    document.querySelector('#instView').style.display = 'none';
    document.querySelector('#mapContainer').style.display = 'none';
    document.querySelector('#recordButton').style.display = 'none';
    document.querySelector('#aboutView').style.display = 'block';
    document.getElementById('map').className = 'hide';
    document.getElementById('pinch').className = 'show';
}

function show_pending_ui() {
    
    document.querySelector('#mapContainer').style.display = 'block';
    document.querySelector('#orderButton').style.display = 'none';
    document.querySelector('#cancelButton').style.display = 'block';
    document.querySelector('#menuButton').style.display = 'none';
    document.querySelector('#recordButton').style.display = 'none';
}

function show_waiting_for_order_to_be_pressed_ui() {
    
    document.querySelector('#mapContainer').style.display = 'block';
    document.querySelector('#orderButton').style.display = 'block';
    document.querySelector('#cancelButton').style.display = 'none';
    document.querySelector('#menuButton').style.display = 'block';
    document.querySelector('#recordButton').style.display = 'block';
}

function isOrdered() {
    
	if (localStorage['id']) {
        show_pending_ui();
	}
    else {
        show_waiting_for_order_to_be_pressed_ui();
	}
}

/**
 * Send coordinate to the PHP file on web server with unique URL
 * and receive an unique ID for this order and its status from the server
 *
 * @param {string} domain is the public DNS of web instance
 * @param {number} x is the abscissa
 * @param {number} y is the ordinate
 */
function push_xy(domain, x, y) {
    
    var status;
	var id;
    // 'push' is a function's name in this PHP file
    var script = "/turtlebot-server/coffee_queue.php?push&quat_z=0.892&quat_w=-1.5&point_x=" 
    + x + "&point_y=" + y;
    console.log(script);
    
	$.getJSON(domain + script, function (data) { 
		status = data['status'];
		id = data['id'];
        console.log(id);
        localStorage['id'] = id;
        document.getElementById('id').innerHTML = id;
	});
}

// Receive Guidebot's real-time coordinate
function coordsGet(domain) {
    
    $.getJSON(domain + "/scott-server-test/locate.php?map", function (data) {
        
        var fix = parseFloat(data['x']).toFixed(10);
        var fiy = parseFloat(data['y']).toFixed(10);
        localStorage['mapx'] = fix;
        localStorage['mapy'] = fiy;
        console.log(localStorage['mapx']);
        console.log(localStorage['mapy']);
        // document.getElementById('mapx').innerHTML = fix;
        // document.getElementById('mapy').innerHTML = fiy;
    });
}

// Receive the order status and waiting number
function statusCheck(domain, id) {
    
    if (typeof domain === 'undefined' || domain === null) {
        return;
    }
    if (typeof id === 'undefined' || id === null) {
        return;
    }

	var howmanybeforeme;
	var status;
    
	$.getJSON(domain + "/turtlebot-server/coffee_queue.php?statuscheck&id=" + id + "", function (data) {
		howmanybeforeme = data["how-many-are-pending-before-id"];
		status = data["status"];
        console.log(status);
		console.log(howmanybeforeme);
        document.getElementById('status').innerHTML = status;
        document.getElementById('howmany').innerHTML = howmanybeforeme;

        if (status != "pending") {
            localStorage.removeItem('id');
            isOrdered();
        }
        else {
            // Still pending
        }
	});
    
    isOrdered();
}

// Cancel the present order 
function cancel(domain, id) {
    
	$.getJSON(domain + "/turtlebot-server/coffee_queue.php?update&id=" 
              + id + "&status=failed", function (data) {
		$.each(data, function (key, val) {
			if (data["updated"] == "1") {
				console.log("success");
                document.getElementById('status').innerHTML = "success";
			}
		});
	});
}

/**
 * Draw in the following order: the map, the red ball, then the yellow ball
 *
 * @param {number} x is the abscissa of red ball
 * @param {number} y is the abscissa of red ball
 * @param {number} xx is the abscissa of yellow ball
 * @param {number} yy is the abscissa of yellow ball
 */
function drawMap(x, y, xx, yy) {
    
    // get doubletap coordinates from pinch-zoom.js
    // (0, 0) when ratio = 1
    var x_new = localStorage['touchx'];
    var y_new = localStorage['touchy'];
    var ratio = localStorage['ratio'];
    //console.log("(" + x_new + ", " + y_new + ", " + ratio + ")");
    
    ctx.clearRect(0, 0, 227.6, 252);
    
    ctx.beginPath();
    ctx.fillStyle = "#FF0000";
    ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.fillStyle = "#FF9900";
    ctx.arc(xx, yy, 5, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.closePath();
}

$(".button-collapse").sideNav();