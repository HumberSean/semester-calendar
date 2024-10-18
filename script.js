//SEMESTER GENERATOR - SEAN DOYLE 
//V 3.0.0 DECEMBER 2023.
//Added Academic Calendar data from a Google sheet.
//Added a week after semester end to show grades due date.

//TO DO
/*
-Fix if special day is also first of month. (1st September Monday should have 'Holiday' in the text0

-Clean up code, add function descriptions.
-set char limit for caption?
-adjust algorithm to remove weekends?


*/
var firstDay = 6;// The first Monday of the semester.
var monthIndex = 8;//The DATE month (Jan = 0, Sep = 8).
var semester = "Fall 2021";//Table caption text.

window.onload = function() {
	var newRow;
	var newDay;
	const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const daysArray = [31,28,31,30,31,30,31,31,30,31,30,31];
	const leapYears = [2024, 2028, 2032, 2036];
	const thisYear = new Date().getFullYear();

	//Check for Leap Year to update Feb days
	if (leapYears.indexOf(thisYear) !== -1) {
		daysArray[1] = 29;
	}
	
	
	var captionText = document.getElementById("tbl__cptn");
	captionText.innerHTML = semester;

	var inputForm = document.forms.input__form;//Form handle.
	var tableData = document.getElementById("tbl__content");
	var printBtn = document.getElementById("input__print");
	
//========= FUNCTIONS ======================
//Function to print the calendar
	function printCalendar() {
		window.print();
	}//END printCalendar
	
//Function to update the calendar caption as text is entered.
function updateCaption(){
	if (inputForm.f__caption.value !== "") {
		inputForm.f__caption.style.background = "white";
	}
	captionText.innerHTML = inputForm.f__caption.value;
}//END updateCaption

//==== CALENDAR CREATION FUNCTIONS ====
//Function to adjust day for month
	function getDay(thisDay) {
		//start of month
		if (thisDay > daysArray[monthIndex]) {
			firstDay = 1;
			monthIndex++;
			return "<span class='tbl__month'>" + monthArray[monthIndex] + "</span> " + firstDay;
		} else {
			return thisDay;
		}
	}//END getDay

//Function to create the calendar table markup.
	function makeCalendar(DATA) {
	//Create 15 Weeks	i is the week(1-15) and j is the day of the week (1-7).
		for (let i=0; i < 16; i++) {
			//Create a new week row. If 8th week, indicate Reading Week. If end of semester, don't print the next week #.
			if (i < 7) {
				newRow = "<tr><td class='tbl__week'>" + (i + 1) + "</td>";
			}
			 else if (i === 7) {
				 newRow = "<tr><td class='tbl__week'>RW</td>";
			}
			 else if (i === 15) {
				 newRow = "<tr><td class='tbl__week'></td>";
			}
			else {
				newRow = "<tr><td class='tbl__week'>" + i + "</td>";
			}

			//Create 7 days
			for (let j = 0; j < 7; j++) {
				newDay = "<td class='tbl__day'>";

				//Check for first day of a new month.
				if (i === 0 && j === 0) {
					newDay += "<span class='tbl__month'>" + monthArray[monthIndex] + "</span> " + getDay(firstDay);
				} else {
					newDay += getDay(firstDay);
					//Check for special day
					if (DATA.dates.indexOf(monthArray[monthIndex]+ " " + firstDay)  !== -1){
						newDay += "<p class='daytext'>" + DATA.labels[DATA.dates.indexOf(monthArray[monthIndex]+ " " + firstDay)] + "</p>";
					}					
				}

				newDay += "</td>";//End the day
				newRow += newDay;//Append day to week
				firstDay++;
			}//end create 7 days
			
			//End the week row			
			newRow += "</tr>";
			
			//Append new row to the table
			tableData.innerHTML += newRow;
		}//end 15 weeks loop
	}//END makeCalendar
	
	function getSheetData(termIndex){
		//Set term string for query.
		var term = "";
		switch(termIndex){
			case "0":
				term = "winter";
				break;
			case "4":
				term = "summer";
				break;
			case "8": 
				term = "fall";
			default: 
				term = "fall";
				break;
		}
		const sheetID = '1xwejPPJypl0AhcNyC1dZfs38YPBs5W_VHsWaRmkkbE0';
		const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
		const sheetName = 'Sheet1';
		let qu = "Select C, D WHERE A = " + thisYear + " And B = '" + term +"'";// WHERE C = "active" And B = "Svekis"';
		console.log(qu);
		
		const query = encodeURIComponent(qu);
		const url = `${base}&sheet=${sheetName}&tq=${query}`;    
		const data = [];
		var dateLabelObj = {dates: [], labels:[]};
	  
		fetch(url)
			.then(res => res.text())
			.then(rep => {
				
				const jsData = JSON.parse(rep.substring(47).slice(0, -2));

				jsData.table.rows.forEach((evnt) => {
					dateLabelObj.dates.push(evnt.c[1].f);
					dateLabelObj.labels.push(evnt.c[0].v);
				})				
				
				//send data to next function
				makeCalendar(dateLabelObj);
	
			})//end fetch
	}//end getSheetData

	
	//FORM VALIDATION FUNCTION
	function validateForm() {
		//Validate caption Text
		if (inputForm.f__caption.value.trim() === "") {
			document.getElementById("lbl__caption").innerHTML = "<em>Please enter a caption for your calendar.</em>";
			inputForm.f__caption.focus();
			inputForm.f__caption.style.background = "red";

			return false;
		}
		
		//Validate day of month
		if (inputForm.f__day.value.trim() === "") {
			document.getElementById("lbl__day").innerHTML = "<em>Please enter a number for the day of the month.</em>";
			inputForm.f__day.focus();
			inputForm.f__day.style.background = "red";

			return false;
		} else {
			inputForm.f__day.style.background = "white";
		}


	//IF validation is good, hide form, show calendar with print button.
		//Hide form and show print button
		document.getElementById("input").style.display = "none";
		printBtn.style.display = "block";
		
		//Get month
		monthIndex = inputForm.f__month.value;
		
		//Get first day
		firstDay = inputForm.f__day.value;
		//Validate for number datatype
		firstDay = parseInt(firstDay);


		//Get caption text
		captionText.innerHTML = inputForm.f__caption.value;		
		

		getSheetData(monthIndex);
		//makeCalendar();

		return false;
	}//END validateForm


//LISTENERS
	printBtn.onclick = printCalendar;
	inputForm.onsubmit = validateForm;
	inputForm.f__caption.onkeyup = updateCaption;
}//end onload