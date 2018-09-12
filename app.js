function togglePopup (event) {
	// get the id of the popup
	var id = event.target.getAttribute("data-target");
	var popup = document.getElementById(id);
	popup.style.display = popup.style.display === "block" ? "none" : "block";
	document.body.style.overflow = document.body.style.overflow === "hidden" ? "auto" : "hidden";
}
function startTime (duration, durationEndCallBack) {
	duration = duration * 60;
	document.getElementById("timeDuration").innerText = "00:" + Math.floor(duration/60) + ":" + duration % 60
	var token = setInterval(function () {
		duration--;
		document.getElementById("timeDuration").innerText = "00:" + Math.floor(duration/60) + ":" + duration % 60
		if (duration === 0) {
			clearInterval(token);
			if (durationEndCallBack) {
				durationEndCallBack();
			}
		}
	}, 1000)
}

function xhr (url, data, successCB) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	    	successCB(JSON.parse(xhttp.response))
	    }
	}
	xhttp.open("GET", url, true)
	xhttp.send(data);
}

function createLinesFromStringWithWordCount (string, wordCount) {
	// store all words from the string
	var words = string.split(" ")
	var chunks = []
	// create chunks of words with wordCount number of works in each chunk
	for (var i = 0; i < words.length; i = i + wordCount) {
		chunks.push(words.slice(i, i + wordCount).join(" "))
	}
	return chunks
}

// get the popup togglers: array of toggler
var popupTogglers = document.getElementsByClassName("js-togglePopup");
// attach event listener to popup toggle
for (var i = popupTogglers.length - 1; i >= 0; i--) {
	var popupToggler = popupTogglers[i]
	popupToggler.addEventListener("click", togglePopup)
}
var  readline = document.getElementById("read_line"), typeline = document.getElementById("type_line");
const queryParams = location.search.substring(1).split("&").map(function map(v) { return v.split("=") }).reduce(function reduce(retValue, arr) { retValue[decodeURIComponent(arr[0])] = decodeURIComponent(arr[1]); return retValue; }, {});
if (queryParams.selectedExercise) {
	var selectedExerciseNo = parseInt(queryParams.selectedExercise) - 1;
 	xhr("./exercises.json", null, function onSuccess(data) {
 		// current line no of the exercise
		var lineNo = 0;
		// selected language
		var selectedLanguage
		// duration of the exercise
		var duration = 0
		// all the typed lines
		var typedLines = {
			"hindi": [],
			"english": []
		}
		if (queryParams.selectedLanguage == "Hindi") {
			selectedLanguage = "hindi";
			duration = queryParams.hindiTypingDuration;
			// change the font-family to support the hindi fonts
			readline.setAttribute("lang", "hindi")
			typeline.setAttribute("lang", "hindi")
		} else if (queryParams.selectedLanguage == "English") {
			selectedLanguage = "english"
			duration = queryParams.englishTypingDuration

		} else if (queryParams.selectedLanguage == "Both") {
			selectedLanguage = "both"
			// pick the duration from any of the selected durations
			duration = queryParams.englishTypingDuration || queryParams.hindiTypingDuration
		}
		if (selectedLanguage == "both") {
			selectedLanguage = "hindi"
			// when both is selected, we will first pick the hindi language
			// create the lines from the exercise (strings => array of strings)
			data.hindi[selectedExerciseNo] = createLinesFromStringWithWordCount(data[selectedLanguage][selectedExerciseNo], 30)
			readline.setAttribute("lang", "hindi")
			typeline.setAttribute("lang", "hindi")

			// se the input value (read line input) to the selected exercise's line number (in this case first line number)
			// we will update it when user presses enter in the type line input,
			// with the next line number of the selected exercise
			readline.value = data[selectedLanguage][selectedExerciseNo][lineNo]

			// when the duration finished for the exercise
			startTime(duration , function callBack () {
				// store the last typed line in the previous selected language
				typedLines[selectedLanguage].push(typeline.value)

				// prompt the user that time is over and we will star the next exercise
				// use can hove some rest before pressing enter
				alert("Press enter to select the next exercise.")

				// update the local variable
				// set the language to english
				selectedLanguage = "english"
				// reset the exercise line number
				lineNo = 0;
				// create the lines from the exercise (strings => array of strings)
				data.english[selectedExerciseNo] = createLinesFromStringWithWordCount(data[selectedLanguage][selectedExerciseNo], 30)
				readline.setAttribute("lang", "en")
				typeline.setAttribute("lang", "en")
				// set the readline input value
				// again it will be updated with enter press
				readline.value = data[selectedLanguage][selectedExerciseNo][lineNo]
				// empty the typeline value
				typeline.value = ""
				// start the next exercise duration
				startTime(duration, function cb () {
					// store the last typed line in the previous selected language
					typedLines[selectedLanguage].push(typeline.value)

					// show the user that the time is over and show him results
					alert("Your time is over." + JSON.stringify(typedLines))
				});
			});
		} else {
			// create the lines from the exercise (strings => array of strings)
			data[selectedLanguage][selectedExerciseNo] = createLinesFromStringWithWordCount(data[selectedLanguage][selectedExerciseNo], 30)
			// start the exercise with the first line
			readline.value = data[selectedLanguage][selectedExerciseNo][lineNo]
			typeline.value = ""
			// start the timer
			startTime(duration, function onDurationEnd () {
				// when timer finished, store the last typed line
				typedLines[selectedLanguage].push(typeline.value)

				// show the user that the time is over and show him results
				alert("Your time is over." + JSON.stringify(typedLines))
			});
		}

		// add event listener of type keydown on the type line input element
		typeline.addEventListener("keydown",function inputchange(event){
			console.log(event.target.value, readline.value)
			// if the keyCode is 13 (user has pressed the Enter key)
			if (event.keyCode == 13) {
				// increase the line number of exercise
				lineNo++
				// store the type line
				typedLines[selectedLanguage].push(typeline.value);
				// if we have more lines in the exercise
				if (data[selectedLanguage][selectedExerciseNo].length > lineNo) {
					// set the readline input element's value to next line of the exercise
					readline.value = data[selectedLanguage][selectedExerciseNo][lineNo]
					// empty the type line input
					typeline.value = "";
				}
			}
		})
	})
}
function wordCount(esx){
	var y = esx.split(' ').length;
	return y;
}
