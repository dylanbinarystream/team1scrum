//Hard-coded permanent team member list. Updated in GitHub repo.
var permanentMembers = [
  "Arvind",
  "Dylan",
  "Jacqueline",
  "Judith",
  "Judy",
  "Kelly",
  "Kenny",
  "Kuljit",
  "Leon",
  "Mary",
  "Natalie",
  "Rebecca",
  "Shengnan",
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

var spinAngleStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;
var spinFriction = 0.99;

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
        + '" class="toggle_member" type="button">' + (parsedDisabledMembers[i] ? 'Away' : 'Here') + '</button></td> </tr>');
    }
  }

  //Clear and repopulate the Temporary Members tables from the cookie array of temporary members.
  function populateTemporaryMembersTable() {
    var parsedTempMembers = JSON.parse(Cookies.get('tempMembers'));

    $("#temp-members-table tr.data_row").remove();

    for (let i = 0; i < parsedTempMembers.length; i++) {
      $('#temp-members-table').append('<tr class="data_row"><td class="present_member_name">'
        + parsedTempMembers[i] + '</td><td><button id="remove_temp_btn_' + i
        + '" class="remove_temp_btn" type="button">Remove</button></td> </tr>');
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

// Binary Stream brand palette — cycling segment colours
var segmentColors = [
  '#00214F', // Navy
  '#004778', // Stream
  '#381D96', // Indigo
  '#00626B', // Pine
  '#009AA6', // Teal
  '#6D8BED', // Azure
];

function getColor(item) {
  return segmentColors[item % segmentColors.length];
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

    ctx.strokeStyle = "#6D8BED"; // Azure border
    ctx.lineWidth = 2;

    ctx.font = 'bold 22px Manrope, Arial';

    for (var i = 0; i < parsedActiveMembers.length; i++) {
      var angle = startAngle + i * arc;
      ctx.fillStyle = getColor(i);

      ctx.beginPath();
      ctx.arc(375, 375, outsideRadius, angle, angle + arc, false);
      ctx.arc(375, 375, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur = 2;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.fillStyle = "#FFFFFF"; // White label text
      ctx.translate(375 + Math.cos(angle + arc / 2) * textRadius,
        375 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = parsedActiveMembers[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    //Arrow
    ctx.fillStyle = "#6D8BED"; // Azure arrow
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

// Tracks the index of the last selected segment to avoid repeated picks
var lastWinnerIndex = -1;

function spin() {
  var parsedActiveMembers = JSON.parse(Cookies.get('activeMembers'));
  if (parsedActiveMembers.length === 0) {
    document.getElementById("result").innerHTML = "Add team members to spin!";
    return;
  }

  // Randomise all spin parameters fresh on each click
  spinAngleStart = 8 + Math.random() * 10;           // random initial velocity
  spinTime = 0;
  spinTimeTotal = 4000 + Math.random() * 5000;       // random duration 4–9 s
  spinFriction = 0.985 + Math.random() * 0.01;       // random deceleration

  // Bias prevention: rotate the starting angle by a random non-zero number of
  // full segment widths so the wheel never rests on the same person twice in a row.
  if (lastWinnerIndex >= 0 && parsedActiveMembers.length > 1) {
    var segmentCount = parsedActiveMembers.length;
    var offset = (1 + Math.floor(Math.random() * (segmentCount - 1))) * arc;
    startAngle += offset;
  }

  rotateWheel();
}

function rotateWheel() {
  spinTime += 20;
  if (spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  // Apply friction-based deceleration: scale remaining velocity by friction each frame
  spinAngleStart *= spinFriction;
  startAngle += (spinAngleStart * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  var parsedActiveMembers = JSON.parse(Cookies.get('activeMembers'));

  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcD = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcD) % parsedActiveMembers.length;
  var text = parsedActiveMembers[index] + ' goes first!';
  document.getElementById("result").innerHTML = text;
  lastWinnerIndex = index;
}

drawRouletteWheel();
