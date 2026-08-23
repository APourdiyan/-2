import React from 'react';
import { MapView, MapViewProps } from './MapView';

export interface FullMapViewProps extends MapViewProps {}

/**
 * Re-export and wrapper around MapView for backward compatibility
 */
export const FullMapView: React.FC<FullMapViewProps> = (props) => {
  return <MapView {...props} />;
};

export default FullMapView;
