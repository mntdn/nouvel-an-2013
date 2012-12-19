// faire des vagues dans la partie basse de l'écran.
// Déja faire en sorte de remplir un rectangle avec des mots (cf. le remplissage du cercle), puis faire en sorte que la partie haut change :
// i   i
// ii ii i
// iiiiiii
// iiiiiii
// dans cet esprit là ça devrait donner un effet de vagues si ça bouge régulièrement

// Polyfill pour le requestAnimationFrame
window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

var contenuP = new Array();
var clavier = ""; //contient la touche actuellement pressée
var animId;

var intervId = new Array(); // contient les identifiants de tous les setInterval en cours

// mettre les span dans un nouveau div pour chaque ligne
// faire en ASCII art

function deleteWord(x, y) {
	var idElement = "#s"+x+"-"+y;
	if (document.querySelector(idElement) !== null) {
		document.querySelector(idElement).className = "mouille";
		if (intervId[x] == null)
			intervId[x] = new Array();
		intervId[x][y] = window.setInterval(function () {
			if (document.querySelector(idElement).style.opacity > 0.4) {
				document.querySelector(idElement).style.opacity -= 0.05;
			} else {
				clearInterval(intervId[x][y]);
			}
		}, 250);
	}
}

function drawWord(x, y) {
	var idElement = "#s"+x+"-"+y;
	if (document.querySelector(idElement) !== null) {
		document.querySelector(idElement).className = "affiche";
		if (typeof intervId[x] != 'undefined') {
			if (typeof intervId[x][y] != 'undefined') {
				clearInterval(intervId[x][y]);
			}
		}
		document.querySelector(idElement).style.opacity = "1";
	}
}

var j = 0;
for (var i=0; i < document.querySelector('#phrase').innerHTML.length; i+=5) {
	contenuP[j] = "▓▓▓▓▓"; //document.querySelector('#phrase').innerHTML.substring(i, i+5);
	console.log(contenuP[j]);
	j++;
}

var mainDiv = document.createElement("div");
// mainDiv.id = "ecran";

var largeurPhrase = document.querySelector('#phrase').clientWidth,
	hauteurPhrase = document.querySelector('#phrase').clientHeight,
	largeurFenetre = window.document.body.clientWidth,
	hauteurFenetre = window.document.body.clientHeight,
	largeurBoutPhrase = Math.round(largeurPhrase/document.querySelector('#phrase').innerHTML.length)*5;
	
document.querySelector('#phrase').style.display = "none";
	
var yIdMax = Math.ceil(hauteurFenetre/hauteurPhrase), 
	xIdMax = Math.ceil(largeurFenetre/largeurBoutPhrase),
	posTab = 0,
	xMax = 0,
	yMax = yIdMax,
	sortiBoucle = false,
	ecranEntier = false; //permet de savoir si on a déjà dessiné tout l'écran ou pas, pour éviter de le refaire à chaque fois...

// Le positionnement est fait en sorte que le X,Y soit lié à l'Id du span
for (var y=0; y <= yIdMax; y++) {
	for (var x=0; x < xIdMax; x++) {
		if (((x+2)*largeurBoutPhrase) < largeurFenetre) {
			var tempSpan = document.createElement("span");
			tempSpan.id = "s"+x+"-"+y;
			tempSpan.className = "cache";
			tempSpan.appendChild(document.createTextNode(contenuP[posTab]));
			mainDiv.appendChild(tempSpan);
			if (posTab < (contenuP.length-1)) {
				posTab++;
			} else {
				posTab = 0;
			}
		} else {
			xMax = x+1;
		}
	}
	posTab=0;
	mainDiv.appendChild(document.createElement("br"));
	// mainDiv = document.createElement("div");
}
	document.body.insertBefore(mainDiv, document.querySelector('#phrase'));


document.body.addEventListener('keydown', function (e) {
	var key = e.keyCode || e.which;
	clavier = String.fromCharCode(key);
	console.log("touche : "+clavier);
	if ((clavier == "P") && (sortiBoucle)) {
		sortiBoucle = false;
		start();
	}
});


/* function MajEcran(e) {
	//quand on redimensionne la fenêtre ou que l'on scrolle, on nettoie l'écran et on recalcule les limites
	var listeAffiche = document.querySelectorAll('span.affiche');
	for (var i = 0; i < listeAffiche.length; ++i) {
		var item = listeAffiche[i];
		item.className = "cache";
	}
	xMin = document.querySelector('#ecran').offsetLeft;
	yMin = document.querySelector('#ecran').offsetTop;
	xMax = xMin + document.querySelector('#ecran').clientWidth;
	yMax = yMin + document.querySelector('#ecran').clientHeight;
	console.log("Ecran effacé");
}

window.addEventListener("resize", MajEcran);
window.addEventListener("scroll", MajEcran); */

// console.log(xMin+", "+yMin+", "+xMax+", "+yMax);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var hauteurListe = new Array(),
	hauteurVagues = 10;
	
for (var i = 0; i <= xMax; i++) {
	hauteurListe[i] = new Array();
	hauteurListe[i][0] = hauteurVagues + getRandomInt(0,1);
	hauteurListe[i][1] = 0; // contient le nombre de cycles pendant lesquels on ne bouge pas...
}

// console.log(hauteurListe.toString());

function animVagues(eauMonte) {
	var pos = 0;
	if (!ecranEntier) {
		// on dessine tout pour la première fois
		hauteurListe.forEach(function (h) {
			for (var i = 0; i <= h[0]; i++) {
				drawWord(pos, yMax-i);
			}
			pos++;
		});
		ecranEntier = true;
	} else {
		// on met juste le haut à jour
		
		pos = 0;
		for (var i = 0; i < hauteurListe.length; i++) {
			var modif = getRandomInt(0,1);
			if (!eauMonte) {
				// l'eau descend
				if (i < (hauteurListe.length - 1)) {
					if (Math.abs(hauteurListe[i][0] - hauteurListe[i+1][0]) >= 2) {
						if (hauteurListe[i+1][0] > hauteurListe[i][0]) {
							hauteurListe[i][1] = Math.abs(hauteurListe[i][0] - hauteurListe[i+1][0]); // stop pendant la différence de cycles
						} else {
							hauteurListe[i+1][1] = Math.abs(hauteurListe[i][0] - hauteurListe[i+1][0]); // stop pendant la différence de cycles
						}
					}
				}
				if (hauteurListe[i][1] > 0) {
					// on attend un tour
					hauteurListe[i][1] -= 1;
				} else {
					if (modif == 1) {
						deleteWord(pos, yMax-hauteurListe[i][0]);
						hauteurListe[i][0] -= modif;
					}
				}
			} else {
				// l'eau monte
				if (i < (hauteurListe.length - 1)) {
					if (Math.abs(hauteurListe[i][0] - hauteurListe[i+1][0]) >= 2) {
						if (hauteurListe[i+1][0] > hauteurListe[i][0]) {
							hauteurListe[i+1][1] = Math.abs(hauteurListe[i][0] - hauteurListe[i+1][0]); // stop pendant la différence de cycles
						} else {
							hauteurListe[i][1] = Math.abs(hauteurListe[i][0] - hauteurListe[i+1][0]); // stop pendant la différence de cycles
						}
					}
				}
				if (hauteurListe[i][1] > 0) {
					// on attend un tour
					hauteurListe[i][1] -= 1;
				} else {
					hauteurListe[i][0] += modif;
					drawWord(pos, yMax-hauteurListe[i][0]);
				}
			}
			pos++;
		}
	}
}

var chrono = +new Date,
	monte = true, // savoir si l'eau monte ou pas
	vitesse = 20, // la vitesse de l'animation
	nbIter = 0; // compte le nombre d'itérations pour faire monter et descendre l'eau

function gameLoop() {
	animId = requestAnimFrame(gameLoop);
	
	var mesureTemps = Date.now() - chrono;
	
	if (mesureTemps > vitesse) {
		animVagues(monte);
		nbIter++;
		chrono = +new Date;
		if (monte) {
			if (nbIter > 40) {
				monte = false;
				vitesse = 50; // la mer descend plus lentement
				// console.log("On va descendre : "+(Date.now() - chrono));
				nbIter = 0;
			} 
		} else {
			if (nbIter > 39) {
				monte = true;
				vitesse = 20; // la mer monte vite
				// console.log("On va monter : "+(Date.now() - chrono));
				nbIter = 0;
			}
		}
	}

	if (clavier == "S") {
		sortiBoucle = true;
		stop();
	}
}

function start() {
    if (!animId) {
       gameLoop();
    }
}

function stop() {
	if (animId) {
		window.cancelAnimationFrame(animId);
		animId = undefined;
	}
}

start();