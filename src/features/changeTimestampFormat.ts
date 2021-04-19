import _ from 'lodash';
import {DateTime, Interval} from 'luxon';

import {onChirpAdded} from '../services/chirpHandler';
import {makeBTDModule, makeBtdUuidSelector} from '../types/btdCommonTypes';
import {BTDSettings} from '../types/btdSettingsTypes';

export enum BTDTimestampFormats {
  RELATIVE = 'relative',
  CUSTOM = 'custom',
}

const TIMESTAMP_INTERVAL = 1e3 * 8;

function getFinalDateString(
  sourceIsoString: string,
  {timestampFullFormat, timestampShortFormat, fullTimestampAfterDay}: BTDSettings
) {
  const dateObject = DateTime.fromISO(sourceIsoString);
  const now = DateTime.local();
  const fullString = dateObject.toFormat(timestampFullFormat);
  const shortString = dateObject.toFormat(timestampShortFormat);

  if (fullTimestampAfterDay) {
    const intervalToNow = Interval.fromDateTimes(dateObject, now).length('hours');

    return intervalToNow > 24 ? fullString : shortString;
  }

  return shortString;
}

function refreshTimestamps(
  settings: BTDSettings,
  timeElements = document.querySelectorAll('time')
) {
  timeElements.forEach((timeElement) => {
    if (timeElement.closest('.js-tweet-detail.tweet-detail-wrapper')) {
      return;
    }
    const timeString = timeElement.getAttribute('datetime');
    if (!timeString) {
      return;
    }

    const textLikeElement = timeElement.querySelector('a, span');
    const newTextContent = getFinalDateString(timeString, settings);

    if (!textLikeElement) {
      timeElement.textContent = newTextContent;
      return;
    }

    textLikeElement.textContent = newTextContent;
  });
}

function parseSnowFlake(snowFlake: number) {
  // Old snowFlakes (under 10 digits) don't contain any data of date.
  if (snowFlake < 10000000000) return undefined;

  // (val >> 22) + Standard Time
  const unixTime = Math.floor(snowFlake / 4194304) + 1288834974657;
  return new Date(unixTime);
}

export const maybeSetupCustomTimestampFormat = makeBTDModule(({TD, settings, jq}) => {
  const {timestampStyle} = settings;
  if (timestampStyle === BTDTimestampFormats.RELATIVE) {
    return;
  }

  jq(document).one('dataColumnsLoaded', () => {
    // Find the task that changes the timestamp
    const taskIdToRemove = _(TD.controller.scheduler._tasks)
      .entries()
      .filter(([, task]) => {
        // The timestamp task is ran every 30 seconds.
        return task.period === 1e3 * 30;
      })
      .map(([, task]) => {
        return task.id;
      })
      .compact()
      .first();

    // If no id is found, nothing we can do
    if (!taskIdToRemove) {
      return;
    }

    // Otherwise, remove the periodic task
    TD.controller.scheduler.removePeriodicTask(taskIdToRemove);
    refreshTimestamps(settings);
    setInterval(() => refreshTimestamps(settings), TIMESTAMP_INTERVAL);
    onChirpAdded((addedChirp) => {
      const timeElements: NodeListOf<HTMLTimeElement> = document.querySelectorAll(
        `${makeBtdUuidSelector('data-btd-uuid', addedChirp.uuid)} time`
      );
      timeElements.forEach((timeElement) => {
        if (!timeElement.closest('.js-tweet.tweet')) {
          return;
        }

        const tweet = addedChirp.chirp.getMainTweet?.() ?? addedChirp.chirp.targetTweet;
        const date = parseSnowFlake(+tweet!.id);

        if (date === undefined) {
          return;
        }

        timeElement.dateTime = date.toISOString();
      });
      refreshTimestamps(settings, timeElements);
    });
  });
});
