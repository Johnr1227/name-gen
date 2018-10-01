const fs = require("fs");
const readline = require("readline");
const CSVtoArray = require("csv-array");

const START = "S1";
const END = "E2";

var syllables = [];
var data = [];
var realNames = [];

var questions = 0;

var age = 0;
var name = "";
var gender = "";
var nationality = "";

var asked = 0;
var correct = 0;

var correctReal = 0;
var correctGenerated = 0;

var incorrectReal = 0;
var incorrectGenerated = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear();
process.stdout.write("Running...");
var loadingInterval = setInterval(function() {
    process.stdout.write(".");
}, 1500);
CSVtoArray.parseCSV("names.csv", function(data) {
    console.log("\n\nLoaded names.csv...\n");
    clearInterval(loadingInterval);
    this.data = data;
    initSyllables(data);
    // console.log("syllables", syllables);
    realNames = data.map(d => d.Name.toLowerCase());
    rareNames = data
        .sort((a, b) => parseInt(a.Count) - parseInt(b.Count))
        .slice(0, data.length / 20)
        .map(d => d.Name.toLowerCase());
    startQuiz();
});
function startQuiz() {
    incorrectGenerated = 0;
    correctGenerated = 0;
    incorrectReal = 0;
    correctReal = 0;
    asked = 0;
    correct = 0;
    rl.question("what's your name? ", answer => {
        name = answer;
        rl.question("how old are you? ", answer => {
            age = answer;
            rl.question("what is your nationality? ", answer => {
                nationality = answer;
                rl.question("what is your gender? (M/F/X) ", answer => {
                    gender = answer;
                    rl.question(
                        "how many questions should there be? ",
                        answer => {
                            questions = parseInt(answer);
                            question();
                        }
                    );
                });
            });
        });
    });
}
function writeToJSON() {
    fs.readFile("data.json", "utf8", function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            var obj = JSON.parse(data);
            obj.data.push({
                name: name,
                age: age,
                gender: gender,
                nationality: nationality,
                quiz: {
                    asked: questions,
                    correct: correct,
                    correctReal: correctReal,
                    incorrectReal: incorrectReal,
                    correctGenerated: correctGenerated,
                    incorrectGenerated: incorrectGenerated
                }
            });
            var json = JSON.stringify(obj);
            fs.writeFile("data.json", json, "utf8", function() {
                //console.log(json);
            });
        }
    });
}
function question() {
    var correctAnswer;
    if (Math.random() > 0.5) {
        correctAnswer = "g";
        var name = generateName(Math.floor(Math.random() * 3) + 2);
    } else {
        correctAnswer = "r";
        var name = rareNames[Math.floor(Math.random() * rareNames.length)];
    }
    rl.question(
        "is " + name + " a real name, or a computer generated name? (r/g)\n",
        answer => {
            asked++;
            if (answer === correctAnswer) {
                correct++;
                if (correctAnswer === "g") {
                    correctGenerated++;
                } else {
                    correctReal++;
                }
                console.log("CORRECT! Your correct is " + correct);
            } else {
                console.log("WRONG!!! the correct answer is " + correctAnswer);
                if (correctAnswer === "g") {
                    incorrectGenerated++;
                } else {
                    incorrectReal++;
                }
            }
            if (asked === questions) {
                writeToJSON();
                console.log("Quiz over! Your correct is " + correct);
                setTimeout(function() {
                    rl.question(
                        "would you like to play again? (y/n) ",
                        answer => {
                            if (answer === "y") {
                                startQuiz();
                            } else {
                                console.log("done!");
                                rl.close();
                            }
                        }
                    );
                }, 2000);
            } else {
                question();
            }
        }
    );
}
function initSyllables(data) {
    process.stdout.write("Initializing syllables...");
    loadingInterval = setInterval(function() {
        process.stdout.write(".");
    }, 1500);
    for (var i in data) {
        // get the syllables for the name
        var syls = getSyllables(data[i].Name);
        var next = END;
        // for each syllable in the name
        for (var j = syls.length - 1; j >= 0; j--) {
            // if that syllable exists in the data already, push
            if (syllables[syls[j]]) {
                syllables[syls[j]].data.push(next);
            } else {
                syllables[syls[j]] = {
                    syllable: syls[j],
                    data: [next]
                };
            }
            next = syls[j];
        }
        if (!syllables[START]) {
            syllables[START] = { syllable: START, data: [syls[0]] };
        } else {
            if (!syls[0]) {
                console.log("BAD DATA " + syls[0]);
                console.log("data " + data[i]);
            }
            syllables[START].data.push(syls[0]);
        }
    }
    clearInterval(loadingInterval);
    console.clear();
}
function generateName(length) {
    do {
        var s = getNext(START);
        var prev = s;
        for (var i = 0; i < length; i++) {
            prev = getNext(prev);
            if (prev === END) {
                i = length;
            } else {
                s = s + prev;
            }
        }
    } while (realNames.includes(s));
    return s;
}
function getSyllables(word) {
    word = word.toLowerCase();
    var re = /[^aeiouy]*[aeiouy]{1,2}(?:[^aeiouy]*$)?/g;
    var foundSyllables = [];
    while ((match = re.exec(word)) != null) {
        foundSyllables.push(match[0]);
    }
    if (foundSyllables.length === 0) {
        foundSyllables.push(word);
    }
    return foundSyllables;
}
function getNext(prev) {
    try {
        var index = Math.floor(
            Math.random() * (syllables[prev].data.length - 1)
        );
        var next = syllables[prev].data[index];
        if (!next) {
            console.log(
                "next is falsey " +
                    next +
                    " from prev " +
                    prev +
                    " index " +
                    index
            );
            console.log("data...");
            for (var i = 0; i < syllables[prev].data.length; i++) {
                console.log("[" + i + "]: " + syllables[prev].data[i]);
            }
        }
        return next;
    } catch (e) {
        console.log("prev is " + prev);
        throw e;
    }
}
