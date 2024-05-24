/* Game opdracht
   Informatica - Emmauscollege Rotterdam
   Template voor een game in JavaScript met de p5 library

   Begin met dit template voor je game opdracht,
   voeg er je eigen code aan toe.
 */

/*
 * instellingen om foutcontrole van je code beter te maken 
 */
///<reference path="p5.global-mode.d.ts" />
"use strict"

const MUTATION_CHANGE = 0.5;
const GENERATION_SIZE = 50;
const ELITE_SIZE = 4;


let label;
let teRadenWoordInput;
let startButton;
let nextGenerationButton;

let currentGeneration;
let currentTotalScore;
let teRadenWoord;


/* ********************************************* */
/* setup() en draw() functies / hoofdprogramma   */
/* ********************************************* */

/**
 * setup
 * de code in deze functie wordt één keer uitgevoerd door
 * de p5 library, zodra het spel geladen is in de browser
 */
function setup() {
  createCanvas(400, 400);

  label = createP("Voer een woord van 8 kleine letters in");
  label.position(450, 0);

  teRadenWoordInput = createInput();
  teRadenWoordInput.position(450, 40);
  teRadenWoordInput.attribute("maxLength", 8)

  startButton = createButton("Start")
  startButton.position(450, 80);
  startButton.mouseClicked(start)

  nextGenerationButton = createButton("Next generation");
  nextGenerationButton.position(450, 120);
  nextGenerationButton.attribute("disabled", true);
  nextGenerationButton.mouseClicked(iterate);
}


/**
 * draw
 * de code in deze functie wordt 50 keer per seconde
 * uitgevoerd door de p5 library, nadat de setup functie klaar is
 */
function draw() {
  background('gray');
}

function start() {
  if (teRadenWoordInput.value().length < 8) {
    window.alert("woord kleiner dan 8 tekens");
    return;
  }

  startButton.attribute("disabled", true);
  nextGenerationButton.removeAttribute("disabled");

  teRadenWoord = teRadenWoordInput.value();
  createFirstGeneration();

  for (let i = 0; i < currentGeneration.length; i++) {
    calculateSolutionFitness(currentGeneration[i])
  }
}

function iterate() {
  let generationNumber = 1;
  while (currentGeneration[0].value != teRadenWoord) {
    generationNumber++;
    nextIteration();
    console.log("generatie: ", generationNumber);
  }
  alert("gevonden: " + currentGeneration[0].value)
  nextGenerationButton.attribute("disabled", true);
  startButton.removeAttribute("disabled");
}

function nextIteration() {
  let newGeneration = [];

  // creëer een nieuwe generatie:
  // kies twee oplossingen
  calculateTotalScore();

  for (let i = 0; i < ELITE_SIZE; i++) {
    newGeneration.push(currentGeneration[i]);
  }

  console.log("Twee beste oplossingen meenemen naar nieuwe generatie", newGeneration)

  for (let i = 0; i < ((GENERATION_SIZE - ELITE_SIZE) / 2); i++) {
    let solA = rouletteWheelSelection()
    let solB = rouletteWheelSelection()
    while (solA === solB) {
      solB = rouletteWheelSelection()
    }

    // maak twee nieuwe oplossingen door uitwisseling
    // en zet die in de nieuwe generatie
    let offspring = solutionWithCrossOver(solA, solB);
    for (let i = 0; i < offspring.length; i++) {
      mutate(offspring[i]);
    }

    newGeneration = newGeneration.concat(solutionWithCrossOver(solA, solB));
  }

  // vervang de oude generatie
  currentGeneration = newGeneration
  for (let i = 0; i < currentGeneration.length; i++) {
    calculateSolutionFitness(currentGeneration[i]);
  }

  currentGeneration.sort((a, b) => {
    if (a.score < b.score) {
      return 1
    }
    else if (a.score > b.score) {
      return -1
    }
    else {
      return 0
    }
  })


  console.log("gesorteerde generatie: ", currentGeneration);
}


function createRandomSolution() {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return { value: result }
}


function createFirstGeneration() {
  currentGeneration = [];

  for (let i = 0; i < GENERATION_SIZE; i++) {
    currentGeneration.push(createRandomSolution());
  }

  console.log(currentGeneration);
}


function calculateSolutionFitness(solution) {
  let score = 1;
  for (let i = 0; i < 8; i++) {
    if (solution.value[i] === teRadenWoord[i]) {
      score = score + 1;
      console.log("letter is hetzelfde");
    }
  }

  return solution.score = score;
}


function calculateTotalScore() {
  currentTotalScore = 0;
  for (let index = 0; index < currentGeneration.length; index++) {
    const solution = currentGeneration[index];
    currentTotalScore = currentTotalScore + solution.score
  }

  console.log("totalscore is " + currentTotalScore)
}


function rouletteWheelSelection() {
  let rouletteNumber = random(currentTotalScore);
  let searchNumber = 0;

  for (let i = 0; i < currentGeneration.length; i++) {
    searchNumber = searchNumber + currentGeneration[i].score
    if (searchNumber >= rouletteNumber) {
      return currentGeneration[i];
    }
  }
}


function bestCurrentSolutions() {
  let bestSolution = currentGeneration[0];
  let secondBestSolution = currentGeneration[0];

  for (let i = 0; i < currentGeneration.length; i++) {
    if (currentGeneration[i].score > bestSolution.score) {
      secondBestSolution = bestSolution;
      bestSolution = currentGeneration[i];
    }
  }

  return [bestSolution, secondBestSolution];
}


function solutionWithCrossOver(solA, solB) {
  let genes = solA.value + solB.value;

  let newSolA = { value: "" };
  let newSolB = { value: "" };

  for (let i = 0; i < genes.length; i++) {
    let toA = Math.floor(random(2));
    if ((toA === 1 && newSolA.value.length < 8) || newSolB.value.length === 8) {
      newSolA.value = newSolA.value + genes[i];
    }
    else {
      newSolB.value = newSolB.value + genes[i];
    }
  }

  return [newSolA, newSolB];
}


function mutate(solution) {
  let roll = random(1)
  if (roll < MUTATION_CHANGE) {
    let characterIndex = floor(random(8))
    let first = solution.value.substring(0, characterIndex - 1);
    let last = "";
    if (characterIndex < 6) {
      last = solution.value.substring(characterIndex)
    }

    solution.value = first + getRandomLowerCaseLetter() + last
  }
}

function getRandomLowerCaseLetter() {
  var randomCharCode = Math.floor(Math.random() * 26) + 97; // ASCII-waarden voor 'a' tot 'z' zijn 97 tot 122
  return String.fromCharCode(randomCharCode);
}