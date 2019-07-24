var fs = require('browserify-fs');
var file = require('./config/config.json');
fsvr = require('file-saver');
function saveConfig() {
	console.log(fs)
	file.destinationIP = $('#rsipip').val();
	file.ipAddress = $('#sbusip').val();
	file.modbusConfig.mb_Port = $('#mbport').val();
	file.modbusConfig.coil_Size = parseInt($('#coil_Size').val())?parseInt($('#coil_Size').val()):4000;
	file.modbusConfig.holding_Size = parseInt($('#holding_Size').val())?parseInt($('#holding_Size').val()):4000;
	file.poll_Interval = parseInt($('#pollint').val())?parseInt($('#pollint').val()):10000;
	file.TimeoutPeriod = parseInt($('#timeout').val())?parseInt($('#timeout').val()):10000;
	file.logEnable = $('#legenable').val();
	file.modbusConfig.devices = getTableValues();
	fs.mkdir('/home', function() {
    fs.writeFile('/home/hello-world.txt', 'Hello world!\n', function() {
        fs.readFile('/home/hello-world.txt', 'utf-8', function(err, data) {
            console.log(data);
        });
    });
	});
	var blob = new Blob([JSON.stringify(file)], {type: "text/plain;charset=utf-8"});
	fsvr.saveAs(blob, "hello world.json");
}

$(".mySaveBtn").click(function () {
	saveConfig();
});
$("#addDevice").click(function () {
	date = new Date().toISOString();
	var row_id = date;
	var tbl = "";
	//loop through ajax row data
	tbl += '<tr row_id="' + row_id + '">';
	tbl += '<th ><div class="row_data" edit_type="click" col_name="fname">' + - + '</div></th>';
	tbl += '<th ><div class="row_data" edit_type="click" col_name="fname">' + 1 + '</div></th>';
	tbl += '<td ><div class="row_data" edit_type="click" col_name="lname">' + 1 + '</div></td>';
	tbl += '<td ><div class="row_data" edit_type="click" col_name="email">' + 0 + '</div></td>';
	tbl += '<td ><div class="row_data" edit_type="click" col_name="email">' + 12 + '</div></td>';
	tbl += '<td ><div class="row_data" edit_type="click" col_name="email">' + '4Z' + '</div></td>';
	tbl += '<td ><div class="row_data" edit_type="click" col_name="email">' + true + '</div></td>';

	//--->edit options > start
	tbl += '<td>';

	tbl += '<span class="btn_edit" > <a href="#" class="btn btn-link " row_id="' + row_id + '" > Edit</a> </span>';

	//only show this button if edit button is clicked
	tbl += '<span class="btn_save"> <a href="#" class="btn btn-link"  row_id="' + row_id + '"> Save</a> | </span>';
	tbl += '<span class="btn_cancel"> <a href="#" class="btn btn-link" row_id="' + row_id + '"> Cancel</a> | </span>';

	tbl += '</td>';
	//--->edit options > end

	tbl += '</tr>';
	$("#devList").append(tbl)
});

function getConfig() {
	$('#my-ip').html(file.ipAddress);
	$('#rsipip').val(file.destinationIP);
	$('#sbusip').val(file.ipAddress);
	$('#mbport').val(file.modbusConfig.mb_Port);
	$('#coil_Size').val(file.modbusConfig.coil_Size);
	$('#holding_Size').val(file.modbusConfig.holding_Size);
	$('#pollint').val(file.poll_Interval);
	$('#timeout').val(file.TimeoutPeriod);
	$('#legenable').val(file.logEnable);
	loadTableBody()
	return file;
}

getConfig();

/*function addRelay(subid, devid) {
  file.modbusConfig.devices.push({ "subnetid": subid, "deviceid": devid, "mb_Addr": 320, "noc": 7, "deviceType": "4Z", "poll": true })
  fs.writeFile(fileName, JSON.stringify(file), function (err) {
    if (err) return console.log(err);
    console.log('writing to ' + fileName);
  });
}*/
function loadTableBody() {
	//--->create table body > start
	// tbl +='<tbody>';
	var tbl = "";
	//--->create table body rows > start
	$.each(file.modbusConfig.devices, function (index, val) {
		//you can replace with your database row id
		var row_id = "id" + index.toString();;

		//loop through ajax row data
		tbl += '<tr row_id="' + row_id + '">';
		tbl += '<th ><div class="row_data" spellcheck="false" edit_type="click" col_name="fname">' + (index + 1) + '</div></th>';
		tbl += '<th ><div class="row_data" spellcheck="false" edit_type="click" col_name="fname">' + val['subnetid'] + '</div></th>';
		tbl += '<td ><div class="row_data" spellcheck="false" edit_type="click" col_name="lname">' + val['deviceid'] + '</div></td>';
		tbl += '<td ><div class="row_data" spellcheck="false" edit_type="click" col_name="email">' + val['mb_Addr'] + '</div></td>';
		tbl += '<td ><div class="row_data" spellcheck="false" edit_type="click" col_name="email">' + val['noc'] + '</div></td>';
		tbl += '<td ><div class="row_data" spellcheck="false" edit_type="click" col_name="email">' + val['deviceType'] + '</div></td>';
		tbl += '<td ><div class="row_data" spellcheck="false" edit_type="click" col_name="email">' + val['poll'] + '</div></td>';

		//--->edit options > start
		tbl += '<td>';

		tbl += '<span class="btn_edit" > <a href="#" class="btn btn-link " row_id="' + row_id + '" > Edit</a> </span>';

		//only show this button if edit button is clicked
		tbl += '<span class="btn_save"> <a href="#" class="btn btn-link"  row_id="' + row_id + '"> Save</a> | </span>';
		tbl += '<span class="btn_cancel"> <a href="#" class="btn btn-link" row_id="' + row_id + '"> Cancel</a> | </span>';

		tbl += '</td>';
		//--->edit options > end

		tbl += '</tr>';
	});

	//--->create table body rows > end
	$("#devList").append(tbl)
	$(document).find('.btn_save').hide();
	$(document).find('.btn_cancel').hide();
	// tbl +='</tbody>';
	//--->create table body > end
}

$(document).on('click', '.row_data', function (event) {
	event.preventDefault();

	if ($(this).attr('edit_type') == 'button') {
		return false;
	}

	//make div editable
	$(this).closest('div').attr('contenteditable', 'true');
	//add bg css
	$(this).addClass('bg-warning').css('padding', '5px');

	$(this).focus();
})

//--->button > edit > start	
$(document).on('click', '.btn_edit', function (event) {
	event.preventDefault();
	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');

	tbl_row.find('.btn_save').show();
	tbl_row.find('.btn_cancel').show();

	//hide edit button
	tbl_row.find('.btn_edit').hide();

	//make the whole row editable
	tbl_row.find('.row_data')
		.attr('contenteditable', 'true')
		.attr('edit_type', 'button')
		.addClass('bg-warning')
		.css('padding', '3px')

	//--->add the original entry > start
	tbl_row.find('.row_data').each(function (index, val) {
		//this will help in case user decided to click on cancel button
		$(this).attr('original_entry', $(this).html());
	});
	//--->add the original entry > end

});
//--->button > edit > end

//--->button > cancel > start	
$(document).on('click', '.btn_cancel', function (event) {
	event.preventDefault();

	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');

	//hide save and cacel buttons
	tbl_row.find('.btn_save').hide();
	tbl_row.find('.btn_cancel').hide();

	//show edit button
	tbl_row.find('.btn_edit').show();

	//make the whole row editable
	tbl_row.find('.row_data')
		.attr('edit_type', 'click')
		.removeClass('bg-warning')
		.css('padding', '')

	tbl_row.find('.row_data').each(function (index, val) {
		$(this).html($(this).attr('original_entry'));
	});
});
//--->button > cancel > end

//--->save whole row entery > start	
$(document).on('click', '.btn_save', function (event) {
	event.preventDefault();
	var tbl_row = $(this).closest('tr');

	var row_id = tbl_row.attr('row_id');


	//hide save and cacel buttons
	tbl_row.find('.btn_save').hide();
	tbl_row.find('.btn_cancel').hide();

	//show edit button
	tbl_row.find('.btn_edit').show();


	//make the whole row editable
	tbl_row.find('.row_data')
		.attr('edit_type', 'click')
		.removeClass('bg-warning')
		.css('padding', '')

	//--->get row data > start
	var arr = {};
	tbl_row.find('.row_data').each(function (index, val) {
		var col_name = $(this).attr('col_name');
		var col_val = $(this).html();
		arr[col_name] = col_val;
	});
	//--->get row data > end

	//use the "arr"	object for your ajax call
	$.extend(arr, { row_id: row_id });

	//out put to show
	$('.post_msg').html('<pre class="bg-success">' + JSON.stringify(arr, null, 2) + '</pre>')


});
//--->save whole row entery > end

//--->save single field data > start
$(document).on('focusout', '.row_data', function (event) {
	event.preventDefault();

	if ($(this).attr('edit_type') == 'button') {
		return false;
	}

	var row_id = $(this).closest('tr').attr('row_id');

	var row_div = $(this)
		.removeClass('bg-warning') //add bg css
		.css('padding', '')

	var col_name = row_div.attr('col_name');
	var col_val = row_div.html();

	var arr = {};
	arr[col_name] = col_val;

	//use the "arr"	object for your ajax call
	$.extend(arr, { row_id: row_id });

	//out put to show
	$('.post_msg').html('<pre class="bg-success">' + JSON.stringify(arr, null, 2) + '</pre>');

})
//--->save single field data > end


function getTableValues() {
	var oTable = document.getElementById('myTable');
	var devices = [];
    //gets rows of table
    var rowLength = oTable.rows.length;

    //loops through rows    
    for (i = 1; i < rowLength; i++){

      //gets cells of current row  
       var oCells = oTable.rows.item(i).cells;

       //gets amount of cells of current row
       var cellLength = oCells.length;

       //loops through each cell in current row
      //  for(var j = 0; j < cellLength-1; j++){

              // get your cell info here
			try {
				var dev = {
					'subnetid':parseInt($(oCells.item(1).innerHTML).html())?parseInt($(oCells.item(1).innerHTML).html()):0,
					'deviceid': parseInt($(oCells.item(2).innerHTML).html())?parseInt($(oCells.item(2).innerHTML).html()):0,
					'mb_Addr': parseInt($(oCells.item(3).innerHTML).html())?parseInt($(oCells.item(3).innerHTML).html()):0,
					'noc': parseInt($(oCells.item(4).innerHTML).html())?parseInt($(oCells.item(4).innerHTML).html()):0,
					'deviceType': $(oCells.item(5).innerHTML).html(),
					'poll': ($(oCells.item(6).innerHTML).html()=="true")?true:false
				
				}
				devices.push(dev);
				console.log(devices);
					// var cellVal = oCells.item(0).innerHTML;
					//  console.log($(cellVal).html());
				  } catch (err) {
								
							}
          //  }
	}
	return devices;
}