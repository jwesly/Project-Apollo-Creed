var Myo = require('myo');
var request = require('request');

var host = "http://10.59.67.242/";
//Start talking with Myo Connect
Myo.connect();

var keyz = [];
keyz[0] = "1.right";
keyz[1] = "1.left";
keyz[2] = "2.right";
keyz[3] = "2.left";

var getKey = function(str){
	return keyz.indexOf(str);
}

var punch = [];
punch[0] = {};
punch[1] = {};
punch[2] = {};
punch[3] = {};

var spitch = [];

for(var i = 0; i < 4; i++){
	punch[i].y = 0;
	punch[i].z = 0;
}


Myo.on("connected",function(){
	Myo.setLockingPolicy("none");
});

var sqr = function(x){
	return x*x;
}
var call = 0;
Myo.on('imu',function(data){
	var mkey = getKey(this.name);
	var vec = Math.pow(sqr(data.accelerometer.y)+sqr(data.accelerometer.z),.5);
	var o = data.orientation;
	var pitch = Math.asin(Math.max(-1,Math.min(1,2*(o.w*o.y-o.z*o.x))));
	//console.log(data.gyroscope);
	//console.log(data.accelerometer.z,pitch);
	if(vec>2&&data.accelerometer.z>.7){
		if(punch[mkey].z==0)
			spitch[mkey] = pitch;
		punch[mkey].z+=data.accelerometer.z;//punch registered
		punch[mkey].y+=data.accelerometer.y;
		//console.log("q",call,data.accelerometer.z);

	}
	else if(punch[mkey].z>0&&(pitch-spitch[mkey])<-.001){
		punch[mkey].y=0;
		punch[mkey].z=0;
	}
	else if(punch[mkey].z>0){
			var mpunch = Math.pow(sqr(punch[mkey].y)+sqr(punch[mkey].z),.5);
			var type;
			var x = this.name.split(".");
			if(pitch-spitch[mkey]>1.5){
				type = "Player "+String(x[0]) + " "+ String(x[1]) +" uppercut";
			}
			else{
				type = "Player "+String(x[0]) + " "+ String(x[1]) +" jab";
			}
			console.log(type,(pitch-spitch[mkey]));
			request.post(host+"punch").form({"name":this.name,"punch":mpunch,"type":type});
			punch[mkey].y=0;
			punch[mkey].z=0;
	}
	else{
		vec = 0;//no punch registered
	}
	var o = data.orientation;
	var pitch = Math.asin(Math.max(-1,Math.min(1,2*(o.w*o.y-o.z*o.x))));
	var minpitch = .8;
	var block = pitch>minpitch;

	//send request
	

	request.post(host).form({"name":this.name,"block":block,"sync":this.synced});

})

