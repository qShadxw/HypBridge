import { Command } from "../interfaces/DiscordCommand";
import { EmojiIds } from "../interfaces/EmojiIds";
import { MessageEmbed } from "discord.js";
import _emojiIds from "../util/emojis/_emojiIds.json";
import fetchErrorEmbed from "../util/fetchErrorEmbed";
import fetchFakeChat from "../util/fetchFakeChat";
import getEmojiBuffers from "../util/emojis/getEmojiBuffers";
import isFetchError from "../util/isFetchError";
import { GuildRankColors, VerboseHypixelRank, VerboseHypixelRanks } from "../interfaces/Ranks";
import writeToFile from "../util/writeToFile";

export default {
	data: {
		name: "uploademoji",
		description: "Upload a guild rank emoji to a designated server!",
		options: [
			{
				name: "hypixelranks",
				description: "Upload all Hypixel rank emojis!",
				type: "SUB_COMMAND",
			},
			{
				name: "guildrank",
				description: "Upload a guild rank emoji!",
				type: "SUB_COMMAND",
				options: [
					{
						name: "color",
						description: "What color is the guild rank?",
						type: "STRING",
						choices: Object.entries(GuildRankColors).map(([key, value]) => {
							return { name: key, value: value };
						}),
						required: true,
					},
					{
						name: "name",
						description: "What is the name of the guild rank?",
						type: "STRING",
						required: true,
					},
				],
			},
		],
	},
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - unused bot parameter
	run: async (bot, interaction, args) => {
		const emojiIds = _emojiIds as EmojiIds;
		let successEmbed: MessageEmbed;

		if (interaction.options.getSubcommand() === "hypixelranks") {
			await interaction.reply("Uploading emojis...");

			const emojiBuffers = await getEmojiBuffers();
			for (const [name, buffer] of Object.entries(emojiBuffers)) {
				const rankName = Object.values(VerboseHypixelRanks).find(
					(rank) => typeof rank === "string" && name.includes(rank),
				) as VerboseHypixelRank | undefined;

				if (rankName) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const emoji = await interaction.guild!.emojis.create(buffer, name);
					emojiIds.hypixel[rankName].push({ name: emoji.name as string, id: emoji.id });

					// TODO: actually save the JSON file lol
					console.log(emoji.id);
				} else {
					const embed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Error")
						.setDescription(`An unexpected error occured: Unkown emoji of name ${name}`);
					return interaction.followUp({ embeds: [embed] });
				}
			}

			successEmbed = new MessageEmbed()
				.setColor("GREEN")
				.setTitle("Completed")
				.setDescription("All Hypixel rank emojis have been uploaded!");
		} else {
			const color = args[0] as typeof GuildRankColors[keyof typeof GuildRankColors];
			const name = args[1] as string;

			const data = `${color}[${name}]`;
			const fakeChat = await fetchFakeChat(data);

			if (isFetchError(fakeChat)) {
				const embed = fetchErrorEmbed(fakeChat);
				return await interaction.reply({ embeds: [embed] });
			}

			// TODO: Slice image into sections... jimp? (Start from right of image, or use remainder of [image / width] for first slice.)
			// TODO: Find a way to save and use emojis when they appear in chat. Use regex to reference by lowercase name to JSON file?

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const emoji = await interaction.guild!.emojis.create(fakeChat, name);
			successEmbed = new MessageEmbed()
				.setColor("GREEN")
				.setTitle("Emoji set")
				.setDescription(`The emoji ${name} has been created! ${emoji}`);
		}

		writeToFile("./src/util/emojis/_emojiIds.json", emojiIds, interaction, successEmbed);
	},
} as Command;
