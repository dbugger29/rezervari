var settings = settings || {};	
var current_alarm_name = current_alarm_name || null;
//this is for clicking stuff
function simulatedClick(target, options) {

  var event = target.ownerDocument.createEvent('MouseEvents'),
      options = options || {},
      opts = { // These are the default values, set up for un-modified left clicks
        type: 'click',
        canBubble: true,
        cancelable: true,
        view: target.ownerDocument.defaultView,
        detail: 1,
        screenX: 0, //The coordinates within the entire page
        screenY: 0,
        clientX: 0, //The coordinates within the viewport
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button: 0, //0 = left, 1 = middle, 2 = right
        relatedTarget: null,
      };

  //Merge the options with the defaults
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      opts[key] = options[key];
    }
  }

  //Pass in the options
  event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
  );

  //Fire the event
  target.dispatchEvent(event);
}


function ReadLocalSettings( clbk )
{
	//to do here
	chrome.storage.sync.get(["worldclass_email", "worldclass_pass", "worldclass_rezervations" ], function(result) {
		settings.worldclass_email = result.worldclass_email;
		settings.worldclass_pass = result.worldclass_pass;
		settings.worldclass_rezervations = result.worldclass_rezervations;
		console.info(current_alarm_name);
		if(result.worldclass_rezervations && typeof result.worldclass_rezervations != "undefined")
		{
			for( var idr = 0; idr< result.worldclass_rezervations.length; idr++)
			{				
				if(result.worldclass_rezervations[idr].alarm_name == current_alarm_name)
				{
					settings.current_alarm = result.worldclass_rezervations[idr];
					break;
				}
			}
		}
		return clbk(null, settings);
	});
}
 function CheckLoginPage( clbk )
{
	console.info("intra in checkLogin");
	console.info(settings.worldclass_email);
	if(settings.worldclass_email)
	{
		$(document).ready( () =>
		{
			if($("#email"))
			{
				$("#email").val(settings.worldclass_email);
				$("#pincode").val(settings.worldclass_pass);
				$('[type=submit]').click();
				return clbk();
			}
			else
				return clbk();
		});
	}
	else
		return clbk();
}


var submit_hour = (day, hour, class_name, clbk) => 
{
	console.info("intra aiiici");
		var zi = "";
		switch ( day.toLowerCase() )
		{
			case "sunday":		zi = "Duminica"; break; 
			case "saturday":	zi = "Sambata"; break; 
			case "friday":		zi = "Vineri"; break; 
			case "thursday":	zi = "Joi"; break; 
			case "wednesday":	zi = "Miercuri"; break; 
			case "tuesday":		zi = "Marti"; break; 
			case "monday":		zi = "Luni"; break; 
		}
		if(zi =="") return clbk("parameters not correct");
		let current_column = $('.weekday:contains("' + zi + '")').parent().parent();
		var cells =  $(current_column).find(".class-hours:contains('" + hour + " -')");
		let cell= cells;
		if(cells.length > 1)
		{
			//verify for parallel classes
			for(let idc = 0; idc< cells.length; idc++)
			{
				if($(cells[idc]).parent().find(".class-title:contains('" + class_name.toUpperCase() + "')").length >0 )
				{
					cell = cells[idc];
					break;
				}
			}
		}
		cell = $(cell).parent().parent();
		console.info(cell);
		if(!cell) return clbk("cell not found");
		var crt_button = $(cell).find(".btn-book-class:contains('REZERVA')");
		if(!crt_button)	return clbk("button not found");
		crt_button.click();
		var class_id = new RegExp("#class-(.*)").exec(crt_button.attr("data-target"));
		if(class_id.length >1 ) class_id = class_id[1];
		if(!class_id) return clbk("class id not found");
		setTimeout( () => {
			var confirm_button = $(".btn-book-class:contains('Da')[href*='"+ class_id + "']")
			if(confirm_button)
			{
				simulatedClick(confirm_button[0]);
				return clbk();
			}
			else
				return clbk("not correct format");
		}, 550);
};

var goto_iasi = ( clbk) => 
{
		$('#clubid').find('option:contains("World Class Iasi")').prop({selected: true});
		document.getElementById('clubs-form').submit();
};

/*	
function GotoPage( clbk )
{
	
	var carryon = () => {
		//goto_iasi();
		setTimeout( () => {
			submit_hour(settings.current_alarm.day, settings.current_alarm.time, settings.current_alarm.name,  clbk);
		},100);
	}
	if($("a#do-schedule") && $("a#do-schedule")[0])
	{
		setTimeout( function()
		{
			$("a#do-schedule")[0].click();
			//carryon();
		}, 100);
	}
	else
		carryon();
}

chrome.runtime.onMessage.addListener(notify);

function notify(message) 
{
    window.alert(JSON.stringify(message));
	if("current_alarm_name" in message && message.current_alarm_name)
	{
		current_alarm_name = message.current_alarm_name;
		ReadLocalSettings( (error) =>
		{
			 if(error) console.info(error);
			//await LogoutPage();
			 CheckLoginPage( (error) =>
			 {
				if(error) console.info(error);
				GotoPage( (error) =>
				{
					if(error) console.info(error);
				});
			 });
		});
	}
}
*/

var handler_errors = (err) => {
	if(err)
	{
		//window.alert(err);
		setTimeout("alert('"+err+"');", 1);
		console.info(err);
	}
}

chrome.storage.sync.get(["worldclass_current_alarm","worldclass_alarm_status"], (result)=>
{
	if(result.worldclass_current_alarm)
	{
		console.info("it begins");
		current_alarm_name = result.worldclass_current_alarm;
		console.info(current_alarm_name, result.worldclass_alarm_status);
		switch(result.worldclass_alarm_status)
		{
			
			
			case -1:
					ReadLocalSettings( (error) => {
						CheckLoginPage(handler_errors);
						chrome.storage.sync.set({worldclass_alarm_status:0}, () => {});
					});
					break;
			case 0:
					goto_iasi(handler_errors);
					chrome.storage.sync.set({worldclass_alarm_status:1}, () => {});
					break;
			case 1:
					ReadLocalSettings( (error) => {
						console.info(settings);
						submit_hour(settings.current_alarm.day, settings.current_alarm.time, settings.current_alarm.name, handler_errors);
						chrome.storage.sync.set({worldclass_alarm_status:2}, () => {});
					});
					break;
			case 2: //time to delete alarmname and all
					chrome.storage.sync.set({worldclass_alarm_status:null, worldclass_current_alarm:null});
					break;
		}
	}
});

