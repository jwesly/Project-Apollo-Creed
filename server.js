var express = require('express');
var bodyParser = require('body-parser')

var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(bodyParser.raw());
app.use(bodyParser.text());



console.log("server starting");
app.post('/',function(req,res){
	//console.log("post recieved");
	res.send("meh");
	//if(ismulti)
		processRequest(req.body.name,req.body.block,req.body.sync);
});

var health1 = 1000;
var health2 = 1000;
var gover = false;
var gstart = false;

var countdown = 60;
var sscore = 0;
app.post('/weight',function(req,res){
	res.send("meeh");
	console.log(req.body);
	console.log(req.body.p1weight,req.body.p2weight);
	if(req.body.p1weight)
		p1weight = req.body.p1weight;
	if(req.body.p2weight)
		p2weight = req.body.p2weight;

})
app.set('view engine','jade');
app.use(express.static('static'));

app.get('/',function(req,res){
	res.render('index');
});
var keyz = [];
keyz[0] = "1.right";
keyz[1] = "1.left";
keyz[2] = "2.right";
keyz[3] = "2.left";

var getKey = function(str){
	return keyz.indexOf(str);
}

var blocks = [];
var syncs = [];
var punchType = "";
for(var i=0; i < 4; i++){
	blocks[i] = false;
	syncs[i] = false
}


var punchNum = 0;
var blockNum = 0;

app.post('/punch',function(req,res){
	res.send("ow");
	punchNum++;
	console.log(req.body.type,req.body.punch);
	punchType = req.body.type;
	var p = req.body.name.split(".")[0];
	if(ismulti){
	//.log("here");		//multiplayer punch
	if(gover)
		return;
	if(!gstart)
		return;
	if(health2<0){
		console.log("Player 1 Wins!!!");
		gover = true;
		gstart = false;
		return;
	}
	if(health1<0){
		console.log("Player 2 Wins!!!");
		gover = true;
		gstart = false;
		return;
	}
		var punch = req.body.punch;
		if(punch>0&&syncs[0]&&syncs[1]&&syncs[2]&&syncs[3]){
		//console.log(p1left,p1right,p2left,p2right);
		var name = req.body.name;
		if(name=="1.right"&&blocks[3]||name=="1.left"&&blocks[2]||name=="2.right"&&blocks[1]||name=="2.left"&&blocks[0]){
			punch = punch*.2;//reduce punch by 80% if blocked
			console.log("punch blocked");
			blockNum++;
		}
		
		if(p==1){
			health2=health2-punch;
			console.log("Player 2 Health: ",health2);
		}
		if(p==2){
			health1 = health1-punch;
			console.log("Player 1 Health: ",health1);
		}
	}
	}
	else{
		if(p=="1"&&countdown>0){
			//console.log(countdown,sscore);
			sscore = sscore + Number(req.body.punch);
		}
	}
});


var cdown = function(){
	setTimeout(function(){
		countdown--;
		if(countdown<=0){
			gover = true;
			return;
		}
		cdown();
		},1000);
}

app.post('/start',function(req,res){
	res.send("starting");
	gstart = true;
	if(req.body.game=="1")
		cdown();
});

var p1weight = 130;
var p2weight = 130;
var ismulti = true;

var reset = function(){
	health1 = 1000;
	health2 = 1000;
	sscore = 0;
	countdown = 60;
	gover = false;
	punchNum = 0;
	blockNum = 0;
}

app.get('/reset',function(req,res){
	res.send("success");
	reset();
});


app.get('/status',function(req,res){
	var jsn = '{'
	+'"health1":"'+ String(health1)
	+ '","health2":"'+String(health2)
	+ '","sync1r":"'+String(syncs[0])
	+ '","sync1l":"'+String(syncs[1])
	+ '","sync2r":"'+String(syncs[2])
	+ '","sync2l":"'+String(syncs[3])
	+ '","punchNum":"'+String(punchNum)
	+ '","blockNum":"'+String(blockNum)
	 +'"}';
	res.send(jsn);
	ismulti = true;
})
app.get('/sstatus',function(req,res){
	var response = '{"time":"'+String(countdown)
		+ '","score":"'+String(sscore)
		+ '","punchNum":"'+String(punchNum)
		+ '","type":"'+String(punchType)
		+ '","sync1r":"'+String(syncs[0])
	+ '","sync1l":"'+String(syncs[1])
		+ '"}';
	res.send(response);
	ismulti = false;
})

app.listen(80);


var bool = function(x){
	if(x=="true")
		return true;
	return false;
}




var processRequest = function(name,block,sync){
var p = name.split(".")[0];
	//console.log(bool(sync));
	var mkey = getKey(name);
	blocks[mkey] = bool(block);
	syncs[mkey] = bool(sync);
};
