const index = require("../../../index.js");
const client = index.client;
const staffChannelID = process.env.STAFFCHANNELID;
const serverID = process.env.SERVERID;

module.exports = {
	name: "guildUnmute",
	async execute(staffRank, staffUsername, unmutedRank, unmutedUsername) {
		if(!staffRank) {staffRank = "";}
		if(!unmutedRank) {unmutedRank = "";}
		client.channels.cache.get(staffChannelID).send(`-----------------------------------------------------\n**${staffRank} ${staffUsername}** has unmuted **${unmutedRank} ${unmutedUsername}**\n-----------------------------------------------------`);
		const displayNickname = unmutedUsername;
		const serverMembers = client.guilds.cache.get(serverID).members;
		const matchedMember = serverMembers.cache.find(m => m.displayName === displayNickname);
		if (!matchedMember) {return;}
		if (serverMembers.get(matchedMember).roles.cache.some(role => role.id === "849100433317298207") == true) {
			serverMembers.get(matchedMember).roles.remove("849100433317298207");
		}
	}
};