/**
 * Copyright 2021, Battelle Energy Alliance, LLC
 * Author: Zachary Priest @ Idaho National Laboratory
 *
 * Usage: node getData.js <databasename>
 */

const OrientDBClient = require("orientjs").OrientDBClient;
const fs = require("fs");
const { promisify } = require('util')
var mkdirp = require('mkdirp');
var createBinaryNGraph = require('./createBinaryGraph.js');
var startTime = process.hrtime();
var debug = true;


let vertices = '';
let edges='';
var dataBase1 = process.argv[2];
var dataBase2 = process.argv[3];

/*logging time*/
var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(startTime)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(startTime)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
}

/*merges vertex and edges returned form the orientdb Queries*/
const combineVertexEdge = async function(vertexList, edgeList) {
	var merged = {};
	merged['nodes'] = JSON.parse(vertexList);
	merged['edges'] = JSON.parse(edgeList);

	merged = JSON.stringify(merged);

  return [
    merged
  ];
}

/*Iteratively compares key/value pairs for libraries (database.json) compiled
for the same architecture with the same compiler flags
TODO: Lots, this never really worked. Idea was to be able to take two exported graphs, remove the similar items from the lists and get a result of the difference between two graphs
For this to work, it will need to be completely re-thought*/
const compareFunctionNodes = async function(liste1, liste2) {
	let x = 'testCompareFunctionNodes';

	let list1 = JSON.parse(liste1);
	let list2 = JSON.parse(liste2);

	if( list1 && list2){
		var bigKey, smallKey = 0;
		// console.log("LIST: ", JSON.parse(list1));
		keynodes1 = Object.keys(list1.nodes);
		keylinks1 = Object.keys(list1.edges);
		keynodes2 = Object.keys(list2.nodes);
		keylinks2 = Object.keys(list2.edges);

		valuenodes1 = Object.values(list1.nodes);
		valuenodes2 = Object.values(list2.nodes);
		valuelinks1 = Object.values(list1.edges);
		valuelinks2 = Object.values(list2.edges);

		if(keynodes1.length > keynodes2.length){
			bigKey = keynodes1.length;
			smallKey = keynodes2.length;
		}else{
			bigKey = keynodes2.length;
			smallKey = keynodes1.length;
		}
		console.log('bigKey: ', bigKey);
		console.log('smallKey: ', smallKey);
		// 		const iterate = (obj) => {
//     Object.keys(obj).forEach(key => {
//
//     console.log('key: '+ key + ', value: '+obj[key]);
//
//     if (typeof obj[key] === 'object') {
//             iterate(obj[key])
//         }
//     })
// }

	if(debug) elapsed_time("start loop()");

		for(var i = 0; i< bigKey; i++){
			for(var j = 0; j < smallKey; j++){
				// console.log('-------------------------');
				// console.log(valuenodes1[i]);
				// console.log(valuenodes2[j]);
				// console.log('-------------------------');
				if(valuenodes1[i] == valuenodes2[j]){
					console.log('values are the same', keynodes[i] + ' ' + keynodes[j]);
					console.log(valuenodes1[i]);
					console.log(valuenodes2[j]);

				}
			}

      //Didn't work
			// if(key1[i] == key2[i] && value1[i] == value2[i]){
			// 	// console.log('same keys '+ key1[i] + ' ' + key2[i]);
			// }else{
			// 	console.log('different keys & values ' + key1[i] + ' ' +key2[i] + ' ' + key1[i] + ' ' +key2[i]);
			// }
		}
		if(debug) elapsed_time("end readFile()");


	}else{
		console.log('Must enter two database exports in JSON format as arguments.');
		console.log('node compareTest.js <export1> <export2>');
	}
  return [
    x
  ];
}

/*Creates the directory to save files to if it doesn't exist*/
async function ensureDir(dirpath) {
	if (!fs.existsSync(dirpath)) {
		mkdirp.sync(dirpath);
	}
}

/*Saves the file*/
async function saveFile(fileName, mergedData){
		fs.writeFileSync(fileName, mergedData,(error) => {console.log('Error saving file: ', error)});
}

/*Reads and parses a json file*/
//TODO: Test err
async function readFile(fileName){
	parsedJSON = '';
	console.log(fileName);
	const file = await fs.readFileSync(fileName, (err, data) => {
			if (err){
				console.log("Error Reading file: \n", err);
			} else {
				// console.log(JSON.parse(data));
				// parsedJSON = JSON.parse(data[1]);
				// console.log(parsedJSON);
			}
	});
	// console.log(JSON.parse(file));
	return file;
}

/*Checks if a specific file is already saved and sets a boolean value.*/
async function checkFile(fileName){
	let create = false;
	if(!fs.existsSync(fileName)){
		create = true;
	}
	return create;
}

/*Select from  E where @class != "next_instruction" AND @class != "has_feature"
* Queries the database for the information we want for either our static(galaxy) or dynamic(webgl). Saves to a file in largegraph_data directory
*
* TODO: Change to check first, if the directory/file for given databasename (ala: brad_busybox.json) already exists.  If so, don't bother pulling down new database (will save time)
* TODO: Fix webgl as a command line argument?
* Usage:
*/
const query = async function(db) {
	let merged = '';
	let dirpath = './largegraph_data';
	let fileName = dirpath + '/' + db + '.json';
	try{

		let client = await OrientDBClient.connect({
		  host: "localhost",
		  port: 2424
		});

		try{
			let session = await client.session({ name: db, username: "root", password: "temppass" });

			try{
				await ensureDir(dirpath);
				let canCreate = await checkFile(fileName);
				if(canCreate === true){
					let result = await session.query("Select @rid as id, color as color, name as label, map('id', @rid, 'class', @class, 'name', name, 'function', function, 'block_id', block_id, 'uid', uid) as data from V where @class != 'feature' AND @class != 'instruction'").all();
					// let result = await session.query("Select @rid as id, name as label, map('id', @rid, 'class', @class, 'name', name, 'function', function, 'block_id', block_id, 'uid', uid) as data from V where @class != 'feature' AND @class != 'instruction' AND @class != 'block'").all();

					for (let index = 0; index < result.length; ++index){ //modify javascript array to work with small_graph
						result[index].classes = [];
						//set node colors here with switch statement. (function / library)
						result[index].color = '#8157b3';
						if (result[index].class == 'library'){
							result[index].classes.push(result[index].class);
							result[index].classes.push('calls');
						} else{
							result[index].classes = null;
						}
						console.log('test', result[index]);
					}

					vertices = JSON.stringify(result);
					let result2 = await session.query("Select @rid as id, color as color, @class as label, out as source, in as target, map('source', out, 'target', in, 'class', @class, 'id', @rid) as data from E where @class != 'next_instruction' AND @class != 'has_feature'").all();
					// let result2 = await session.query("Select @rid as id, @class as label, out as source, in as target, map('source', out, 'target', in, 'class', @class, 'id', @rid) as data from E where @class != 'next_instruction' AND @class != 'has_feature' AND @class != 'calls' AND @class != 'has_block' AND @class != 'branch_true' AND @class != 'branch_false' AND @class != 'branch_unconditional'").all();

					for (let index = 0; index < result2.length; ++index){ //modify javascript array to work with small_graph
						result2[index].classes = [];
						result2[index].classes.push(result2[index].label);
						result2[index].classes.push('calls');
						console.log('test', result2[index]);
					}

					edges = JSON.stringify(result2);
					// edges.forEach(label => console.log('this test', label));
					merged = await combineVertexEdge(vertices, edges);

					// await saveFile(fileName, merged);

				}else if(canCreate === false){
					//TODO: Set vertices and results to the FILESYSTEM fileName
					console.log('cannot create, passing back file');
					merged = await readFile(fileName);

				}else{
					console.log('error in query()');
				}
			} catch (err) {
				console.log('Error creating directory: \n', err);
			}

			console.log('closing session');
			await session.close();
		} catch (error) {
			console.log("Error opening the database: \n", error);
		}
		console.log("closing client");
		await client.close();

	} catch(err) {
		console.log("Error in client: \n", err);
	}
	return merged;
}

/*Accepts two extracted database files to compare against*/
const startCompare = async function(dirpath, dataBase1, dataBase2) {
	let fileName1 = dirpath + '/' + dataBase1 + '.json';
	let fileName2 = dirpath + '/' + dataBase2 + '.json';

	//save
	// for(int i = 1; i <= 2; i++){
	// 	console.log("dataBase"+i);
	// 	let merged = await query(dataBase+i);
	// 	let fileName = dirpath + '/' + dataBase+i + '.json';
	// 	await saveFile(fileName, merged);
	// }

	//query the databases
	let merged1 = await query(dataBase1);
	let merged2 = await query(dataBase2);
	//save the files
	await saveFile(fileName1, merged1);
	await saveFile(fileName2, merged2);

	//TODO: Recursively compare two structures
	const compared = await compareFunctionNodes(merged1, merged2);
	// console.log('our compared: ', compared);
}

/* This is where we begin asynchronous work
*  If two databases are sent in at one call, we know we need to compare them. Otherwise query and save the file in the format
*  startCompare
*/
const begin = async function() {
	let dirpath = './smallgraph_data'; //location to save the data (database.json) files.

	if(dataBase1 && dataBase2){
		await startCompare(dirpath, dataBase1, dataBase2);
	}else if(dataBase1 && !process.argv[3]){
		let fileName = dirpath + '/' + dataBase1 + '.json';

		//query the database, merge vertex with edges
		let merged = await query(dataBase1);

		merged = merged.toString();
		// fileName = fileName.toString();
		//save the file/Users/priezm/repos/fitviz/getData.js
		await saveFile(fileName, merged);

		//create ngraph structure for static view
		var ret = await createBinaryNGraph(dataBase1, merged);
		console.log('we have finished with code', ret);
	}else{
		//console.log("Must enter one to two database names to extract information from in the following format:");
		console.log("Must enter a database name to extract information out of:");
		console.log("Usage: node getData.js <databasename>");
		//console.log("Usage: node getData.js <databasename1> [<databasename2>]");
	}
}

if(debug) console.log("----------------------------------");
if(debug) elapsed_time("recieved request");

begin();
