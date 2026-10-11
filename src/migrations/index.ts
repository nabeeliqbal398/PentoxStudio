import * as migration_20261010_181226_init from './20261010_181226_init';
import * as migration_20261010_184619_cms_model from './20261010_184619_cms_model';
import * as migration_20261010_184700_knowledge_chunks_embedding from './20261010_184700_knowledge_chunks_embedding';
import * as migration_20261010_232638_phase4_pages_labels_cta from './20261010_232638_phase4_pages_labels_cta';

export const migrations = [
  {
    up: migration_20261010_181226_init.up,
    down: migration_20261010_181226_init.down,
    name: '20261010_181226_init',
  },
  {
    up: migration_20261010_184619_cms_model.up,
    down: migration_20261010_184619_cms_model.down,
    name: '20261010_184619_cms_model',
  },
  {
    up: migration_20261010_184700_knowledge_chunks_embedding.up,
    down: migration_20261010_184700_knowledge_chunks_embedding.down,
    name: '20261010_184700_knowledge_chunks_embedding',
  },
  {
    up: migration_20261010_232638_phase4_pages_labels_cta.up,
    down: migration_20261010_232638_phase4_pages_labels_cta.down,
    name: '20261010_232638_phase4_pages_labels_cta'
  },
];
