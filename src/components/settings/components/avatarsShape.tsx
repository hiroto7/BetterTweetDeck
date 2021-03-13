import {css, cx} from '@emotion/css';
import React, {Fragment} from 'react';

import {BTDAvatarShapes} from '../../../features/changeAvatarShape';
import {getTransString, Trans} from '../../trans';
import {BaseSettingsProps} from '../settingsTypes';
import {SettingsRow, SettingsRowContent, SettingsRowTitle} from './settingsRow';

const avatarChoiceStyle = css`
  display: grid;
  grid-template-columns: auto 10px auto;
  grid-template-areas: 'shape . text';
  padding: 12px 14px;
  background: transparent;
  border-radius: 6px;
  color: var(--settings-modal-text);
  border: 2px solid var(--settings-modal-separator);

  input:checked + & {
    border-color: var(--twitter-blue);
  }
`;

const avatarChoiceStyleLabel = css`
  grid-area: text;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const avatarChoiceStyleShapeWrapper = css`
  grid-area: shape;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const avatarChoiceStyleShape = css`
  display: inline-block;
  background: var(--twitter-blue);
  width: 25px;
  height: 25px;

  &.square {
    border-radius: 4px;
  }

  &.circle {
    border-radius: 50%;
  }
`;

const avatarShapesWrapperStyle = css`
  display: grid;
  grid-auto-columns: auto;
  grid-column-gap: 20px;
  grid-auto-flow: column;
`;

interface AvatarsShapeProps extends BaseSettingsProps<'avatarsShape'> {}

export function AvatarsShape(props: AvatarsShapeProps) {
  return (
    <SettingsRow
      className={css`
        input {
          display: none;
        }
      `}>
      <SettingsRowTitle>
        <Trans id="settings_avatar_shape" />
      </SettingsRowTitle>
      <SettingsRowContent className={avatarShapesWrapperStyle}>
        {[
          {
            value: BTDAvatarShapes.SQUARE,
            name: getTransString('settings_avatar_square'),
          },
          {
            value: BTDAvatarShapes.CIRCLE,
            name: getTransString('settings_avatar_circle'),
          },
        ].map(({value, name}) => {
          return (
            <Fragment key={value}>
              <input
                type="radio"
                id={value}
                value={value}
                name="avatarShape"
                defaultChecked={value === props.initialValue}
                onChange={() => props.onChange(value)}
              />
              <label htmlFor={value} className={avatarChoiceStyle}>
                <span className={avatarChoiceStyleShapeWrapper}>
                  <span className={cx(avatarChoiceStyleShape, value)}></span>
                </span>
                <span className={avatarChoiceStyleLabel}>{name}</span>
              </label>
            </Fragment>
          );
        })}
      </SettingsRowContent>
    </SettingsRow>
  );
}
