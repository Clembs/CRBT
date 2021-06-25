const { colors, emojis, tokens } = require("../../index");

module.exports.command = {
    name: "play",
    module: "music",
    aliases: ["p", "add"],
    description_enUS: "Adds <botname> to the voice channel, adds the song(s) to the queue or directly plays it if no music is currently playing.",
    usage_enUS: "<search terms | YouTube, Spotify or SoundCloud URL>",
    botperms: ["connect", "speak"],
    code: `
    $lavalinkExecute[play;;$message]
    `}