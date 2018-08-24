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
  const urlStub = ``;
  const matches = await fetchData(urlStub);
};


module.exports = {
  getAvailCompetitions,
};

