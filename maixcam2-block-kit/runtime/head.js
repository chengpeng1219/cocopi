function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName, i;
	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? null : sParameterName[1];
		}
	}
	return null;
}
var LANGUAGE = getUrlParameter("lang");
if (LANGUAGE == null) {
	LANGUAGE = localStorage.handPyLanguage ? localStorage.handPyLanguage : "zh-CN";	
}
function showfile(b) {
	if (b) {
		document.getElementById("restore-file-upload").style.visibility = "visible";
		$("#restore-file-upload").val("");
		$("#restore-file-upload").trigger("click");
	} else {
		document.getElementById("restore-file-upload").style.visibility = "hidden";
	}
}

function setDevice(device) {
	function getLang() {
		if (localStorage.handPyLanguage) {
			return localStorage.handPyLanguage;
		} else {
			return "zh-CN";
		}
	}
	disconnectCom();
	localStorage.handPyDevice = device;
	var lang = getLang();
	switch (device) {
		case "CocoRobobox":
			location.replace('editor_box.html?lang=' + lang);
			break;
		case "microbit":
			location.replace('editor_microbit.html?lang=' + lang);
			break;
		default:			
			location.replace('editor.html?lang=' + lang);
			break;
	}
}

function doRouter(lang) {
	function getDevice() {
		if (localStorage.handPyDevice) {
			return localStorage.handPyDevice;
		} else {
			return "CocoRobo";
		}
	}
	function routerTo(_device, _lang) {
		if ('zh-TW' == _lang) _lang = 'zh-HK';
		switch(_device) {
			case 'CocoRobobox':
				location.replace('editor_box.html?lang=' + _lang);
				break;
			case 'microbit':
				location.replace('editor_microbit.html?lang=' + _lang);
				break;
			default:
				location.replace('editor.html?lang=' + _lang);
				break;
		}
	}
	disconnectCom();
	localStorage.handPyLanguage = lang;
	routerTo(getDevice(), lang);
}

VERSION = " X 0.5.0";
var VERSION_NO = "0.5.0";
var hasInternet = false;
var newVersion = VERSION_NO;
var newDescription = "";
var newLink = "";
var OFFICE_HARDWARD_DATE = "2019-11-25";
var OFFICE_HARDWARD_VERSION = "v1.5.1-16";
var CocoRoboBOX_HARDWARD_DATE = "2019-10-16";
var CocoRoboBOX_HARDWARD_VERSION = "v1.0.0-20";
function doNothing(){  
	window.event.returnValue = false;  
	return false;  
}
