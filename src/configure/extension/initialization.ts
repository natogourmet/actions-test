import { getQueryParams } from '@/utils/browser';
import { ConfigureInitParams } from '../ui/configureui-types';

/**
 * Adds the required QueryParams for configuration properties that cannot be set any other way.
 */
export function addRequiredQueryParams(params: ConfigureInitParams): void {
  let changed = false;
  const queryParams = getQueryParams();

  // FIXME: Workaround for working on dev.
  // WebGL in ConfigureId read this params only from url.
  // Remove on Production.

  // WebGL Environment
  if (!queryParams.get('webglEnv') && params.webglEnvironment) {
    queryParams.set('webglEnv', params.webglEnvironment);
    changed = true;
  }

  if (changed) history.replaceState(null, '', '?' + queryParams.toString());
}
