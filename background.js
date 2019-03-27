// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
var settings = {BEFORE_TIME_REZERVATION : 10000}; // for login 

 chrome.runtime.onInstalled.addListener(function() {
	// to do here - maybe reload background or reset?
});

var createDate = (day, hours) =>
{
	let dayofweek =0;//none
	switch( day.toLowerCase() )
	{
		case "sunday":		dayofweek += 1; 
		case "saturday":	dayofweek += 1; 
		case "friday":		dayofweek += 1; 
		case "thursday":	dayofweek += 1; 
		case "wednesday":	dayofweek += 1; 
		case "tuesday":		dayofweek += 1; 
		case "monday":		dayofweek += 1; 
			break;
	}
	dayofweek = dayofweek == 1 ? 7 : dayofweek -1;
	let return_date = new Date();
	return_date.setDate(return_date.getDate() + (dayofweek + 7 - return_date.getDay()) % 7);
	let p_hour = hours.split(":");
	let hour = parseInt(p_hour[0]);
	let minutes = parseInt(p_hour[1]);
	//console.info(hour, minutes);
	//if(hour > 2) - it should never happen
		return_date.setHours( hour - 2 );
	return_date.setMinutes(minutes);
	//console.info(return_date);
	//to do here - 20 sec
	return_date.setSeconds(0);
	return_date = new Date( return_date.getTime() - settings.BEFORE_TIME_REZERVATION ); // in case of login needs
	console.log(return_date);
	return return_date;
}

 var restart_alarm = (alarm_name, b_restart_all) => {
	
	var set_alarms = () => {
		chrome.storage.sync.get(["worldclass_rezervations" ], function(result) {
			if(b_restart_all)
			{
				for(let key in result.worldclass_rezervations) 
				{
					//if( "day" in result.worldclass_rezervations[key] )
					//{
						alert(JSON.stringify(result.worldclass_rezervations[key]));
						let alarm_name = result.worldclass_rezervations[key].alarm_name;
						let alarm_time = createDate(result.worldclass_rezervations[key].day, result.worldclass_rezervations[key].time);
						//console.info(alarm_name, alarm_time);
						chrome.alarms.create(alarm_name, {"when": alarm_time/1 });
					// }
				}
			}
			else
			{
				for(let key in result.worldclass_rezervations) 
				{
					if(alarm_name == result.worldclass_rezervations[key].alarm_name )
					{
						alert(JSON.stringify(result.worldclass_rezervations[key]));
						let alarm_name = result.worldclass_rezervations[key].alarm_name;
						let alarm_time = createDate(result.worldclass_rezervations[key].day, result.worldclass_rezervations[key].time);
						//console.info(alarm_name, alarm_time);
						chrome.alarms.create(alarm_name, {"when": alarm_time/1 });
						break;
					}
				}
			}
		});
	}
	
	var b_clear_alarms = (wasCleared) =>
	{
		if(!wasCleared) 
			throw "Alarms were not cleared";
		else
			set_alarms();
	};
	
	if( b_restart_all )
			chrome.alarms.clearAll( b_clear_alarms);
	else
		if(alarm_name)
			chrome.alarms.clear(alarm_name, b_clear_alarms);
 }

chrome.storage.onChanged.addListener(function(changes, namespace) {
	
	console.info(changes, namespace);	
	if("worldclass_rezervations" in changes && "newValue" in changes.worldclass_rezervations )
	{
		restart_alarm(null, true);//restart all alarms
	}
	else
	{
		console.info("Values changed but not worldclass_rezervations");
		//alert("Values changed but not worldclass_rezervations");
	}
 });

chrome.alarms.onAlarm.addListener(function(alarm)
{
	var alarm_start_date = new Date();
	chrome.tabs.create({"url":"https://members.worldclass.ro/"}, (tab) =>
	{
		chrome.storage.sync.set({"worldclass_current_alarm": alarm.name, "worldclass_alarm_status":-1 });
		let time_to_rezervation = settings.BEFORE_TIME_REZERVATION -(new Date() - alarm_start_date);
		time_to_rezervation = time_to_rezervation > 0 ? time_to_rezervation : 0;
		setTimeout( () =>
		{
			chrome.tabs.create({"url":"https://members.worldclass.ro/member-schedule.php"}, (tab) =>
			{
				chrome.storage.sync.set({"worldclass_current_alarm": alarm.name, "worldclass_alarm_status":0 });
				// recreate alarm
				setTimeout( () =>
				{
					restart_alarm(alarm.name, false);
				}, 60000); // peste 60 secunde
			});
		}, time_to_rezervation);
	});
});