/* 
  API 
 */
const _ = require('lodash');
const moment = require('moment');
const fetch = require('node-fetch');

const fetchData = async (urlStub) => {
  const url = `http://api.football-data.org/v2/${urlStub}`;
  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': process.env.apiToken
    }
  });
  const data = await response.json();
  return data;
};

const getAvailCompetitions = async () => {
  const allComps = await fetchData('competitions');
  const availComps = _.filter(allComps.competitions, (competition) => competition.plan === 'TIER_ONE');
  return availComps;
}

const getStandings = async (competitionId) => {
  const standings = await fetchData(`competitions/${competitionId}/standings`);
  // do shit with standings
};

const getTodaysMatches = async (competitionId) => {
  const today = moment().format('YYYY-MM-DD');
  const tomorrow = moment().add(1,'days').format('YYYY-MM-DD');
  const urlStub = `competitions/${competitionId}/matches?dateFrom=${today}&dateTo=${tomorrow}`;
  const res = await fetchData(urlStub);
  const matches = res.matches;
  return matches;
};

const formatMatchData = (match) => {
  const isMatchedFinished = match.status === 'FINISHED';
  if (isMatchedFinished) {
    return {
      date: match.utcDate,
      homeTeam: {
        team: match.homeTeam.name,
        score: match.score.fullTime.homeTeam,
      },
      awayTeam: {
        team: match.awayTeam.name,
        score: match.score.fullTime.awayTeam,
      },
      isComplete: true
    };
  } else {
    return {
      date: match.utcDate,
      homeTeam: {
        team: match.homeTeam.name,
        score: 0
      },
      awayTeam: {
        match.awayTeam.name,
        score: 0
      },
      isComplete: false
    };
  }
};

const getTodaysMatches = async () => {
  const competitions = await getAvailCompetitions();
  const allMatches = [];
  _.forEach(competitions, (comp) => {
    const todaysMatches = await getTodaysMatches(comp.id);
    const compMatches = {
      legaue: comp.name,
      location: area.name,
      matches: []
    };
    _.forEach(comp.matches, (match) => {
      compMatches.matches.push(formatMatchData(match));
    });
    allMatches.push(compMatches);
  });
  return allMatches;
};


module.exports = {
  getAvailCompetitions,
  getTodaysMatches,
};

