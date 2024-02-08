//Hard-coded permanent team member list. Updated in GitHub repo.
var permanentMembers = [
  "Arvind",
  "Bob",
  "Dylan",
  "Jacqueline",
  "Judith",
  "Kelly",
  "Kenny",
  "Kuljit",
  "Rebecca",
  "Royali",
  "Shengnan",
  "Thomas",
];

//Cookie array of boolean (false/undefined or true) for each permanent member. Toggles between Here (false; default) or Away (true).
if (typeof (Cookies.get('disabledMembers')) === 'undefined') { //initialize cookie if not already set 
  Cookies.set('disabledMembers', JSON.stringify(new Array(permanentMembers.length)));
}

//Cookie array of strings similar to permanentMembers, but instead containing temporary members added by the user.
if (typeof (Cookies.get('tempMembers')) === 'undefined') { //initialize cookie if not already set
  Cookies.set('tempMembers', JSON.stringify([]));
}

//Cookie array of strings similar to permanentMembers, but also containing temporary members added by the user.
if (typeof (Cookies.get('activeMembers')) === 'undefined') { //initialize cookie if not already set
  Cookies.set('activeMembers', JSON.stringify([]));
}

var startAngle = Math.random() * 360;
var arc = Math.PI / (permanentMembers.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 1;
var spinTimeTotal = 1;

var ctx

document.getElementById("spin").addEventListener("click", spin);
document.getElementById("spin2").addEventListener("click", spin);

//JQuery functions to handle user editing of permanent and temporary team members.
$(document).ready(function () {

  //Listener for clicks on the Activate/Deactivate buttons in the Permanent Team Members table.
  //Updates the disabled boolean for the clicked team member, and reloads the wheel and table.
  $('#permanent-members-table').on('click', '.toggle_member', function () {
    var parsedDisabledMembers = JSON.parse(Cookies.get('disabledMembers'));

    //Extract permanent team member's index position from button ID by deleting non-numeric prefix.
    let memberIndex = this.id.replace(/toggle_member_/, '');

    if (parsedDisabledMembers[memberIndex]) {
      parsedDisabledMembers[memberIndex] = false;
    } else {
      parsedDisabledMembers[memberIndex] = true;
    }
    Cookies.set('disabledMembers', JSON.stringify(parsedDisabledMembers));

    drawRouletteWheel();
    populatePermanentMembersTable();
  });

  //Listener for clicks on the Remove buttons in the Temporary Team Members table.
  //Removes the clicked temporary team member, and reloads the wheel and table.
  $('#temp-members-table').on('click', '.remove_temp_btn', function () {
    var parsedTempMembers = JSON.parse(Cookies.get('tempMembers'));

    //Extract temporary team member's index position from button ID by deleting non-numeric prefix.
    let x = this.id.replace(/remove_temp_btn_/, '');

    //Deletes clicked temporary team member.
    parsedTempMembers.splice(x, 1);

    Cookies.set('tempMembers', JSON.stringify(parsedTempMembers));

    drawRouletteWheel();
    populateTemporaryMembersTable();
  });

  //Listener for clicks on the Add button in the Temporary Team Members table.
  //Adds the entered name of a temporary team member, and reloads the wheel and table.
  $('#members-editor-panel').on('click', '#new_temp_btn', function () {
    var parsedTempMembers = JSON.parse(Cookies.get('tempMembers'));

    //If a name was entered for a new temporary team member
    if ($('#new_temp_text').val().length > 0) {
      parsedTempMembers.push($('#new_temp_text').val());
      $('#new_temp_text').val('');

      Cookies.set('tempMembers', JSON.stringify(parsedTempMembers));

      drawRouletteWheel();
      populateTemporaryMembersTable();
    }

  });

  //Listener for clicks on the Clear button in the Temporary Team Members table.
  //Removes all temporary team members, and reloads the wheel and table.
  $('#members-editor-panel').on('click', '#remove_all_temp_btn', function () {

    var parsedTempMembers = JSON.parse(Cookies.get('tempMembers'));
    if (parsedTempMembers.length > 0) {

      if (window.confirm("Do you want to remove all temporary members?")) {
        Cookies.set('tempMembers', JSON.stringify([]));

        drawRouletteWheel();
        populateTemporaryMembersTable();
      }
    }
  });

  //Clear and repopulate the Permanent Members tables from the hard-coded array of permanent members, and the corresponding cookie array of disabled member indices.
  function populatePermanentMembersTable() {
    var parsedDisabledMembers = JSON.parse(Cookies.get('disabledMembers'));

    $("#permanent-members-table tr.data_row").remove();

    for (let i = 0; i < permanentMembers.length; i++) {
      $('#permanent-members-table').append('<tr class="data_row"><td class="' + (parsedDisabledMembers[i] ? '' : 'present_member_name')
        + '">' + permanentMembers[i] + '</td><td><button id="toggle_member_' + i
        + '" class="toggle_member btn-outline-primary" type="button">' + (parsedDisabledMembers[i] ? 'Away' : 'Here') + '</button></td> </tr>');
    }
  }

  //Clear and repopulate the Temporary Members tables from the cookie array of temporary members.
  function populateTemporaryMembersTable() {
    var parsedTempMembers = JSON.parse(Cookies.get('tempMembers'));

    $("#temp-members-table tr.data_row").remove();

    for (let i = 0; i < parsedTempMembers.length; i++) {
      $('#temp-members-table').append('<tr class="data_row"><td class="present_member_name">'
        + parsedTempMembers[i] + '</td><td><button id="remove_temp_btn_' + i
        + '" class="remove_temp_btn btn-outline-primary" type="button">Remove</button></td> </tr>');
    }
  }

  //On page load populate or refresh (from cookies) the member tables.
  populatePermanentMembersTable();
  populateTemporaryMembersTable();
});


//Wheel calculations updated to use full list of active members (non-disabled permanent members and temporary members) from cookie.
function updateArc() {
  var parsedActiveMembers = JSON.parse(Cookies.get('activeMembers'));

  arc = Math.PI / (parsedActiveMembers.length / 2);
}

//Wheel calculations updated to use full list of active members (non-disabled permanent members and temporary members) from cookie.
function refreshActiveMembers() {
  var parsedDisabledMembers = JSON.parse(Cookies.get('disabledMembers'));
  var parsedTempMembers = JSON.parse(Cookies.get('tempMembers'));
  var activeMembers = [];

  for (let i = 0; i < permanentMembers.length; i++) {
    if (!parsedDisabledMembers[i]) {
      activeMembers.push(permanentMembers[i]);
    }
  }
  activeMembers = activeMembers.concat(parsedTempMembers);

  Cookies.set('activeMembers', JSON.stringify(activeMembers));
  updateArc();
}

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function RGB2Color(r, g, b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxItem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI * 2 / maxItem;

  red = Math.sin(frequency * item + 2 + phase) * width + center;
  green = Math.sin(frequency * item + 0 + phase) * width + center;
  blue = Math.sin(frequency * item + 4 + phase) * width + center;

  return RGB2Color(red, green, blue);
}

function drawRouletteWheel() {
  //Wheel calculations updated to use full list of active members (non-disabled permanent members and temporary members) from cookie.
  refreshActiveMembers()
  var parsedActiveMembers = JSON.parse(Cookies.get('activeMembers'));

  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 300;
    var textRadius = 240;
    var insideRadius = 187.5;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 750, 750);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = 'bold 22px Arial';

    for (var i = 0; i < parsedActiveMembers.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, parsedActiveMembers.length);
      //ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';

      ctx.beginPath();
      ctx.arc(375, 375, outsideRadius, angle, angle + arc, false);
      ctx.arc(375, 375, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(375 + Math.cos(angle + arc / 2) * textRadius,
        375 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = parsedActiveMembers[i];
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
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  var parsedActiveMembers = JSON.parse(Cookies.get('activeMembers'));

  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcD = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcD);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = parsedActiveMembers[index] + ' goes first!';
  //ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  document.getElementById("result").innerHTML = text;
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t /= d) * t;
  var tc = ts * t;
  return b + c * (tc + -3 * ts + 3 * t);
}

drawRouletteWheel();
