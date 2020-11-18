var permanentOptions = ["Angela", "David", "Devan", "Dylan", "Jacqueline", "Kelly", "Kuljit", "Shengnan", "Vukasin"];
//Move to cookies
var disabledOptions = new Array(permanentOptions.length);
//Move to cookies
var tempOptions = [];
//Move to cookies
var activeOptions = [];

var startAngle = 0;
var arc = Math.PI / (permanentOptions.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 1;
var spinTimeTotal = 1;

var ctx

document.getElementById("spin").addEventListener("click", spin);

//
function updateArc() {
  arc = Math.PI / (activeOptions.length / 2);
}

//
function refreshActiveOptions() {
  activeOptions = []
  for (let i = 0; i < permanentOptions.length; i++)
  {
    if (!disabledOptions[i]) {
      activeOptions.push(permanentOptions[i]);
    }
  }
  activeOptions = activeOptions.concat(tempOptions);
  updateArc();
}

//
function loadTableX() {
  $("#permanent-options-table tr.data_row").remove();

  for (let i = 0; i < permanentOptions.length; i++) {
    $('#permanent-options-table').append('<tr class="data_row"><td>' + permanentOptions[i] + '</td><td><button id="toggle_option_' + i
                                        + '" class="toggle_option" type="button">' + (disabledOptions[i] ? 'Enable' : 'Disable') + '</button></td> </tr>');
  }

}

//
function loadTableY() {
  $("#temp-options-table tr.data_row").remove();

  for (let i = 0; i < tempOptions.length; i++) {
    $('#temp-options-table').append('<tr class="data_row"><td>' + tempOptions[i] + '</td><td><button id="remove_temp_btn_' + i
                                        + '" class="remove_temp_btn" type="button">Remove</button></td> </tr>');
  }
}

//
$(document).ready(function() {

  $('#permanent-options-table').on('click', '.toggle_option', function() {
    let x = this.id.replace(/toggle_option_/, '');

    if (disabledOptions[x]) {
      disabledOptions[x] = false;
    } else {
      disabledOptions[x] = true;
    }

    drawRouletteWheel();
    loadTableX();
  });

  $('#temp-options-table').on('click', '.remove_temp_btn', function() {
    let x = this.id.replace(/remove_temp_btn_/, '');

    tempOptions.splice(x,1);

    drawRouletteWheel();
    loadTableY();
  });

  $('#options-editor').on('click', '#new_temp_btn', function() {
    
    if ($('#new_temp_text').val().length > 0) {
      tempOptions.push($('#new_temp_text').val());
      $('#new_temp_text').val('');

      drawRouletteWheel();
      loadTableY();
    }
  });

  $('#options-editor').on('click', '#remove_all_temp_btn', function() {

    if (tempOptions.length > 0) {
      tempOptions = []

      drawRouletteWheel();
      loadTableY();
    }
  });

});

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  red   = Math.sin(frequency*item+2+phase) * width + center;
  green = Math.sin(frequency*item+0+phase) * width + center;
  blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  return RGB2Color(red,green,blue);
}

function drawRouletteWheel() {
  //
  refreshActiveOptions()

  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 300;
    var textRadius = 240;
    var insideRadius = 187.5;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,750,750);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = 'bold 22px Arial';

    for(var i = 0; i < activeOptions.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, activeOptions.length);
      //ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
      
      ctx.beginPath();
      ctx.arc(375, 375, outsideRadius, angle, angle + arc, false);
      ctx.arc(375, 375, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(375 + Math.cos(angle + arc / 2) * textRadius, 
                    375 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = activeOptions[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    } 

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(375 - 6, 375 - (outsideRadius + 7.5));
    ctx.lineTo(375 + 6, 375 - (outsideRadius + 7.5));
    ctx.lineTo(375 + 6, 375 - (outsideRadius - 7.5));
    ctx.lineTo(375 + 12, 375 - (outsideRadius - 7.5));
    ctx.lineTo(375 + 0, 375 - (outsideRadius - 19.5));
    ctx.lineTo(375 - 12, 375 - (outsideRadius - 7.5));
    ctx.lineTo(375 - 6, 375 - (outsideRadius - 7.5));
    ctx.lineTo(375 - 6, 375 - (outsideRadius + 7.5));
    ctx.fill();
  }
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 20;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = activeOptions[index] + ' goes first!';
  //ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  document.getElementById("result").innerHTML = text;
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

drawRouletteWheel();
//
loadTableX();
