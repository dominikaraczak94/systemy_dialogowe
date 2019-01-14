var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var chosenType = "";
var chosenTime = "";
var chosenTemperature = "";
var chosenColor = "";
var calculatedTime = 0;
var longTime = 0;
var quickTime = 0;
var standardTime = 0;
var typeRecognition = new SpeechRecognition();
var timeRecognition = new SpeechRecognition();
var temperatureRecognition = new SpeechRecognition();
var colorRecognition = new SpeechRecognition();
var synth = window.speechSynthesis;
var typeRecognitionList = new SpeechGrammarList();
var timeRecognitionList = new SpeechGrammarList();
var temperatureRecognitionList = new SpeechGrammarList();
var colorRecognitionList = new SpeechGrammarList();

var diagnostic = document.querySelector('.diagnostics');
var timeDiagnostic = document.querySelector('.time-diagnostics');
var temperatureDiagnostic = document.querySelector('.temperature-diagnostics');
var colorDiagnostic = document.querySelector('.color-diagnostics');
var startButton = document.querySelector('.start-button');

startButton.addEventListener('click', startWashing);

function speak(textToSay) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    var utterThis = new SpeechSynthesisUtterance(textToSay);
    utterThis.lang = 'en-US';
    synth.speak(utterThis);
}

function startWashing() {
    var washingTypes = ['daily', 'delicate', 'dirty', 'children', 'shoes', 'sportswear'];
    var grammar = '#JSGF V1.0; grammar washingTypes; public <washingTypes> = ' + washingTypes.join(' | ') + ' ;'
    typeRecognitionList.addFromString(grammar, 1);
    typeRecognition.continuous = true;
    typeRecognition.grammars = typeRecognitionList;
    typeRecognition.lang = 'en-US';
    typeRecognition.interimResults = false;
    typeRecognition.maxAlternatives = 1;
    typeRecognition.start();
}

typeRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var type;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        type = event.results[last - 1][0].transcript;
        speak('You chose ' + type + ' washing.');
        chosenType = type;
        showTime();
    } else {
        type = lastSaidThing;
    }

    //newline not working :(
    diagnostic.textContent = 'You chose ' + type + ' washing.\n';
    diagnostic.textContent += 'If you agree with recognition, please say "OK".';
}

function showTime() {
    typeRecognition.stop();
    document.getElementById('type-container').style.display = 'none';
    document.getElementById('time-container').style.display = 'block';
    var time = ['long', 'standard', 'quick'];
    var grammar = '#JSGF V1.0; grammar time; public <time> = ' + time.join(' | ') + ' ;'
    //also should be taken from db
    calculateTime();
    timeRecognitionList.addFromString(grammar, 1);
    timeRecognition.continuous = true;
    timeRecognition.grammars = timeRecognitionList;
    timeRecognition.lang = 'en-US';
    timeRecognition.interimResults = false;
    timeRecognition.maxAlternatives = 1;
    timeRecognition.start();
}

function calculateTime() {
    var time = 0;
    switch (chosenType) {
        case 'daily':
            time = 30;
        case 'delicate':
            time = 60;
        case 'dirty':
            time = 150;
        case 'children':
            time = 120;
        case 'shoes':
            time = 100;
        case 'sportswear':
            time = 80;
    }
    standardTime = time;
    longTime = 1.5 * time;
    quickTime = 0.7 * time;
    document.getElementById("long-time").innerHTML = convertMinsToHrsMins(longTime);
    document.getElementById("standard-time").innerHTML = convertMinsToHrsMins(standardTime);
    document.getElementById("quick-time").innerHTML = convertMinsToHrsMins(quickTime);
}

timeRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var time;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        time = event.results[last - 1][0].transcript;
        speak('You chose ' + time + ' washing time.');
        chosenTime = String(time).trim();
        if (chosenTime === "long")
            calculatedTime = longTime;
        else if (chosenTime === "standard")
            calculatedTime = standardTime;
        else if (chosenTime === "quick")
            calculatedTime = quickTime;
        showTemperature();
    } else {
        time = lastSaidThing;
    }

    //newline not working :(
    timeDiagnostic.textContent = 'You chose ' + time + ' washing time.\n';
    timeDiagnostic.textContent += 'If you agree with recognition, please say "OK".';
}

function showTemperature() {
    timeRecognition.stop();
    if (document.getElementById('time-container').style.display === 'block') {
        document.getElementById('time-container').style.display = 'none';
    }
    document.getElementById('temperature-container').style.display = 'block';
    //we should take it from database depending on washing type
    var temperature = getTemperatureByType();
    displayTemperatureLabel(temperature);
    var grammar = '#JSGF V1.0; grammar temperature; public <temperature> = ' + temperature.join(' | ') + ' ;'
    temperatureRecognitionList.addFromString(grammar, 1);
    temperatureRecognition.continuous = true;
    temperatureRecognition.grammars = temperatureRecognitionList;
    temperatureRecognition.lang = 'en-US';
    temperatureRecognition.interimResults = false;
    temperatureRecognition.maxAlternatives = 1;
    temperatureRecognition.start();
}

function getTemperatureByType() {
    switch (chosenType) {
        case 'daily':
            return ['30', '40', '60'];
        case 'delicate':
            return ['20', '30'];
        case 'dirty':
            return ['40', '60', '80', '90'];
        case 'children':
            return ['20', '30', '40', '60'];
        case 'shoes':
            return ['20', '30', '40'];
        case 'sportswear':
            return ['30', '40', '60'];
    }
}

function displayTemperatureLabel(temperature) {
    var label = "";
    temperature.forEach(element => {
        label += element + '\xB0C\t';
    });    
    document.getElementById("temperature-label").innerHTML = label;
}

temperatureRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var temperature;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        temperature = event.results[last - 1][0].transcript;
        speak('You chose ' + temperature + ' Celsius degrees.');
        chosenTemperature = temperature;
        showColor();
    } else {
        temperature = lastSaidThing;
    }

    //newline not working :(
    temperatureDiagnostic.textContent = 'You chose ' + temperature + '\xB0C.\n';
    temperatureDiagnostic.textContent += 'If you agree with recognition, please say "OK".';
}

function showColor() {
    temperatureRecognition.stop();
    if (document.getElementById('temperature-container').style.display === 'block') {
        document.getElementById('temperature-container').style.display = 'none';
    }
    document.getElementById('color-container').style.display = 'block';
    var color = ['black', 'white', 'color']
    var grammar = '#JSGF V1.0; grammar color; public <color> = ' + color.join(' | ') + ' ;'
    colorRecognitionList.addFromString(grammar, 1);
    colorRecognition.continuous = true;
    colorRecognition.grammars = colorRecognitionList;
    colorRecognition.lang = 'en-US';
    colorRecognition.interimResults = false;
    colorRecognition.maxAlternatives = 1;
    colorRecognition.start();
}

colorRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var color;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        color = event.results[last - 1][0].transcript;
        speak('You chose ' + color + ' washing.');
        chosenColor = color;
        showSummary();
    } else {
        color = lastSaidThing;
    }

    //newline not working :(
    colorDiagnostic.textContent = 'You chose ' + color + ' washing.\n';
    colorDiagnostic.textContent += 'If you agree with recognition, please say "OK".';
}

function showSummary() {
    colorRecognition.stop();
    if (document.getElementById('color-container').style.display === 'block') {
        document.getElementById('color-container').style.display = 'none';
    }
    document.getElementById('summary-container').style.display = 'block';
    var label = "Your washing will be: " + chosenType + "with " + chosenTime + " time."
    label += "Washing temperature will be: " + chosenTemperature;
    label += "\xB0C and it will use washing powder for " + chosenColor + ".";
    label += "Your final washing time will be: " + convertMinsToHrsMins(calculatedTime);
    document.getElementById("summary-label").innerHTML = label;
    speak(label);
}

function convertMinsToHrsMins(mins) {
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return `${h}:${m}`;
}