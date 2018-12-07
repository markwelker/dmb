const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
const axios = require('axios');

const ROLL_MESSAGE = '!roll [quantity]d[size][+-modifier] (rolls quantity dice of given size) given quantity and size <= 100\n\t\tAlternatives: !rolladv and !rolldis for advantage and disadvantage.';
const FLIP_MESSAGE = '!flip (Flips a coin, heads or tails)';
const SPELL_MESSAGE = '!spell [Spell Name] (Spelling and Capitalization must be exact match)';
const HELP_MESSAGE = 	'Command syntax goes as follows: !command [option 1][opt 2] (results)\n' + 
				'!help (displays this again)\n' +
				FLIP_MESSAGE + '\n' +
				ROLL_MESSAGE + '\n' + 
				SPELL_MESSAGE;

client.on('message', message => {
	content = message.content;
	if (content[0] === prefix && !message.author.bot) {
		// send back "Pong." to the channel the message was sent in
		if (content.startsWith('!help') || content.startsWith('!syntax')) {
			message.channel.send(HELP_MESSAGE);
		}

		/***************** Roll with Advantage *****************/
		if (content.startsWith('!rolladv')) {
			first = roll(content.substring(8))
			second = roll(content.substring(8))
			if (first === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else
				message.channel.send(message.member.nickname + " rolled a " + first + " and " + second + 
										' for a higher roll of: ' + Math.max(first, second));
		}

		/***************** Roll with Disdvantage *****************/
		else if (content.startsWith('!rolldis')) {
			first = roll(content.substring(8))
			second = roll(content.substring(8))
			if (first === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else
				message.channel.send(message.member.nickname + " rolled a " + first + " and " + second + 
										' for a lower roll of: ' + Math.min(first, second));
		}

		/***************** Roll Normally *****************/
		else if (content.startsWith('!roll')) {
			result = roll(content.substring(5))
			if (result === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else 
				message.channel.send(message.member.nickname + " rolled a " + result);
		}

		/***************** Flip a Coin *****************/
		else if (content.startsWith('!flip')) {
			result = rand(1, 2);
			if (result === 0)
				message.channel.send(message.member.nickname + ' got Heads!');
			else 
				message.channel.send(message.member.nickname + ' got Tails!');
		}

		/***************** Spell Lookup *****************/
		else if (content.startsWith('!spell')) {
			spellName = content.substr(content.indexOf(' ')+1);
			spellLookupName(spellName).then(response => {
				message.channel.send(spellToString(response.data));
			}).catch(error => {
				console.log('spellLookupName error: ' + error);
				message.channel.send("I couldn\'t find '" + spellName + "', try checking spelling/capitalization?");
			})

		}

		/***************** Fun Functions *****************/
		else if (content.startsWith('!test') || content.startsWith('!bot')) {
			message.channel.send('Beep Boop. I\'m a bot.');
		}
		else if (content.startsWith('!thank')) {
			message.channel.send('You\'re very welcome. Beep Boop.');
		}
	}
});

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);


/******************************** Functions ********************************/
/**
 * Returns a string timestamp formatted like 10/30, 16:57:38
 */
function getTime() {
	var d = new Date();
	return d.getMonth()+'/'+d.getDate()+', '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}

/**
 * Returns a randomized number with the given parameters
 * @param {int} quantity	Number of dice rolled
 * @param {int} size 		Size of the dice
 * @param {int} modifier 	Modifier of total roll, positive or negative allowed.
 */
function rand(quantity = 1, size = 20, modifier = 0) {
	total = 0;
	for (i=0; i<quantity; i++) {
		total+= Math.floor(size * Math.random()) + 1;
	}
	return total + modifier;
}

/**
 * 
 * @param {String} content Triggering message the bot received minus the !roll trigger
 * @return {Integer} number rolled on dice. #TODO Possibly change to string for nicer formatting?
 */
function roll(content) {
	content = content.replace(/\s+/g, '')
	length = content.length;
	index = 0  // Will always look at the next character in content.
	if (length == index) // empty, so return default
		return rand();

	try {
		quantity = parseInt(content.substring(index))
		// Edge case to allow omission of quantity in [quantity]d[size]
		if (isNaN(quantity)) {
			quantity = 1;
			index += Math.floor(Math.log10(quantity)) + 1;
		}
		else {
			index += Math.floor(Math.log10(quantity)) + 2;
		}

		size = parseInt(content.substring(index));

		if (isNaN(size) || quantity < 1 || size < 1 || quantity > 100 || size > 100 ) return false;

		index += Math.floor(Math.log10(size)) + 1;

		if (length <= index) return rand(quantity, size); // No modifier, so return without one.
		
		if (content[index] === '-') subtraction = true;
		else if (content[index] === '+') subtraction = false;
		else return false;
		index += 1;
		
		modifier = parseInt(content.substring(index));

		if (subtraction) return rand(quantity, size, -1 * modifier);
		else return rand(quantity, size, modifier);
		
	} catch (e) {
		var d = new Date();
		console.log('Error caught in roll(): ' + getTime());
		console.log(e)
		return false;
	}
}

/**
 * Utilizes and returns a two-level deep ES6 Promise with spell info
 * given a correctly spelled and capitalized spell name
 * @param {String} spellName spell name
 * @return {Promise} contains the spell's information
 */
function spellLookupName(spellName) {
	return axios.get('http://dnd5eapi.co/api/spells/?name=' + spellName).then(response => {
		return axios.get(response.data.results[0].url);
	});
}
/**
 * Formats spell information into a pretty string format
 * @param {JSON} spell Spell data retrieved from our API
 * @return {String} prettified spell string
 */
function spellToString(spell) {
	return spell.name + ':\n' + 
	'Level ' + spell.level + ' ' + spell.school.name + '\n' +
	'Range: ' + spell.range + '\n' +
	'Components: ' + spell.components.join(', ') + '\n' + spell.desc;
}