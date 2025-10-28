import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay, selectBoxscore, selectTeams } from '../features/games.js';

const getPlayerStats = (boxscore, teams, id) => {
  const key = 'ID' + id;
  const homePlayers = boxscore.home.players;
  if (homePlayers[key]) {
    return {
      team: teams.home,
      player: homePlayers[key],
    };
  }
  return {
    team: teams.away,
    player: boxscore.away.players[key],
  };
};

const formatStat = (value, decimals = 0) => {
  if (value === undefined || value === null || value === '') return '-';
  if (decimals > 0) {
    const num = Number(value);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  }
  return value;
};

const getBasicView = (pitchTeam, pitcher, batTeam, batter) => {
  return `${pitchTeam.abbreviation} Pitching: ` +
    `{bold}${pitcher.person.fullName}{/bold} ${formatStat(pitcher.stats.pitching.inningsPitched, 1)} IP, ${formatStat(pitcher.stats.pitching.pitchesThrown)} P, ${formatStat(pitcher.seasonStats.pitching.era, 2)} ERA\n` +
    `${batTeam.abbreviation} At Bat:   ` +
    `{bold}${batter.person.fullName}{/bold} ${formatStat(batter.stats.batting.hits)}-${formatStat(batter.stats.batting.atBats)}, ${formatStat(batter.seasonStats.batting.avg, 3)} AVG, ${formatStat(batter.seasonStats.batting.homeRuns)} HR`;
};

function Matchup() {
  const boxscore = useSelector(selectBoxscore);
  const currentPlay = useSelector(selectCurrentPlay);
  const teams = useSelector(selectTeams);

  const pitcherId = currentPlay.matchup?.pitcher?.id;
  const batterId = currentPlay.matchup?.batter?.id;

  const {team: pitchTeam, player: pitcher} = getPlayerStats(boxscore, teams, pitcherId);
  const {team: batTeam, player: batter} = getPlayerStats(boxscore, teams, batterId);

  const display = getBasicView(pitchTeam, pitcher, batTeam, batter);
  return <box tags content={display} wrap={false} />;
}

export default Matchup;