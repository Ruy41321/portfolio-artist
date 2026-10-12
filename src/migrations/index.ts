import * as migration_20261012_124919_initial from './20261012_124919_initial';
import * as migration_20261012_130147_media_blur_placeholder from './20261012_130147_media_blur_placeholder';

export const migrations = [
  {
    up: migration_20261012_124919_initial.up,
    down: migration_20261012_124919_initial.down,
    name: '20261012_124919_initial',
  },
  {
    up: migration_20261012_130147_media_blur_placeholder.up,
    down: migration_20261012_130147_media_blur_placeholder.down,
    name: '20261012_130147_media_blur_placeholder'
  },
];
