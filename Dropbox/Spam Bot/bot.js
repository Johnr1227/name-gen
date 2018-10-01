const fs = require("fs");

const discord = require("discord.js");
const mainClient = new discord.Client();
const auth = require("./auth.json");

var data = require("./data.json");

var helpMessage;

var main = new discord.Client();

var spammers = [];
var spammerAuths = [
    "NDkxMzQxMDI1MTI2NjQ1Nzcw.Do73xA.T47m7B3dTivubPp8sINsvbSkffM",
    "NDkxMzQxNTc3MTQ3NTE0ODkx.Do731A.tsp-TkOqewzVMTyLAoNBYbETYiE",
    "NDkxMzQxODU2NDI1MjQ2NzQw.Do734w.N5YjRoRfykQ2giVq7pUcP4-7Ql0",
    "NDkxMzQyMTEyNjYzNTM1NjI4.Do738Q.gal_RisLNCnWcmBc2Xb8NwjbA2Q",
    "NDkxMzQyMzg3OTE5MDYwOTky.Do73_w.zlEJoOKGInzkZqcZIhd3NImmWrw",
    // oof
    "NDk2MDExNTUwODc2NzYyMTIy.DpKazw.-vUJ-hNek9_ZxvCBBT_ZHEzaucE",
    "NDk2MDExNzI2NjgxMDE0Mjcz.DpKa7g.2ACuq2m-ZKFv1JxZWA69QKQWRwc",
    "NDk2MDExODI4NTk4NTM4Mjcw.DpKbBA.QFK4y64-cUcWVHv_KbgDX26Ythw",
    "NDk2MDExOTE2NzY2ODcxNTYy.DpKbIg.dmG_Rx76syEaxWI4kTiqrkd7z_8",
    "NDk2MDExOTg3MjM5ODI5NTA1.DpKeng.ysd9JowUFafWxI5acejdTr8eiPw"
];
var spamMessage = "";

var spamChannels = [];
var logChannel = "";

var startingTime = 0;

var spamCount = 0;
var counter = 0;

var buffer = -1;

for (var i = 0; i < spammerAuths.length; i++) {
    spammers[i] = new discord.Client();
}
var spamTypes = {
    STREAM: 0,
    BURSTS: 1
};

var spamType = spamTypes.STREAM;
var shouldSpam = true;

var ping = 0;

main.on("ready", () => {
    console.log("bot ready!");
    setHelpMessage();
});

main.on("message", message => {
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
                case "help":
                    message.channel.send(helpMessage);
                    break;
                case "spam":
                    if (args && args.length > 0) {
                        spamCount = args[0];
                        message.channel.send(getSpamEmbed(spamCount));
                    } else {
                        message.channel.send("`not enough arguments.`");
                    }
                    spamMessage = args.splice(1).join(" ");
                    startingTime = (Date.now() / 1000) | 0;
                    shouldSpam = true;
                    buffer = -1;
                    counter = 0;
                    logChannel = message.channel.id;
                    break;
                case "send":
                    if (args && args.length > 0) {
                        message.channel.send(
                            "`Sending " + args[0] + " messages...`"
                        );
                        spamCount = args[0];
                    } else {
                        message.channel.send("`not enough arguments.`");
                    }
                    counter = 0;
                    buffer = -1;
                    logChannel = message.channel.id;
                    spamMessage = args.splice(1).join(" ");
                    break;
                case "create-spam-channels":
                    var server = message.guild;
                    if (args && args.length > 0) {
                        for (var i = 0; i < args[0]; i++) {
                            for (var j in server.channels) {
                                if (
                                    server.channels[j].type === "text" &&
                                    server.channels[j].name === "spam-" + i
                                ) {
                                    break;
                                }
                            }
                            server.createChannel("spam-" + i, "text");
                        }
                    }
                    break;
                case "stop-spam":
                    shouldSpam = false;
                    message.channel.send("`stopped spamming.`");
                    break;
                case "spam-data":
                    message.channel.send(getSpamDataEmbed());
                    break;
                case "save-channels":
                    writeToJSON();
                    message.channel.send("`Saved your channels.`");
                    break;
                case "load-channels":
                    spamChannels = data.spamChannels;
                    message.channel.send("`loaded channels`");
                    break;
                case "add-spam-channel":
                    if (args && args.length > 0) {
                        var channel = args[0].replace(/[^1234567890]+/g, "");
                        if (!spamChannels.includes(channel)) {
                            spamChannels.push(channel);
                            message.channel.send(
                                "`added  `" + args[0] + "`  to :spam`"
                            );
                        } else {
                            message.channel.send(
                                "`that channel is already getting spammed.`"
                            );
                        }
                    } else {
                        message.channel.send(
                            "`please enter the channel to add.`"
                        );
                    }
                    break;
                case "remove-spam-channel":
                    if (args && args.length > 0) {
                        var channel = args[0].replace(/[^1234567890]+/g, "");
                        if (!spamChannels.includes(channel)) {
                            remove(spamChannels, channel);
                            message.channel.send(
                                "`removed  `" + args[0] + "`  from :spam`"
                            );
                        } else {
                            message.channel.send(
                                "`that channel is not already getting spammed.`"
                            );
                        }
                    } else {
                        message.channel.send(
                            "`please enter the channel to remove.`"
                        );
                    }
                    break;
                case "spam-channels":
                    message.channel.send(
                        "`channels being spammed: `" +
                            "<#" +
                            spamChannels.join(">,  <#").substring(0) +
                            ">"
                    );
                    break;
            }
        }
    }
});
for (var i = 0; i < spammers.length; i++) {
    spammers[i].on("message", message => {
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
                    case "spam":
                        if (buffer === spammers.length - 1) {
                            buffer = -1;
                        } else {
                            buffer++;
                        }
                        if (args && args.length > 0) {
                            if (spamType === spamTypes.STREAM) {
                                startSpam(buffer, spammers[buffer]);
                            } else {
                                spam(spammers[buffer]);
                            }
                        }
                        break;
                    case "send":
                        if (buffer === spammers.length - 1) {
                            buffer = -1;
                        } else {
                            buffer++;
                        }
                        for (var j = 0; j < 5; j++) {
                            for (var k = 0; k < spamChannels.length; k++) {
                                if (counter < spamCount) {
                                    counter++;
                                    sendMessageToID(
                                        spammers[buffer],
                                        spamChannels[k],
                                        spamMessage
                                    );
                                }
                            }
                        }
                }
            }
        }
    });
}
function writeToJSON() {
    fs.readFile("data.json", "utf8", function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            var obj = JSON.parse(data);
            obj.spamChannels = spamChannels;
            var json = JSON.stringify(obj);
            fs.writeFile("data.json", json, "utf8", function() {
                //console.log(json);
            });
        }
    });
}
function startSpam(ID, client) {
    setTimeout(function() {
        spam(client);
    }, (1000 / spammers.length + 1) * (ID + 1));
}
function spam(client) {
    if (shouldSpam) {
        if (counter > spamCount) {
            sendMessageToID(main, logChannel, getDoneSpammingEmbed());
            shouldSpam = false;
        } else
            setTimeout(function() {
                for (var i in spamChannels) {
                    sendMessageToID(client, spamChannels[i], spamMessage);
                    counter++;
                }
                spam(client);
            }, 1000 + setPing() * 10);
    }
}
function remove(array, element) {
    var index = array.indexOf(element);
    array.splice(index, 1);
}
function setPing() {
    ping = main.ping;
    return ping;
}
function setHelpMessage() {
    var prefix = ":";
    helpMessage = new discord.RichEmbed();
    helpMessage.setTitle(":warning: **Commands** :warning:");
    helpMessage.setDescription(
        "try " + prefix + "help [command] for specific help on that command.\n"
    );
    helpMessage.setColor(16776960);
    helpMessage.addField(prefix + "help", "displays this message again.");
    helpMessage.addField(
        prefix + "spam",
        "Syntax: " +
            prefix +
            "spam (int)<amount to spam> (String)<message>\n\nSpams _______ messages spread out over all bots in all channels. Better for large amounts of spam (>500)",
        true
    );
    helpMessage.addField(
        prefix + "spam-data",
        "Prints out information about the messages being spammed.",
        true
    );
    helpMessage.addField(
        prefix + "add-spam-channel",
        "Syntax: " +
            prefix +
            "add-spam-channel <channel>\n\nSets a channel to be spammed when you do " +
            prefix +
            "spam or " +
            prefix +
            "send.",
        true
    );
    helpMessage.addField(
        prefix + "spam-channels",
        "prints out all channels that are being spammed",
        true
    );
    helpMessage.addField(
        prefix + "send",
        "Syntax: " +
            prefix +
            "send (int)<amount to send> (String)<message>\n\nSends _______ messages spread out over all bots in all channels. Better for small amounts of spam (<500)",
        true
    );
    helpMessage.addField(
        prefix + "stop-spam",
        "stops all messages from being spammed.",
        true
    );
}
function getSpamEmbed(messages) {
    var spamEmbed = new discord.RichEmbed();
    spamEmbed.setTitle(":warning: **Spamming!** :warning:");
    spamEmbed.addField(
        "Estimated Time: ",
        secondsToString(
            Math.floor(messages / spammers.length / spamChannels.length)
        ),
        true
    );
    return spamEmbed;
}
function getSpamDataEmbed() {
    var spamEmbed = new discord.RichEmbed();
    spamEmbed.setTitle("**Spam Data:**");
    spamEmbed.addField("Message:", spamMessage, true);
    spamEmbed.addField("Messages Sent:", counter, true);
    spamEmbed.addField(
        "Done in:",
        secondsToString(
            Math.max(Math.floor((spamCount - counter) / spamChannels.length), 0)
        ),
        true
    );
    return spamEmbed;
}
function getDoneSpammingEmbed() {
    var spamEmbed = new discord.RichEmbed();
    spamEmbed.setTitle("**Done Spamming!**");
    spamEmbed.addField(
        "Took " + secondsToString(((Date.now() / 1000) | 0) - startingTime),
        "Sent " + spamCount + (spamCount === 1 ? " message" : " messages")
    );
    return spamEmbed;
}
function sendMessageToID(client, channelID, message) {
    client.channels.get(channelID).send(message);
}
function secondsToString(seconds) {
    var minutes = 0;
    var hours = 0;
    var days = 0;
    var weeks = 0;
    var years = 0;
    var text = "";
    if (seconds >= 60) {
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            if (hours >= 24) {
                days = Math.floor(hours / 24);
                hours = hours % 24;
                if (days >= 7) {
                    weeks = Math.floor(days / 7);
                    days = days % 7;
                    if (weeks >= 52) {
                        years = Math.floor(weeks / 52);
                        weeks = weeks % 52;
                    }
                }
            }
        }
    }
    var text = "";
    if (years !== 0) {
        if (years > 1 || years < 1) {
            text = text + years + " years";
        } else if (years === 1) {
            text = text + "1 year";
        }
        if (weeks !== 0) {
            text = text + ", ";
        }
    }
    if (weeks !== 0) {
        if (weeks > 1 || weeks < 1) {
            text = text + weeks + "weeks";
        } else if (weeks === 1) {
            text = text + "1 week";
        }
        if (days !== 0) {
            text = text + ", ";
        }
    }
    if (days !== 0) {
        if (days > 1 || days < 1) {
            text = text + days + " days";
        } else if (days === 1) {
            text = text + "1 day";
        }
        if (hours !== 0) {
            text = text + ", ";
        }
    }
    if (hours !== 0) {
        if (hours > 1 || hours < 1) {
            text = text + hours + " hours";
        } else if (hours === 1) {
            text = text + "1 hour";
        }
        if (minutes !== 0) {
            text = text + ", ";
        }
    }
    if (minutes !== 0) {
        if (minutes > 1 || minutes < 1) {
            text = text + minutes + " minutes";
        } else if (minutes === 1) {
            text = text + "1 minute";
        }
        if (seconds !== 0) {
            text = text + ", ";
        }
    }
    if (seconds !== 0) {
        if (seconds > 1 || seconds < 1) {
            text = text + seconds + " seconds";
        } else if (seconds === 1) {
            text = text + "1 second";
        }
    }
    return text == "" ? ">1 second" : text;
}

main.login(auth.token);

for (var i = 0; i < spammers.length; i++) {
    spammers[i].login(spammerAuths[i]);
}
