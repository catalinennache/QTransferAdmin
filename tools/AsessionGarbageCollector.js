
 class AsessionGarbageCollector{

	

	constructor(maximum_asession,sleep_minutes,connection){
		this.stopped = false;
		this.intervalID = undefined;
		this.onsessiondestroy = undefined;
		if(!connection){
			mysql = require('mysql');
			connection = mysql.createConnection({
			  host: "localhost",
			  user: "root",
			  password: "",
			  database:"qtransfer"
			});
		}
		
		connection.connect(async (err)=> {
			//var max_asession_time = parseInt(process.argv[2]);
			console.log("Starting AGC Service...");
			setInterval(()=>{
				if(!this.stopped){
					connection.query("select * from asessions",async (err,results)=>{
					  if(err) throw err;
					  var del_asess = 0;
						
					  for(var i = 0; i<results.length; i++){
						  var cdate = Date.parse(results[i].creation_date);
						  cdate = new Date(cdate);
						  cdate.setTime((cdate.getTime() + (maximum_asession*60*60*1000)));
						  if(new Date().getTime() > cdate){
							del_asess++;
						  	await new Promise((resolve,reject)=>{connection.query("select * from asession_contents where asession_pk = '"+results[i].id+"'",(err,acontents)=>{
								  for(var asession_content in acontents){
									  if(asession_content.file_path){
										  var fs = require('fs');
										  fs.unlinkSync('/Projects/QTransfer/asession_uploads/'+asession_content[asession_content].file_path);
									  }
								  }
								 

								  if(this.onsessiondestroy && typeof this.onsessiondestroy === 'function' ){
									this.onsessiondestroy(results[i].asession_id);
								  }
								  connection.query("delete from asession_contents where asession_pk = '"+results[i].id+"'");
								  connection.query("delete from asessions where id = '"+results[i].id+"'");
								  
								  resolve();
							});});
						  }
		  
					}
		  
						console.log("deleted "+del_asess +" asessions");
					})
				console.log("scan finished");
				//await this.sometime(sleep_minutes);
			  	}
			  
		  
			},sleep_minutes*60*1000);
		})
	}
  
   	sometime(minutes){
		return new Promise((resolve,reject)=>{
			setTimeout(function(){
				resolve(true);
			}.bind(resolve),minutes*60*1000)
		})
	}
	 
	stop(){
		this.stopped = true;
	}
}

module.exports = AsessionGarbageCollector;

  