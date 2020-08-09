
 var mysql = require('mysql');
 var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database:"qtransfer"
  });
  global.sql_connection = con;
  
  global.sql_connection.connect(async function(err) {
	var max_asession_time = parseInt(process.argv[2]);

	while(true){
		con.query("select * from asessions",async function(err,results){
			if(err) throw err;
			var del_asess = 0;
			var del_acont = 0;
		//	console.log(results);
			for(var i = 0; i<results.length; i++){
				var cdate = Date.parse(results[i].creation_date);
				cdate = new Date(cdate);
				cdate.setTime((cdate.getTime() + (max_asession_time*60*60*1000)));
				if(new Date().getTime() > cdate){
					console.log("oldie detected");
					del_asess++;
				await new Promise((resolve,reject)=>{con.query("select * from asession_contents where asession_pk = '"+results[i].id+"'",function(err,acontents){
						for(var asession_content in acontents){
							if(asession_content.file_path){
								var fs = require('fs');
								fs.unlinkSync('/Projects/QTransfer/asession_uploads/'+asession_content[asession_content].file_path);
							}
						}
						del_acont += acontents.length;
						con.query("delete from asession_contents where asession_pk = '"+results[i].id+"'");
						con.query("delete from asessions where id = '"+results[i].id+"'");
						resolve();
					});});
				}

			}

			console.log("deleted "+del_asess +" asessions with "+del_asess+" contents");
		})
		console.log("scan finished");
			await sometime(1);
	}
	

  })

  function sometime(minutes){
	 return new Promise((resolve,reject)=>{
		 setTimeout(function(){
			resolve(true);
		 }.bind(resolve),minutes*60*1000)
	 })
  }