// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
/*
function setAlarm(event) {
  let minutes = parseFloat(event.target.value);
  chrome.browserAction.setBadgeText({text: 'ON'});
  chrome.alarms.create({delayInMinutes: minutes});
  chrome.storage.sync.set({minutes: minutes});
  window.close();
}

function clearAlarm() {
  chrome.browserAction.setBadgeText({text: ''});
  chrome.alarms.clearAll();
  window.close();
}

//An Alarm delay of less than the minimum 1 minute will fire
// in approximately 1 minute incriments if released
document.getElementById('sampleSecond').addEventListener('click', setAlarm);
document.getElementById('15min').addEventListener('click', setAlarm);
document.getElementById('30min').addEventListener('click', setAlarm);
document.getElementById('cancelAlarm').addEventListener('click', clearAlarm);
*/


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

var AddReservations = () => {
	
	var rez_time = (document.querySelector('input[type="time"]')).value;
	var rez_name =  (document.querySelector('input#class_name')).value;
	
	var e = document.getElementById("class_day");
	var rez_day = e.options[e.selectedIndex].text;
	//var rez_day =  (document.querySelector('input#class_name')).value;
	chrome.storage.sync.get(["worldclass_rezervations" ], function(result) {
          //console.log('Value currently is ' + result.worldclass_rezervations);
		  if(!result.worldclass_rezervations || typeof result.worldclass_rezervations == "undefined")
				result.worldclass_rezervations = [];
			result.worldclass_rezervations.push(
				{
					"day" 			: rez_day,
					"time" 			: rez_time,
					"name"			: rez_name,
					"alarm_name"	:rez_day + rez_time
				});
			// TO DO HERE -- CHECK IF REZERVATION EXISTS ALREADY
			chrome.storage.sync.set({"worldclass_rezervations": result.worldclass_rezervations}, function() {
					//console.info('Rezervations updated');
					document.getElementById("create_reservations").style.display = "none";
			});
	});
}

var ShowReservations = () => {
	chrome.storage.sync.get(["worldclass_rezervations" ], function(result) {
		alert(JSON.stringify(result));
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

document.getElementById('i_reset_credentials').addEventListener('click', ShowResetCredentials);
document.getElementById('i_update_credentials').addEventListener('click', UpdateCredentials);
document.getElementById('i_set_reservations').addEventListener('click', SetReservations);
document.getElementById('i_add_reservation').addEventListener('click', AddReservations);
document.getElementById('i_show_reservations').addEventListener('click', ShowReservations);
document.getElementById('i_reset_all').addEventListener('click', ResetAll);

