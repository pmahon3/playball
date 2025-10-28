import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import Count from './Count.js';
import Bases from './Bases.js';
import LineScore from './LineScore.js';
import Matchup from './Matchup.js';
import AtBat from './AtBat.js';
import AllPlays from './AllPlays.js';
import InningDisplay from './InningDisplay.js';

import { get } from '../config.js';
import { selectGameStatus, selectLineScore, selectTeams, selectCurrentPlay, selectBoxscore } from '../features/games.js';
import { resetTitle, setTitle } from '../screen.js';
import useKey from '../hooks/useKey.js';

function LiveGame()  {
  const gameStatus = useSelector(selectGameStatus);
  const linescore = useSelector(selectLineScore);
  const teams = useSelector(selectTeams);
  const currentPlay = useSelector(selectCurrentPlay);
  const boxscore = useSelector(selectBoxscore);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const toggleAdvancedStats = useCallback(() => {
    setShowAdvancedStats(prev => !prev);
  }, []);

  useEffect(() => {
    if (get('title')) {
      const homeRuns = linescore.teams['home'].runs;
      const awayRuns = linescore.teams['away'].runs;
      const home = teams.home.abbreviation;
      const away = teams.away.abbreviation;

      let inning = '';
      if (gameStatus.detailedState === 'Postponed') {
        inning = 'PPD';
      } else if (gameStatus.detailedState === 'Cancelled') {
        inning = 'C';
      } else if (gameStatus.detailedState === 'Final') {
        inning = 'F';
      } else if (gameStatus.detailedState !== 'Pre-Game' && gameStatus.detailedState !== 'Warmup') {
        const currentInning = linescore.currentInning;
        if (currentInning) {
          const upDown = linescore.isTopInning ? '▲' : '▼';
          inning = ` ${upDown} ${currentInning}`;
        }
      }

      setTitle(`${away} ${awayRuns} - ${home} ${homeRuns}${inning}`);

      return () => {
        resetTitle();
      };
    }
  }, [gameStatus, get, linescore, resetTitle, setTitle, teams]);

  useKey('a', toggleAdvancedStats, { key: 'a', label: showAdvancedStats ? 'Close Stats' : 'Advanced Stats' });

  // Helper to get player stats from boxscore
  const getPlayerStats = (id) => {
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

  const pitcherId = currentPlay?.matchup?.pitcher?.id;
  const batterId = currentPlay?.matchup?.batter?.id;

  return (
    <element>
      <element top={0} left={1} width='100%-1' height={3}>
        <element left={0} width={2}>
          <InningDisplay />
        </element>
        <element left={5} width='25%-5'>
          <Count />
        </element>
        <element left='25%+1' width='25%'>
          <Bases />
        </element>
        <element left='50%+2' width='50%-2'>
          <LineScore />
        </element>
      </element>
      <line orientation='horizontal' type='line' top={3} width='100%' />
      <element top={4} left={1}>
        <element width='50%-1'>
          <element top={0} height={2}>
            <Matchup />
          </element>
          <element top={3}>
            <AtBat />
          </element>
        </element>
        <line orientation='vertical' type='line' left='50%' />
        <element left='50%+2' width='50%-2'>
          <AllPlays />
        </element>
      </element>
      {showAdvancedStats && pitcherId && batterId && (() => {
        const {team: pitchTeam, player: pitcher} = getPlayerStats(pitcherId);
        const {team: batTeam, player: batter} = getPlayerStats(batterId);

        const advancedContent =
          '{bold}{cyan-fg}Advanced Stats{/}  (Press \'a\' to close)\n\n' +
          `{bold}PITCHER: ${pitcher.person.fullName} (${pitchTeam.abbreviation}){/}\n` +
          'Season:\n' +
          `  | ERA  ${formatStat(pitcher.seasonStats.pitching.era, 2).padStart(5)} | WHIP ${formatStat(pitcher.seasonStats.pitching.whip, 2).padStart(5)} | K/9  ${formatStat(pitcher.seasonStats.pitching.strikeoutsPer9Inn, 1).padStart(5)} | W-L  ${(formatStat(pitcher.seasonStats.pitching.wins) + '-' + formatStat(pitcher.seasonStats.pitching.losses)).padStart(5)} |\n` +
          'Today:\n' +
          `  | IP   ${formatStat(pitcher.stats.pitching.inningsPitched, 1).padStart(5)} | H    ${formatStat(pitcher.stats.pitching.hits).toString().padStart(5)} | ER   ${formatStat(pitcher.stats.pitching.earnedRuns).toString().padStart(5)} |\n` +
          `  | K    ${formatStat(pitcher.stats.pitching.strikeOuts).toString().padStart(5)} | BB   ${formatStat(pitcher.stats.pitching.baseOnBalls).toString().padStart(5)} | P    ${formatStat(pitcher.stats.pitching.pitchesThrown).toString().padStart(5)} |\n\n` +
          `{bold}BATTER: ${batter.person.fullName} (${batTeam.abbreviation}){/}\n` +
          'Season:\n' +
          `  | AVG  ${formatStat(batter.seasonStats.batting.avg, 3).padStart(5)} | OBP  ${formatStat(batter.seasonStats.batting.obp, 3).padStart(5)} | SLG  ${formatStat(batter.seasonStats.batting.slg, 3).padStart(5)} | OPS  ${formatStat(batter.seasonStats.batting.ops, 3).padStart(5)} |\n` +
          `  | HR   ${formatStat(batter.seasonStats.batting.homeRuns).toString().padStart(5)} | RBI  ${formatStat(batter.seasonStats.batting.rbi).toString().padStart(5)} | SB   ${formatStat(batter.seasonStats.batting.stolenBases).toString().padStart(5)} |\n` +
          'Today:\n' +
          `  | H-AB ${(formatStat(batter.stats.batting.hits) + '-' + formatStat(batter.stats.batting.atBats)).padStart(5)} | RBI  ${formatStat(batter.stats.batting.rbi).toString().padStart(5)} | R    ${formatStat(batter.stats.batting.runs).toString().padStart(5)} |\n` +
          `  | K    ${formatStat(batter.stats.batting.strikeOuts).toString().padStart(5)} | BB   ${formatStat(batter.stats.batting.baseOnBalls).toString().padStart(5)} |\n`;

        return (
          <box
            top="center"
            left="center"
            width="80%"
            height="60%"
            tags
            border={{type: 'line'}}
            style={{
              border: {fg: 'cyan'},
              focus: {border: {fg: 'cyan'}}
            }}
            content={advancedContent}
          />
        );
      })()}
    </element>
  );
}

export default LiveGame;