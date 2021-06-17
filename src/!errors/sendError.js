const { links, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "sendError",
    code: `
$createFile[$error;error$hour-$second-$minute.log]
$channelSendMessage[${links.channels.error};
{title:An error occured while executing \`()$getGlobalUserVar[lastCmd]\`}
{field:Details:
Platform: \`$platform\`
Args: \`$message\`
:yes}
{color:${colors.error}}
;no]
    `}