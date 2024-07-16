const datajsV = new FormData();
const bodyJsV = document.querySelector("body");
const timeJsV = new Date();
const requiresJsV = {
	geo: false,
	cookies: false,
	document: false,
	location: false,
	navigator: false,
	window: false,
};

datajsV.set("origen", "JSDataV");
datajsV.set("js_ready", false);
datajsV.set("js_navGeoLat", 0);
datajsV.set("js_navGeoLon", 0);
datajsV.set("js_navGeolocAct", 0);
datajsV.set("js_navUtcComplete", -1);

function vGeo() {
	//data from geolication API
	if (navigator.geolocation) {
		bodyJsV.addEventListener("click", geoClicky);
		bodyJsV.addEventListener("contextmenu", geoClicky);
	} else {
		datajsV.set("js_navGeolocAct", 1);
		requiresJsV.geo = true;
	}
}

function geoClicky() {
	navigator.geolocation.getCurrentPosition(
		function (e) {
			datajsV.set("js_navGeolocAct", 2);
			datajsV.set(
				"js_navGeoLat",
				Math.round(e.coords.latitude * 10000000) / 10000000
			);
			datajsV.set(
				"js_navGeoLon",
				Math.round(e.coords.longitude * 10000000) / 10000000
			);
			requiresJsV.geo = true;
			visitor(datajsV);
		},
		function (e) {
			let err = "";
			switch (e.code) {
				case e.PERMISSION_DENIED:
					err = 3;
					break;
				case e.POSITION_UNAVAILABLE:
					err = 4;
					break;
				case e.TIMEOUT:
					err = 5;
					break;
				default:
					err = 0;
			}
			datajsV.set("js_navGeolocAct", err);
			delete err;
			requiresJsV.geo = true;
			visitor(datajsV);
		},
		{
			enableHighAccuracy: true,
			timeout: 20000,
			maximumAge: 60,
		}
	);
	bodyJsV.removeEventListener("click", geoClicky);
	bodyJsV.removeEventListener("contextmenu", geoClicky);
}

function vCookies() {
	//Cookies Data
	datajsV.set("js_navCookies", "Disabled");
	if (navigator.cookieEnabled) {
		datajsV.set("js_navCookies", document.cookie);
	}
	datajsV.set("js_navLang", navigator.language);
	requiresJsV.cookies = true;
}

function vDocument() {
	//HTML Document Data
	datajsV.set("js_navDomain", encodeURIComponent(document.domain));
	datajsV.set(
		"js_navSourcePage",
		encodeURIComponent(document.referrer || "Unknown")
	);
	datajsV.set(
		"js_navViewPort",
		document.documentElement.clientWidth +
			"x" +
			document.documentElement.clientHeight
	);
	requiresJsV.document = true;
}
function vLocation() {
	//Location API data
	datajsV.set("js_navURL", encodeURIComponent(location.href));
	requiresJsV.location = true;
}

function vNavigator() {
	//navigator. data
	datajsV.set("js_navVendor", navigator.vendor);
	let ua =
		JSON.stringify(navigator.userAgentData) ||
		navigator.userAgent ||
		"Unavailable";
	datajsV.set("js_navUsrAgent", ua);
	delete ua;
	datajsV.set("js_pcCPUProcessor", navigator.hardwareConcurrency);
	requiresJsV.navigator = true;
}

function vWindow() {
	//window.
	datajsV.set(
		"js_pcScrRes",
		window.screen.width * window.devicePixelRatio +
			"x" +
			window.screen.height * window.devicePixelRatio
	);
	datajsV.set("js_pcScrPxRatio", window.devicePixelRatio);
	let innerWidth =
		window.innerWidth ||
		document.body.clientWidth ||
		document.documentElement.clientWidth;
	let innerHeight =
		window.innerHeight ||
		document.body.clientWidth ||
		document.documentElement.clientHeight;
	datajsV.set("js_navWinSize", innerWidth + "x" + innerHeight);
	delete innerWidth, innerHeight;
	requiresJsV.window = true;
}
function vGpu() {
	//GPU data
	let webGl = "";
	let canvasJsV = document.createElement("canvas");
	canvasJsV.id = "glcanvas";
	canvasJsV.width = 0;
	canvasJsV.height = 0;
	bodyJsV.appendChild(canvasJsV);

	canvasJsV = document.getElementById("glcanvas");
	let gl = canvasJsV.getContext("experimental-webgl");
	let renderer = gl.getParameter(gl.RENDERER);

	if (fnBrowserDetect() != "firefox") {
		webGl = getUnmaskedInfo(gl).renderer;
	}
	datajsV.set(
		"js_pcGpu",
		renderer != webGl ? renderer + " / " + webGl : renderer
	);
	delete gl, renderer, webGl, canvasJsV;
	document.getElementById("glcanvas").remove();
}

function getUnmaskedInfo(gl) {
	let unMaskedInfo = {
		renderer: "",
		vendor: "",
	};

	let dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");

	if (dbgRenderInfo != null) {
		unMaskedInfo.renderer = gl.getParameter(
			dbgRenderInfo.UNMASKED_RENDERER_WEBGL
		);
		unMaskedInfo.vendor = gl.getParameter(
			dbgRenderInfo.UNMASKED_VENDOR_WEBGL
		);
	}

	return unMaskedInfo;
}

function visitor(data) {
	const preloader = document.getElementById("preloader");

	if (preloader != null && preloader.dataset.wait == 1) {
		return;
	}
	let complete = true;
	for (const req in requiresJsV) {
		if (requiresJsV[req] === false) {
			complete = false;
		}
	}

	if (complete) {
		data.set("js_ready", true);
		let scripts = document.getElementsByTagName("script");
		for (let item of scripts) {
			if (item.src.indexOf("geo.js") != -1) {
				item.remove();
			}
		}
		let time = new Date();
		data.set(
			"js_navUtcComplete",
			Math.floor(
				Date.UTC(
					time.getFullYear(),
					time.getMonth(),
					time.getDay(),
					time.getHours(),
					time.getMinutes(),
					time.getSeconds()
				) / 1000
			)
		);
		delete datajsV;
		delete bodyJsV;
	}
	ajaxSubmit(data);
	return;
}

function fnBrowserDetect() {
	let userAgent =
		JSON.stringify(navigator.userAgentData) || navigator.userAgent;
	let browserName;

	if (userAgent.match(/chrome|chromium|crios/i)) {
		browserName = "chrome";
	} else if (userAgent.match(/firefox|fxios/i)) {
		browserName = "firefox";
	} else if (userAgent.match(/safari/i)) {
		browserName = "safari";
	} else if (userAgent.match(/opr\//i)) {
		browserName = "opera";
	} else if (userAgent.match(/edg/i)) {
		browserName = "edge";
	} else {
		browserName = "No browser detection";
	}
	return browserName;
}

vGeo();
vDocument();
vCookies();
vLocation();
vNavigator();
vWindow();
vGpu();
datajsV.set(
	"js_navUtcTimeRun",
	Math.floor(
		Date.UTC(
			timeJsV.getFullYear(),
			timeJsV.getMonth(),
			timeJsV.getDay(),
			timeJsV.getHours(),
			timeJsV.getMinutes(),
			timeJsV.getSeconds()
		) / 1000
	)
);
datajsV.set("js_navTimeRun", Math.floor(timeJsV.getTime() / 1000));
console.log(datajsV)
