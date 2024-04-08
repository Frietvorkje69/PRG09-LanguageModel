let book = './bible.txt';
let cleanedText;
let biGrams = {};
let triGrams = {};
const amountOfWords = 50;

fetch(book)
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to fetch data');
      return resp.text();
    })
    .then(prepareText)
    .catch(error => console.error('Error fetching data:', error));

// remove unneeded stuff
function prepareText(text) {
  const punctuation = /[,”“•#?!$%^&*;:{}=-_`~()]/g;
  const lineBreaks = /(\r\n|\n|\r)/gm;
  // potential remove integers ?

  cleanedText = text.toLowerCase()
      .replace(punctuation, " ")
      .replace(lineBreaks, " ");

  buildNGrams(cleanedText.split(' '));
}

// build bigram and trigram data structures
// iterates through the words, checks if key already exists. Increments how many times the word has been seen after current word
function buildNGrams(words) {
  for (let i = 0; i < words.length - 1; i++) {
    if (!biGrams[words[i]]) biGrams[words[i]] = {};
    biGrams[words[i]][words[i + 1]] = (biGrams[words[i]][words[i + 1]] || 0) + 1;
  }

  for (let i = 0; i < words.length - 2; i++) {
    if (!triGrams[words[i]]) triGrams[words[i]] = {};
    if (!triGrams[words[i]][words[i + 1]]) triGrams[words[i]][words[i + 1]] = {};
    triGrams[words[i]][words[i + 1]][words[i + 2]] = (triGrams[words[i]][words[i + 1]][words[i + 2]] || 0) + 1;
  }
}

window.addEventListener('load', () => {
  document.getElementById('submitButton').addEventListener('click', submitHandler);
});

function submitHandler() {
  const inputValue = document.getElementById('inputData').value.trim();
  const inputWords = inputValue.split(' ');

  if (inputValue === '') {
    alert(`Jesus doesn't like empty inputs..`);
    return;
  }

  if (inputWords.length <= 2) {
    generateSentence(inputValue, 'BiGramDiv', generateNextBiGramWord);
  }

  if (inputWords.length >= 3) {
    generateSentence(inputValue, 'TriGramDiv', generateNextTriGramWord);
  }
}

function generateSentence(seedText, targetDivId, getNextWordFunc) {
  let words = seedText.split(' ');
  let generatedText = seedText;
  const targetDiv = document.getElementById(targetDivId);

  for (let i = 0; i < amountOfWords; i++) {
    const nextWord = getNextWordFunc(words);
    generatedText += ' ' + nextWord;
    words.push(nextWord);
  }

  // Append to div
  const newParagraph = document.createElement('p');
  newParagraph.innerText = generatedText;
  targetDiv.appendChild(newParagraph);
}

function generateNextBiGramWord(words) {
  const lastWord = words.slice(-1)[0];
  const possibleNextWords = biGrams[lastWord] || {};

  // failsafe
  if (Object.keys(possibleNextWords).length === 0) {
    return getRandomWord();
  }

  const totalOccurrences = Object.values(possibleNextWords).reduce((a, b) => a + b);
  let randomThreshold = Math.random() * totalOccurrences;

  for (const word in possibleNextWords) {
    randomThreshold -= possibleNextWords[word];
    if (randomThreshold <= 0) {
      return word;
    }
  }

  // failsafe
  return getRandomWord();
}

function generateNextTriGramWord(words) {
  const lastTwoWords = words.slice(-2);
  const possibleNextWords = triGrams[lastTwoWords[0]]?.[lastTwoWords[1]] || {};

  // failsafe
  if (Object.keys(possibleNextWords).length === 0) {
    return getRandomWord();
  }

  const totalOccurrences = Object.values(possibleNextWords).reduce((a, b) => a + b);
  let randomThreshold = Math.random() * totalOccurrences;

  for (const word in possibleNextWords) {
    randomThreshold -= possibleNextWords[word];
    if (randomThreshold <= 0) {
      return word;
    }
  }

  // failsafe
  return getRandomWord();
}

// failsafe
function getRandomWord() {
  // show when triggered for mondeling
  console.log('Failsafe triggered')
  const words = cleanedText.split(' ');
  return words[Math.floor(Math.random() * words.length)];
}
