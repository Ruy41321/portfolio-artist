import * as migration_20261012_124919_initial from './20261012_124919_initial'

export const migrations = [
  {
    up: migration_20261012_124919_initial.up,
    down: migration_20261012_124919_initial.down,
    name: '20261012_124919_initial',
  },
]
