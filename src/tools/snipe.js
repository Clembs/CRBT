module.exports.command = {
    name: "snipe",
    module: "tools",
    description_enUS: "Shows the latest deleted ",
    usage_enUS: "snipe",
    botperms: [""],
    code: `
    $reply[$messageID;
    {author:$userTag[$getChannelVar[snipeAuthor;$mentionedChannels[1;yes]]]:$userAvatar[$getChannelVar[snipeAuthor;$mentionedChannels[1;yes]]]}
    {color:$getGlobalUserVar[color]}
    {description:
Latest deleted message:
\`\`\`$getChannelVar[snipeMsg;$mentionedChannels[1;yes]]\`\`\`
}
;no]
$onlyIf[$getChannelVar[snipeMsg;$mentionedChannels[1;yes]]!=;{title:Error}{color:RED}{description:Theres nothing to snipe in <#$mentionedChannels[1;yes]>}]
    `
    };

    //stuffs if you want to edit this
    // vars: snipeAuthor, snipeMsg, snipeDate, snipeChannel