//BrowserDetect.browser
//BrowserDetect.version
//BrowserDetect.OS

var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
        this.version = this.searchVersion(navigator.userAgent)
            || this.searchVersion(navigator.appVersion)
            || "an unknown version";
        this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
        for (var i=0;i<data.length;i++)	{
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            this.versionSearchString = data[i].versionSearch || data[i].identity;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            }
            else if (dataProp)
                return data[i].identity;
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        { 	string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
        },
        {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
        },
        {
            prop: window.opera,
            identity: "Opera",
            versionSearch: "Version"
        },
        {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
        },
        {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
        },
        {		// for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
        },
        {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
        },
        { 		// for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
        }
    ],
    dataOS : [
        {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
        },
        {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
        },
        {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
        },
        {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
        }
    ]

};
BrowserDetect.init();
var SpeedDetect = {
    init: function(){
     var that = this;
var imageAddr = topUrl + "/img/background.jpg" + "?n=" + Math.random();
var startTime, endTime;
var downloadSize = 64000;
var download = new Image();
download.onload = function () {
    endTime = (new Date()).getTime();
    that.duration = (endTime - startTime) / 1000;
    that.bitsLoaded = downloadSize * 8;
    that.speedBps = (that.bitsLoaded / that.duration).toFixed(2);
    that.speedKbps = (that.speedBps / 1024).toFixed(2);
    that.speedMbps = (that.speedKbps / 1024).toFixed(2);
    console.log("Your connection speed is: \n" +
        that.speedBps + " bps\n"   +
        that.speedKbps + " kbps\n" +
        that.speedMbps + " Mbps\n" );
    showResults();
}
startTime = (new Date()).getTime();
download.src = imageAddr;

function showResults() {

    console.log("Your connection speed is: \n" +
        SpeedDetect.speedBps + " bps\n"   +
        SpeedDetect.speedKbps + " kbps\n" +
        SpeedDetect.speedMbps + " Mbps\n" );
}
}
}
SpeedDetect.init();


Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

//http://smart-ip.net/geoip-json
//{
//    "source":"smart-ip.net"
//    "host":"193.178.146.17",
//    "lang":"en",
//    "countryName":"Ukraine",
//    "countryCode":"UA",
//    "city":"Kiev",
//    "region":"Kyyivs'ka Oblast'",
//    "latitude":50.4333,
//    "longitude":30.5167,
//    "timezone":"Europe/Kiev"
//}