import { Analytics } from '@segment/analytics-node';
import { CommonProps } from './types.js';
import pkg from './pkg.js';
import { log } from './log.js';
import { apiKeyExists } from './keyStorage.js';

const SEGMENT_WRITE_KEY = 'YOUR_SEGMENT_WRITE_KEY';

let analytics: Analytics | null = null;

export const initAnalytics = () => {
  if (analytics) return;
  analytics = new Analytics({ writeKey: SEGMENT_WRITE_KEY });
  log.debug('Initialized CLI analytics');
};

export const sendError = (error: Error) => {
  if (!analytics) return;
  analytics.track({
    event: 'Error',
    anonymousId: 'anonymous',
    properties: {
      error: error.message,
      stack: error.stack,
    },
  });
};

export const trackEvent = (
  event: string,
  properties: Record<string, any> = {},
) => {
  if (!analytics) return;
  analytics.track({
    event,
    anonymousId: 'anonymous',
    properties,
  });
};

export const closeAnalytics = async () => {
  if (analytics) {
    await analytics.closeAndFlush();
    analytics = null;
  }
};

export const getAnalyticsEventProperties = (props: CommonProps) => {
  return {
    version: pkg.version,
    nodeVersion: process.version,
    platform: process.platform,
    ...props,
  };
};

export const analyticsMiddleware = () => {
  try {
    if (!apiKeyExists()) {
      log.debug('No API key found, skipping analytics');
      return;
    }
    initAnalytics();
  } catch (error) {
    log.debug('Error in analytics middleware', error);
  }
};
