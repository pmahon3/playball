import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentPlay, selectBoxscore, selectTeams } from '../features/games.js';
import useKey from '../hooks/useKey.js';

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

const getAdvancedBattingView = (pitchTeam, pitcher, batTeam, batter) => {
  return `${pitchTeam.abbreviation} Pitching: ` +
    `{bold}${pitcher.person.fullName}{/bold} ${formatStat(pitcher.stats.pitching.inningsPitched, 1)} IP, ${formatStat(pitcher.stats.pitching.strikeOuts)} K, ${formatStat(pitcher.stats.pitching.baseOnBalls)} BB\n` +
    `${batTeam.abbreviation} At Bat:   ` +
    `{bold}${batter.person.fullName}{/bold} AVG ${formatStat(batter.seasonStats.batting.avg, 3)}, OBP ${formatStat(batter.seasonStats.batting.obp, 3)}, SLG ${formatStat(batter.seasonStats.batting.slg, 3)}, OPS ${formatStat(batter.seasonStats.batting.ops, 3)}`;
};

const getAdvancedPitchingView = (pitchTeam, pitcher, batTeam, batter) => {
  return `${pitchTeam.abbreviation} Pitching: ` +
    `{bold}${pitcher.person.fullName}{/bold} ERA ${formatStat(pitcher.seasonStats.pitching.era, 2)}, WHIP ${formatStat(pitcher.seasonStats.pitching.whip, 2)}, K/9 ${formatStat(pitcher.seasonStats.pitching.strikeoutsPer9Inn, 1)}, W-L ${formatStat(pitcher.seasonStats.pitching.wins)}-${formatStat(pitcher.seasonStats.pitching.losses)}\n` +
    `${batTeam.abbreviation} At Bat:   ` +
    `{bold}${batter.person.fullName}{/bold} ${formatStat(batter.stats.batting.hits)}-${formatStat(batter.stats.batting.atBats)} today, ${formatStat(batter.seasonStats.batting.rbi)} RBI, ${formatStat(batter.seasonStats.batting.stolenBases)} SB (season)`;
};

const getGameStatsView = (pitchTeam, pitcher, batTeam, batter) => {
  return `${pitchTeam.abbreviation} Pitching: ` +
    `{bold}${pitcher.person.fullName}{/bold} ${formatStat(pitcher.stats.pitching.inningsPitched, 1)} IP, ${formatStat(pitcher.stats.pitching.hits)} H, ${formatStat(pitcher.stats.pitching.earnedRuns)} ER, ${formatStat(pitcher.stats.pitching.strikeOuts)} K, ${formatStat(pitcher.stats.pitching.baseOnBalls)} BB\n` +
    `${batTeam.abbreviation} At Bat:   ` +
    `{bold}${batter.person.fullName}{/bold} ${formatStat(batter.stats.batting.hits)}-${formatStat(batter.stats.batting.atBats)}, ${formatStat(batter.stats.batting.rbi)} RBI, ${formatStat(batter.stats.batting.runs)} R, ${formatStat(batter.stats.batting.strikeOuts)} K, ${formatStat(batter.stats.batting.baseOnBalls)} BB`;
};

const VIEWS = [
  { name: 'Basic', fn: getBasicView },
  { name: 'Advanced Batting', fn: getAdvancedBattingView },
  { name: 'Advanced Pitching', fn: getAdvancedPitchingView },
  { name: 'Game Stats', fn: getGameStatsView },
];

function Matchup() {
  const boxscore = useSelector(selectBoxscore);
  const currentPlay = useSelector(selectCurrentPlay);
  const teams = useSelector(selectTeams);
  const [viewIndex, setViewIndex] = useState(0);

  const pitcherId = currentPlay.matchup?.pitcher?.id;
  const batterId = currentPlay.matchup?.batter?.id;

  const {team: pitchTeam, player: pitcher} = getPlayerStats(boxscore, teams, pitcherId);
  const {team: batTeam, player: batter} = getPlayerStats(boxscore, teams, batterId);

  const nextView = useCallback(() => {
    setViewIndex(prev => (prev + 1) % VIEWS.length);
  }, []);

  const prevView = useCallback(() => {
    setViewIndex(prev => (prev - 1 + VIEWS.length) % VIEWS.length);
  }, []);

  useKey(']', nextView, { key: ']', label: 'Next Stats' });
  useKey('[', prevView, { key: '[', label: 'Prev Stats' });

  const currentView = VIEWS[viewIndex];
  const display = currentView.fn(pitchTeam, pitcher, batTeam, batter);
  const viewIndicator = `{right}{dim}[${currentView.name} ${viewIndex + 1}/${VIEWS.length}]{/}`;

  return (
    <box tags content={display + '\n' + viewIndicator} wrap={false} />
  );
}

export default Matchup;