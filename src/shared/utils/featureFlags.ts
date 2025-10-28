import { businessConfig } from '../../config/business.config';

export type FeatureFlag =
  | 'stockDesigns'
  | 'customOrders'
  | 'quoteRequests'
  | 'multiplePaymentGateways';

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return businessConfig.features[feature] || false;
};

export const getEnabledFeatures = (): FeatureFlag[] => {
  return Object.entries(businessConfig.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature as FeatureFlag);
};

export const useFeatureFlag = (feature: FeatureFlag): boolean => {
  return isFeatureEnabled(feature);
};

export const withFeatureFlag = <T extends (...args: any[]) => any>(
  feature: FeatureFlag,
  fn: T,
  fallback?: T
): T => {
  return ((...args: any[]) => {
    if (isFeatureEnabled(feature)) {
      return fn(...args);
    }
    return fallback ? fallback(...args) : null;
  }) as T;
};
