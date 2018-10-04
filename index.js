const fs = require("fs");
const discord = require("discord.js");
const CSVtoArray = require("csv-array");

// const express = require("express");
// const app = express();

const auth = require("./auth.json");
const START = "S1";
const END = "E2";

// Run express server for OpenShift
// var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
// var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
// app.get("/", (req, res) => res.send("Hello World!"));
// app.listen(port, ip, () =>
//     console.log(`Example app listening on port ${port}!`)
// );

var client = new discord.Client();

var syllables = {};
var data = [];
var realNames = [];

var correctAnswer;
var dataStates = {
    NONE: 0,
    NAME: 1,
    AGE: 2,
    GENDER: 3,
    NATIONALITY: 4,
    GENERATED: 5,
    REAL_NAME: 6
};
dataState = dataStates.NONE;
var user;
var quizChannel;

var questions = 0;

var age = 0;
var userName = "";
var gender = "";
var nationality = "";

var name = "Billy Bob Joe";
var asked = 0;
var correct = 0;

var correctReal = 0;
var correctGenerated = 0;

var incorrectReal = 0;
var incorrectGenerated = 0;

console.clear();
process.stdout.write("Running...");
var loadingInterval = setInterval(function() {
    process.stdout.write(".");
}, 1500);

var dataset = "names";
readData(dataset + ".json")
.catch(function(err) {
    console.log("\nNo previous data found...\n");
    return new Promise(function(resolve,reject) {
        CSVtoArray.parseCSV(dataset + ".csv", function(data) {
            console.log("\n\nLoaded names.csv...\n");
            clearInterval(loadingInterval);
            var syls = initSyllables(data);
            var realNames = data.map(d => d.Name.toLowerCase());
            var rareNames = data
                .sort((a, b) => parseInt(a.Count) - parseInt(b.Count))
                .slice(0, data.length / 1)
                .map(d => d.Name.toLowerCase());
            var obj = {e: realNames, 
                a: rareNames, 
                y: syls};
            writeData(obj, dataset + ".json");
            resolve(obj);
        });    
    });
})
.then(function(data){
    console.log("\nData Ready...\n");
    clearInterval(loadingInterval);

    realNames = data.e;
    rareNames = data.a;
    syllables = data.y;
    client.login(auth.token);
    console.log("N1", generateName(5));
});

client.on("ready", () => {
    console.log("bot ready!");
});
client.on("message", message => {
    //console.log(dataState);
    var channel = message.channel;
    var channelID = channel.id;
    if (message.guild === null) {
        sendMessage(channel, "`pls don't try to DM me ;-;`");
    } else {
        if (message.content.startsWith(":")) {
            var args = message.content.substring(1).split(" ");
            var cmd = args[0];
            args = args.splice(1);
            switch (cmd) {
                case "startQuiz":
                    if (args && args.length > 0) {
                        var int = parseInt(args[0]);
                        if (int === NaN) {
                            message.channel.send(
                                "`must be an integer (no decimals!)`"
                            );
                        } else {
                            questions = int;
                            message.channel.send("`what's your name?`");
                            quizChannel = channelID;
                            console.log(this.channel);
                            dataState = dataStates.NAME;
                            user = message.author.id;
                        }
                    } else {
                        message.channel.send("`Not enough arguments :p`");
                    }
                    break;
            }
        } else if (
            !dataState == dataStates.NONE &&
            message.author.id === user
        ) {
            switch (dataState) {
                case dataStates.NAME:
                    userName = message.content;
                    message.channel.send("`how old are you?`");
                    dataState = dataStates.AGE;
                    break;
                case dataStates.AGE:
                    age = parseInt(message.content);
                    if (age === NaN) {
                        message.channel.send("`age must be an integer :3`");
                    } else {
                        message.channel.send("`what is your gender? (M/F/X)`");
                        dataState = dataStates.GENDER;
                    }
                    break;
                case dataStates.GENDER:
                    var response = message.content.toUpperCase();
                    if (
                        response === "M" ||
                        response === "F" ||
                        response === "X"
                    ) {
                        gender = response;
                        dataState = dataStates.NATIONALITY;
                        message.channel.send("`what's your nationality?`");
                    } else {
                        message.channel.send(
                            "`please choose from M for male, F for female, or X for other!`"
                        );
                    }
                    break;
                case dataStates.NATIONALITY:
                    nationality = message.content.toUpperCase();
                    message.channel.send(
                        "`starting quiz of length " +
                            questions +
                            "! Good luck!` :blue_heart:"
                    );
                    dataState = dataStates.NONE;

                    startQuiz(message);
                    break;
                case dataStates.GENERATED:
                    asked++;
                    if (asked > questions) {
                        if (message.content === "n") {
                            correct++;
                            correctGenerated++;
                            message.channel.send("Correct!");
                        } else {
                            incorrectGenerated++;
                            message.channel.send("**WRONG!**");
                        }
                        message.channel.send(
                            "`Game over! Your score is " +
                                correct +
                                " out of " +
                                questions +
                                "!`"
                        );
                        dataState = dataStates.NONE;
                        writeToJSON();
                    } else {
                        nextRandomName();
                        if (message.content === "n") {
                            correct++;
                            correctGenerated++;
                            message.channel.send(
                                "Correct! Is " + name + " a real name? (y/n)"
                            );
                        } else {
                            incorrectGenerated++;
                            message.channel.send(
                                "**WRONG!** Is " + name + " a real name? (y/n)"
                            );
                        }
                    }
                    break;
                case dataStates.REAL_NAME:
                    asked++;
                    if (asked >= questions) {
                        if (message.content === "y") {
                            correct++;
                            correctReal++;
                            message.channel.send("Correct!");
                        } else {
                            incorrectReal++;
                            message.channel.send("**WRONG!**");
                        }
                        message.channel.send(
                            "`Game over! Your score is " +
                                correct +
                                " out of " +
                                questions +
                                "!`"
                        );
                        dataState = dataStates.NONE;
                        writeToJSON();
                    } else {
                        nextRandomName();
                        if (message.content === "y") {
                            correct++;
                            correctReal++;
                            message.channel.send(
                                "Correct! Is " + name + " a real name? (y/n)"
                            );
                        } else {
                            incorrectReal++;
                            message.channel.send(
                                "**WRONG!** Is " + name + " a real name? (y/n)"
                            );
                        }
                    }
                    break;
            }
        }
    }
});
function startQuiz(message) {
    incorrectGenerated = 0;
    correctGenerated = 0;
    incorrectReal = 0;
    correctReal = 0;
    asked = 0;
    correct = 0;
    nextRandomName();
    message.channel.send("Is " + name + " a real name?");
}

function readData(filename) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, "utf8", function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function writeData(data, filename) {
    var json = JSON.stringify(data);
    fs.writeFile(filename, json, "utf8", function() {
        console.log("Saved data to " + filename);
    });
}

function writeToJSON() {
    fs.readFile("data.json", "utf8", function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            var obj = JSON.parse(data);
            obj.data.push({
                name: userName,
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
function nextRandomName() {
    if (Math.random() > 0.5) {
        name = generateName(Math.floor(Math.random() * 3) + 2);
        dataState = dataStates.GENERATED;
    } else {
        name = rareNames[Math.floor(Math.random() * rareNames.length)];
        dataState = dataStates.REAL_NAME;
    }
}
function initSyllables(data) {
    process.stdout.write("Initializing syllables...");
    var localSyllables = {};
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
            if (!localSyllables[syls[j]]) {
                localSyllables[syls[j]] = {d: {}};
            }
            if (localSyllables[syls[j]].d[next]) {
                localSyllables[syls[j]].d[next]++
            } else {
                localSyllables[syls[j]].d[next]=1
            }
            next = syls[j];
        }
        if (!localSyllables[START]) {
            localSyllables[START] = {d: {}};
        } 
        if (!syls[0]) {
            console.log("BAD DATA " + syls[0]);
            console.log("data " + data[i]);
        }
        if (localSyllables[START].d[syls[0]]) {
            localSyllables[START].d[syls[0]]++
        } else {
            localSyllables[START].d[syls[0]]=1
        }
    }
    for (const prop in localSyllables) {
        if (localSyllables.hasOwnProperty(prop)) {     
            localSyllables[prop].sum=0;       
            for (const nxt in localSyllables[prop].d) {
                if (localSyllables[prop].d.hasOwnProperty(nxt)) {
                    localSyllables[prop].sum+=localSyllables[prop].d[nxt];
                } 
            }
        }
    }
    clearInterval(loadingInterval);
    console.clear();
    return localSyllables;
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
            Math.random() * (syllables[prev].sum - 1)
        );
        var next = "";
            for (const nxt in syllables[prev].d) {
                next = nxt;
                if (syllables[prev].d.hasOwnProperty(nxt)) {
                    index-=syllables[prev].d[nxt];
                    if (index <= 0) break;
                } 
            }
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

function sendMessageToID(channelID, message) {
    client.channels.get(channelID).send(message);
}
