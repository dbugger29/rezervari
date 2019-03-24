// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';
var settings = {BEFORE_TIME_REZERVATION : 10000};

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

chrome.storage.onChanged.addListener(function(changes, namespace) {
	
	console.info(changes, namespace);
	//creca aici trebuie scoase alarmele vechi
	if("worldclass_rezervations" in changes && "newValue" in changes.worldclass_rezervations )
	{
		for(let key in changes.worldclass_rezervations.newValue) {
			if( "day" in changes.worldclass_rezervations.newValue[key] )
			{
				alert(JSON.stringify(changes.worldclass_rezervations.newValue[key]));
			//	alert(key);
				let alarm_name = changes.worldclass_rezervations.newValue[key].alarm_name;
				let alarm_time = createDate(changes.worldclass_rezervations.newValue[key].day, changes.worldclass_rezervations.newValue[key].time);
				//console.info(alarm_name, alarm_time);
				chrome.alarms.create(alarm_name, {"when": alarm_time/1 });
			}
		}
	}
	else
	{
		console.info("Values changed but not worldclass_rezervations");
		//alert("Values changed but not worldclass_rezervations");
	}
 });
 var restart_alarm = (alarm_name) => {
	 //TO DO HERE
	//let alarm_name = changes.worldclass_rezervations.newValue[key].alarm_name;
	//let alarm_time = createDate(changes.worldclass_rezervations.newValue[key].day, changes.worldclass_rezervations.newValue[key].time);
	//console.info(alarm_name, alarm_time);
	//chrome.alarms.create(alarm_name, {"when": alarm_time/1 });
 }
chrome.alarms.onAlarm.addListener(function(alarm)
{
	chrome.tabs.create({"url":"https://members.worldclass.ro/member-schedule.php"}, (tab) =>
	{
		
		chrome.storage.sync.set({"worldclass_current_alarm": alarm.name, "worldclass_alarm_status":0 });
		/*
		setTimeout( () => {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { current_alarm_name : alarm.name }, function(response) {
					console.log('success');
				});
			});
		}, 1000);
		
		//chrome.tabs.sendMessage(tab.id, { current_alarm_name : alarm.name }, {frameId: 0});
		/*
		setTimeout( () => {
			console.info("intraaa aiiici");
			chrome.tabs.executeScript(tab.id, {code:"current_alarm_name= '" + alarm.name+"';"},() => {
				
				chrome.tabs.executeScript(tab.id, {
					file: 'login.js'
				}, () => {}); 
			});
		}, 1000);
		*/
		// recreate alarm
		setTimeout( () =>
		{
			restart_alarm(alarm.name);
		}, 50*1000);
	});
});