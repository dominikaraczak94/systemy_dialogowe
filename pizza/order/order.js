var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var orderedPizza = "";
var orderedSauces = new Array();
var orderedDrinks = new Array();
var pizzaRecognition = new SpeechRecognition();
var extrasRecognition = new SpeechRecognition();
var saucesRecognition = new SpeechRecognition();
var drinksRecognition = new SpeechRecognition();
var synth = window.speechSynthesis;
var pizzaRecognitionList = new SpeechGrammarList();
var extrasRecognitionList = new SpeechGrammarList();
var saucesRecognitionList = new SpeechGrammarList();
var drinksRecognitionList = new SpeechGrammarList();

var pizzaDiagnostic = document.querySelector('.pizza-diagnostics');
var extrasDiagnostic = document.querySelector('.extras-diagnostics');
var saucesDiagnostic = document.querySelector('.sauces-diagnostics');
var drinksDiagnostic = document.querySelector('.drinks-diagnostics');
var orderButton = document.querySelector('.order-button');

orderButton.addEventListener('click', startOrder);

function startOrder() {
    var pizzas = ['margarita', 'pepperoni', 'salami', 'tomato', 'mushroom'];
    var grammar = '#JSGF V1.0; grammar pizzas; public <pizzas> = ' + pizzas.join(' | ') + ' ;'
    pizzaRecognitionList.addFromString(grammar, 1);
    pizzaRecognition.continuous = true;
    pizzaRecognition.grammars = pizzaRecognitionList;
    pizzaRecognition.lang = 'en-US';
    pizzaRecognition.interimResults = false;
    pizzaRecognition.maxAlternatives = 1;
    pizzaRecognition.start();
}

function speak(textToSay) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    var utterThis = new SpeechSynthesisUtterance(textToSay);
    utterThis.lang = 'en-US';
    synth.speak(utterThis);
}

pizzaRecognition.onresult = function (event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The [last] returns the SpeechRecognitionResult at the last position.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object

    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var order;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        order = event.results[last - 1][0].transcript;
        speak('Your pizza choice is' + order);
        orderedPizza = order;
        showExtras();
    } else {
        order = lastSaidThing;
    }

    //newline not working :(
    pizzaDiagnostic.textContent = 'Your order is: ' + order + '.\n';
    pizzaDiagnostic.textContent += 'If you agree with order recognition, please say "OK" \n';
}

function showExtras() {
    pizzaRecognition.stop();
    if (document.getElementById('sauces').style.display === 'block') {
        document.getElementById('sauces').style.display = 'none';
    }
    if (document.getElementById('drinks').style.display === 'block') {
        document.getElementById('drinks').style.display = 'none';
    }
    document.getElementById('extras').style.display = 'block'; //Will show
    var extras = ['sauces', 'drinks', 'finish'];
    var grammar = '#JSGF V1.0; grammar extras; public <extras> = ' + extras.join(' | ') + ' ;'
    extrasRecognitionList.addFromString(grammar, 1);
    extrasRecognition.continuous = true;
    extrasRecognition.grammars = extrasRecognitionList;
    extrasRecognition.lang = 'en-US';
    extrasRecognition.interimResults = false;
    extrasRecognition.maxAlternatives = 1;
    extrasRecognition.start();
}

extrasRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var extra = event.results[last][0].transcript;
    if (String(extra).trim() === 'sauce') {
        showSauces();
    }
    if (String(extra).trim() === 'drinks') {
        showDrinks();
    }
    
    extrasDiagnostic.textContent = 'Your choice is: ' + extra + '.';
}

function showSauces() {
    extrasRecognition.stop();
    document.getElementById('extras').style.display = 'none';
    document.getElementById('sauces').style.display = 'block';
    var sauces = ['tomato', 'garlic', 'chilli'];
    var grammar = '#JSGF V1.0; grammar sauces; public <sauces> = ' + sauces.join(' | ') + ' ;'
    saucesRecognitionList.addFromString(grammar, 1);
    saucesRecognition.continuous = true;
    saucesRecognition.grammars = saucesRecognitionList;
    saucesRecognition.lang = 'en-US';
    saucesRecognition.interimResults = false;
    saucesRecognition.maxAlternatives = 1;
    saucesRecognition.start();
}

saucesRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var order;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        order = event.results[last - 1][0].transcript;
        speak('Your sauce choice is' + order);
        orderedSauces.push(order);
        saucesRecognition.stop();
        showExtras();
    } else {
        order = lastSaidThing;
    }
    //newline not working :(
    saucesDiagnostic.textContent = 'Your choice is: ' + order + '.\n';
    saucesDiagnostic.textContent += 'If you agree with order recognition, please say "OK" \n';
}

function showDrinks() {
    extrasRecognition.stop();
    document.getElementById('extras').style.display = 'none';
    document.getElementById('drinks').style.display = 'block';
    var drinks = ['coca-cola', 'sprite', 'water', 'juice'];
    var grammar = '#JSGF V1.0; grammar drinks; public <drinks> = ' + drinks.join(' | ') + ' ;'
    drinksRecognitionList.addFromString(grammar, 1);
    drinksRecognition.continuous = true;
    drinksRecognition.grammars = drinksRecognitionList;
    drinksRecognition.lang = 'en-US';
    drinksRecognition.interimResults = false;
    drinksRecognition.maxAlternatives = 1;
    drinksRecognition.start();
}

drinksRecognition.onresult = function (event) {
    var last = event.results.length - 1;
    var lastSaidThing = event.results[last][0].transcript;
    var order;
    if (last > 0 && String(lastSaidThing).trim() === 'okay') {
        order = event.results[last - 1][0].transcript;
        speak('Your drink choice is' + order);
        orderedDrinks.push(order);
        drinksRecognition.stop();
        showExtras();
    } else {
        order = lastSaidThing;
    }
    //newline not working :(
    drinksDiagnostic.textContent = 'Your choice is: ' + order + '.\n';
    drinksDiagnostic.textContent += 'If you agree with order recognition, please say "OK" \n';
}

//TODO: database, prices and finish option