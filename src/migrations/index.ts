import * as migration_20261010_181226_init from './20261010_181226_init';

export const migrations = [
  {
    up: migration_20261010_181226_init.up,
    down: migration_20261010_181226_init.down,
    name: '20261010_181226_init'
  },
];
