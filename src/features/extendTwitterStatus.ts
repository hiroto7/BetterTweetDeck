import {makeBTDModule} from '../types/btdCommonTypes';
import {TwitterStatus} from '../types/tweetdeckTypes';

export const extendTwitterStatus = makeBTDModule(({TD, settings}) => {
  TD.services.TwitterAction.prototype.OGFromJSON =
    TD.services.TwitterAction.prototype.fromJSONObject;

  TD.services.TwitterAction.prototype.fromJSONObject = function fromJSONObject(...args: any[]) {
    var baseTweet = this.OGFromJSON(...args) as TwitterStatus;

    if (baseTweet.card) {
      if (
        (baseTweet.targetTweet && !baseTweet.targetTweet.card) ||
        (baseTweet.quotedTweet && !baseTweet.quotedTweet.card) ||
        (baseTweet.retweetedStatus && !baseTweet.retweetedStatus.card)
      ) {
        baseTweet.card = undefined;
      } else if (baseTweet.targetTweet && baseTweet.targetTweet.card) {
        baseTweet.card = baseTweet.targetTweet.card;
      }
    } else if (baseTweet.targetTweet && baseTweet.targetTweet.card && baseTweet.isAboutYou()) {
      const urlFromCard = baseTweet.targetTweet.card.url;

      const isUrlInHtml = baseTweet.targetTweet.htmlText.includes(urlFromCard);

      if (!isUrlInHtml) {
        const entityForUrl = baseTweet.targetTweet.entities.urls.find((u) => u.url === urlFromCard);
        if (entityForUrl) {
          baseTweet.targetTweet.htmlText +=
            ' ' +
            TD.util.createUrlAnchor({
              ...entityForUrl,
              isUrlForAttachment: false,
            });
        }
      }
    }

    return baseTweet;
  };
  TD.services.TwitterStatus.prototype.OGFromJSON =
    TD.services.TwitterStatus.prototype.fromJSONObject;

  TD.services.TwitterStatus.prototype.fromJSONObject = function fromJSONObject(blob: any) {
    var baseTweet = this.OGFromJSON(blob) as TwitterStatus;

    baseTweet.possiblySensitive =
      baseTweet.possiblySensitive ||
      baseTweet.entities.media.some(
        (media) =>
          media.ext_sensitive_media_warning?.adult_content ||
          media.ext_sensitive_media_warning?.graphic_violence ||
          media.ext_sensitive_media_warning?.other
      );

    // @ts-expect-error
    baseTweet.conversationControl = blob.conversation_control;
    // @ts-expect-error
    baseTweet.limitedActions = blob.limited_actions;
    // @ts-expect-error
    baseTweet.cannotBeRepliedTo = blob.limited_actions === 'limited_replies';

    return baseTweet;
  };
});
