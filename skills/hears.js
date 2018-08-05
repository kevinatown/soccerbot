const wordfilter = require('wordfilter');
const _ = require('lodash');
const { 
  stats,
  formatUptime,
  getTodaysMatches,
  getAllStandings,
  getCurrentMatchDetails
} = require('../utils/utils.js');

module.exports = function(controller) {

  controller.on('heard_trigger', function() {
      stats.triggers++;
  });

  controller.on('conversationStarted', function() {
      stats.convos++;
  });

  // 
  // Given Uptime
  // 
  controller.hears(['^uptime','^debug'], 'direct_message,direct_mention', function(bot, message) {
    console.log('uptime');
    bot.createConversation(message, function(err, convo) {
      
      if (!err) {
        convo.setVar('uptime', formatUptime(process.uptime()));
        convo.setVar('convos', stats.convos);
        convo.setVar('triggers', stats.triggers);

        convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.');
        convo.activate();
      }
    });

  });
  
  controller.hears(['^help','^commands'], 'direct_message,direct_mention', function(bot, message) {
    const helpStr = `Hi I am soccerbot. I was created to keep you up to date on the World Cup. Here are some of my commands:
      \`standings\`: get the current standings for all of the groups
      \`matches\`: get a list of the matches for today
      \`current match\`: get the details/events of the current match
    `;
    bot.reply(message,helpStr);
  });

  // 
  // getAllStandings
  // HEARS: * standings
  // 
  controller.hears('(?:[(?:\w+)(?:\s+)])*(stand(?:ing|ings)?)', 
    'direct_message,direct_mention,ambient,mention',
    async (bot, message) => { 
      if (message.match[1]) {
        const standings = await getAllStandings();
        bot.reply(message, `${standings}\n`);
      }
  });
  
  // 
  // getCurrentMatchDetails
  // HEARS: current match | game
  // 
  controller.hears('(?:[(?:\w+)(?:\s+)])*(current) (match|game)', 
    'direct_message,direct_mention,ambient,mention',
    async (bot, message) => { 
      if (message.match[1]) {
        console.log('heard')
        const matchDeets = await getCurrentMatchDetails();
        bot.reply(message, `${matchDeets}`);
      }
  });

  // 
  // getTodaysMatches
  // HEARS: * matches
  // 
  controller.hears('(?:[(?:\w+)(?:\s+)])*(match(es|s))', 
    'direct_message,direct_mention,ambient,mention',
    async (bot, message) => { 
      if (message.match[1]) {
        const matches = await getTodaysMatches();
        bot.reply(message, `${matches}\n`);
      }
  });

  // 
  // perdicts who will win the world cup
  // HEARS: * win
  // 
  controller.hears('((who|what team|which team) will win)[(?:\w+)(?:\s+)]*', 
    'direct_message,direct_mention,ambient,mention',
    (bot, message) => { 
      if (message.match[1]) {
        bot.reply(message, `:cbf: :cbf: :cbf: *BRASIL!!!* :cbf: :cbf: :cbf:`);
      }
  });
  
  controller.hears('[(?:\w+)(?:\s+)]*', 
    'direct_message,direct_mention,ambient,mention',
    (bot, message) => { 
      console.log('hi')
      if (message.match[1]) {
        bot.reply(message, `:cbf: :cbf: :cbf: *BRASIL!!!* :cbf: :cbf: :cbf:`);
      }
  });
};
