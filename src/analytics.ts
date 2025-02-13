import { readFileSync } from 'node:fs';
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
    try {
      const credentials = JSON.parse(
        readFileSync('/home/user/.config/neonctl/credentials.json', 'utf-8'),
      );
      initAnalytics();
      if (analytics) {
        analytics.identify({
          userId: credentials.user_id,
          traits: {
            email: credentials.email,
          },
        });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        log.debug('Failed to read credentials file', error);
      }
    }
  } catch (error) {
    log.debug('Error in analytics middleware', error);
  }
};
