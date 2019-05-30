// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var ShowResetCredentials = () => {
		document.getElementById("settings_credentials").style.display = "block";
}

var UpdateCredentials = () => {

	let email = document.getElementById("c_username").value;
	let pass = document.getElementById("c_password").value;
	chrome.storage.sync.set({"worldclass_email": email}, function() {
          console.info('Email is updated');
		chrome.storage.sync.set({"worldclass_pass": pass}, function() {
			console.info('Password is updated');
			document.getElementById("settings_credentials").style.display = "none";
		});
	});	
}
var SetReservations = () => {
	
		document.getElementById("create_reservations").style.display = "block";
}

var CheckTime = (sTime) => {
	var returnTime = sTime;
	if( /\d\d:\d\d (AM|PM)*/g.exec(sTime) )
	{
		let p_hour = sTime.split(":");
		let hour = parseInt(p_hour[0]);
		let minutes = parseInt(p_hour[1]);
		if( sTime.indexOf("PM") > 0 )
			returnTime = (hour + 12).toString() + ":" + p_hour[1];
		else
			returnTime = p_hour[0] + ":" +p_hour[1].split(" ")[0];
	}
	return returnTime;
}

var AddReservations = () => {
	
	var rez_time = (document.querySelector('input[type="time"]')).value;
	var rez_name =  (document.querySelector('input#class_name')).value;
	
	var e = document.getElementById("class_day");
	var rez_day = e.options[e.selectedIndex].text;
	chrome.storage.sync.get(["worldclass_rezervations" ], function(result) {
          //console.log('Value currently is ' + result.worldclass_rezervations);
		  if(!result.worldclass_rezervations || typeof result.worldclass_rezervations == "undefined")
				result.worldclass_rezervations = [];
			result.worldclass_rezervations.push(
				{
					"day" 			: rez_day,
					"time" 			: CheckTime(rez_time),
					"name"			: rez_name,
					"alarm_name"	:rez_day + rez_time,
					"enabled"		:true
				});
			chrome.storage.sync.set({"worldclass_rezervations": result.worldclass_rezervations}, function() {
					document.getElementById("create_reservations").style.display = "none";
			});
	});
}
var SaveModificationsReservations = () => {
	console.info("intra aiiiicii");
	var saved_alarms = document.querySelectorAll("#current_reservations input[type=checkbox]:checked");
	console.info(saved_alarms);
	var new_alarms = [];
	for(var idz=0; idz< saved_alarms.length;idz++ )
	{
		new_alarms.push(saved_alarms[idz].value);
	}
	console.info(new_alarms, new_alarms.length);
	chrome.storage.sync.get(["worldclass_rezervations" ], function(result) {
			for(var idy=0; idy< result.worldclass_rezervations.length; idy++)
			{
				
				if( new_alarms.indexOf(result.worldclass_rezervations[idy].alarm_name) >= 0 )
				{
					result.worldclass_rezervations[idy].enabled = true;
				}
				else
				{
					result.worldclass_rezervations[idy].enabled = false;
				}
			}
			chrome.storage.sync.set({"worldclass_rezervations": result.worldclass_rezervations}, function() {
					alert("Reservations saved!!!");
					document.getElementById("current_reservations").style.display = "none";
			});
	});
}
var ShowReservations = () => {
	document.getElementById("current_reservations").style.display = "block";
	
	chrome.storage.sync.get(["worldclass_rezervations" ], function(result) {
		console.info(JSON.stringify(result.worldclass_rezervations));
		var html_result = "<br/><b>Rezervari:</b><br/>";
		for(var idx=0; idx< result.worldclass_rezervations.length; idx++)
		{
			//to do here
			var checked = "enabled" in result.worldclass_rezervations[idx]? result.worldclass_rezervations[idx].enabled:true;
			if(checked) checked ="checked";
			html_result +='<input type="checkbox" value="'+result.worldclass_rezervations[idx].alarm_name+'" name="'+result.worldclass_rezervations[idx].alarm_name + '" ' +checked+'>'+ JSON.stringify(result.worldclass_rezervations[idx]) +'<br/><br/>';
		}
		html_result +='<button id="i_save_modifications_reservations">Save</button>';
		document.getElementById("current_reservations").innerHTML = html_result;
		document.getElementById('i_save_modifications_reservations').addEventListener('click', SaveModificationsReservations);
	});
}


var ResetAll = () => {
	chrome.storage.sync.set({"worldclass_rezervations": null}, () =>  {
		chrome.storage.sync.set({"worldclass_email": null}, () => {
			chrome.storage.sync.set({"worldclass_pass": null}, () => {
				chrome.alarms.clearAll( () => {});
			});
		});
	});
}


var ShowAlarms = () =>
{
	chrome.alarms.getAll( function(result) {
		var s_result = "";
		//scheduledTime
		for(var idx=0; idx< result.length; idx++)
		{
			s_result += result[idx].name + "-" + new Date(result[idx].scheduledTime) + "\n";
		}
		alert(s_result);
	});
}

document.getElementById('i_reset_credentials').addEventListener('click', ShowResetCredentials);
document.getElementById('i_update_credentials').addEventListener('click', UpdateCredentials);
document.getElementById('i_set_reservations').addEventListener('click', SetReservations);
document.getElementById('i_add_reservation').addEventListener('click', AddReservations);
document.getElementById('i_show_reservations').addEventListener('click', ShowReservations);
document.getElementById('i_show_alarms').addEventListener('click', ShowAlarms);
document.getElementById('i_reset_all').addEventListener('click', ResetAll);

