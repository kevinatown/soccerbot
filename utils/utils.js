/* 
  UTILS 
 */
const _ = require('lodash');
const moment = require('moment');
const request = require('request');
const fetch = require('node-fetch');
/*
  
Types from api:

  TEAM: {
    code: string
    country: string
    goals: number
  },
  EVENT: {
    id: number,
    player: string,
    time: string,
    type_of_event: string
  },
  MATCH: {
    away_team: TEAM,
    away_team_events: EVENT,
    datetime: datetime,
    fifa_id: "300353632"
    home_team: TEAM
    home_team_events: EVENT
    last_event_update_at: ?
    last_score_update_at: ?
    location: string
    status: 'future' | 'in progress' | 'full-time'
    time: string | null
    venue: string
    winner: string | null
    winner_code: string | null
  }
  standings:
  [
    {
      group: {
        id: number,
        letter: string,
        teams: [
          {
            team: {
              country: string,
              fifa_code: string,
              goal_differential: number,
              id: number,
              points: string
            }
          },
          ...
        ] 
      }
    },
    ...
  ]
  
  */

const fetchData = async (url) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  const data = await response.json()
  return data;
};

const getMatchSring = (match) => {
  if (match.status === 'future') {
    const time = moment(`${match.datetime}`).format('LT');
    return `${time}\t\t${match.away_team.country} \t at \t ${match.home_team.country}`;
  } else if (match.status === 'in progress') {
    return `${match.time}\t\t${match.away_team.country}: ${match.away_team.goals}\t v \t${match.home_team.country}: ${match.home_team.goals}`;
  }
  return `Final\t\t${match.away_team.country}: ${match.away_team.goals}\t\t${match.home_team.country}: ${match.home_team.goals}`;
};

const getTeamStandingString = (team) => {
  return `${team.fifa_code}\t\t${team.points}\t\t${team.wins}\t\t${team.losses}\t\t${team.draws}\t\t${team.goal_differential}`
};

const getTeamStats = (team) => {
  return `
    Attempts on Goal: ${team.attempts_on_goal}
    On Target: ${team.on_target}
    Corners: ${team.corners}
    Possession: ${team.ball_possession}%
    Pass Acc: ${team.pass_accuracy}%
    Fouls: ${team.fouls_committed}
    Yellow Cards: ${team.yellow_cards}
    Red Cards: ${team.red_cards}
  `;
};

const getTeamEvents = (team) => {
  let lines = '';
  _.forEach(team, (event) => {
    lines = `${lines}${event.time}\t\t${event.type_of_event}\t\t${event.player}\n\t`;
  });
  return lines;
};

const getMatchStats = (match) => {
  return `
    *${match.home_team.country} stats:*${getTeamStats(match.home_team_statistics)}\n*${match.home_team.country} events:*
    ${getTeamEvents(match.home_team_events)}
    *${match.away_team.country} stats:*${getTeamStats(match.away_team_statistics)}\n*${match.away_team.country} events:*
    ${getTeamEvents(match.away_team_events)}
  `;
};

const getGroupStandings = (group) => {
  let lines = '';
  _.forEach(group.teams, (team) => {
    lines = `${lines}${getTeamStandingString(team.team)}\n`;
  });
  return lines;
};

const getTodaysMatches = async () => {
  const matches = await fetchData('http://worldcup.sfg.io/matches/today');
  let lines = `\`\`\`TODAYS MATCHES:\n`;  
  _.forEach(matches, (match) => {
    lines = `${lines}${getMatchSring(match)}\n`
  });
  return `${lines}\`\`\``;
};

const getAllStandings = async () => {
  let lines = '*COUNTRY*\t\t*POINTS*\t\t*WINS*\t\t*LOSSES*\t\t*DRAWS*\t\t*GOAL DIF*\n';
  const standings = await fetchData('http://worldcup.sfg.io/teams/group_results');
  _.forEach(standings, (group) => {
    lines = `${lines}*Group ${_.get(group, 'group.letter', '')}*\n\`\`\`${getGroupStandings(group.group)}\`\`\`\n`;
  });
  return lines;
};

const getCurrentMatchDetails = async () => {
  const matches = await fetchData('http://worldcup.sfg.io/matches/today');
  const match = _.first(_.filter(matches, (match) => match.status === 'in progress'));
  if (match) {
    return `${match.time}\t\t${match.home_team.country}: ${match.home_team.goals}\t\t ${match.away_team.country}: ${match.away_team.goals}\n${getMatchStats(match)}`;
  }
  return 'There are no matches in play';
};

const formatUptime = (uptime) => {
  let unit = 'second';
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'minute';
  }
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'hour';
  }
  if (uptime != 1) {
    unit = unit + 's';
  }
  uptime = parseInt(uptime) + ' ' + unit;
  return uptime;
};

const stats = {
    triggers: 0,
    convos: 0,
};

module.exports = {
  stats,
  formatUptime,
  getTodaysMatches,
  getAllStandings,
  getCurrentMatchDetails
};

