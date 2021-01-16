require('dotenv').config();
const express = require('express');
const Discord = require('discord.js');
const config = require('./config.json');

/* Web server */
const PORT = process.env.PORT || '5000';
const app = express();

app.get('/', (req, res) => res.redirect(config.discord));
app.listen(PORT, () => console.log('Server started!'));

/* Discord bot */
const client = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;

function parseWorkerId(str) {
	const regex = new RegExp(`^${config.url_base.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + config.regex}$`, 'i');
	let m;

	if ((m = regex.exec(str)) !== null) {
		return m;
	}
	return false;
}

client.once('ready', () => {
	console.log('Ready!');
});

// Process interactions from user messages with defined "prefix"
/* client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
	// TODO: Process command
}); */

client.ws.on('INTERACTION_CREATE', async interaction => {
	const response = {
		type: 2,
	};

	const command = interaction.data.options[0];
	switch (command.name) {
		case 'share':
			const link_data = parseWorkerId(command.value);
			if (!link_data || !link_data[1]) {
				return;
			}
			const workers_id = link_data[1] || '';
			const payload = link_data[2] || '';
			const description = link_data[3] || config.message.description;
			// Interaction Response: https://discord.com/developers/docs/interactions/slash-commands#interaction-response
			response.type = 3;
			response.data = {
				'content': '<@' + interaction.member.user.id + '> ' + config.message.content,
				'embeds': [{
					'title': config.message.title,
					'type': 'link',
					'description': description,
					'url': config.url_base + workers_id + payload,
					'color': config.message.color,
					'image': config.message.image,
					'footer': {
						'text': workers_id,
					},
					/* 'author': {
						'name': interaction.member.user.username,
					}, */
				}],
				'allowed_mentions': {
					'users': [interaction.member.user.id],
				},
			};
			console.log(interaction.member.user.id + config.message.content + ' ' + workers_id + payload);
			break;
		default:
			break;
	}

	client.api.interactions(interaction.id, interaction.token).callback.post({
		data: response,
	});
});

client.login(BOT_TOKEN);