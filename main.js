let book = './text.txt';
let cleanedText; // Will hold processed text
let biGrams = {}; // Bigrams stored as a dictionary {firstWord: {secondWord: count}}
let triGrams = {}; // Similar structure for trigrams
const amountOfWords = 50;

// Fetch and preprocess the book
fetch(book)
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to fetch book'); // Error handling
      return resp.text();
    })
    .then(prepareText)
    .catch(error => console.error('Error fetching book:', error));

// Text preprocessing function
function prepareText(text) {
  const punctuation = /[,”“•#?!$%^&*;:{}=-_`~()]/g;
  const lineBreaks = /(\r\n|\n|\r)/gm;

  cleanedText = text.toLowerCase()
      .replace(punctuation, " ")
      .replace(lineBreaks, " ");

  buildNGrams(cleanedText.split(' '));
}

// Build bigram and trigram data structures
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
    alert('Input cannot be empty');
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
    words.push(nextWord); // Update words for subsequent choices
  }

  const newParagraph = document.createElement('p'); // Create new <p> element
  newParagraph.innerText = generatedText;
  targetDiv.appendChild(newParagraph); // Append <p> to the div
}

function generateNextBiGramWord(words) {
  const lastWord = words.slice(-1)[0];
  const possibleNextWords = biGrams[lastWord] || {};

  // If no matching bigrams, choose a random word to restart
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

  return getRandomWord(); // Shouldn't normally hit this, but a failsafe
}

function generateNextTriGramWord(words) {
  const lastTwoWords = words.slice(-2);
  const possibleNextWords = triGrams[lastTwoWords[0]]?.[lastTwoWords[1]] || {};

  // Similar logic to biGram selection...
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

  return getRandomWord();
}

// Helper function to get a random word from the cleaned text
function getRandomWord() {
  const words = cleanedText.split(' ');
  return words[Math.floor(Math.random() * words.length)];
}
