import * as migration_20261010_181226_init from './20261010_181226_init';
import * as migration_20261010_184619_cms_model from './20261010_184619_cms_model';
import * as migration_20261010_184700_knowledge_chunks_embedding from './20261010_184700_knowledge_chunks_embedding';
import * as migration_20261010_232638_phase4_pages_labels_cta from './20261010_232638_phase4_pages_labels_cta';
import * as migration_20261011_000726_phase5_lead_engine from './20261011_000726_phase5_lead_engine';
import * as migration_20261011_013446_phase6_portfolio from './20261011_013446_phase6_portfolio';
import * as migration_20261011_073417_phase7_blog from './20261011_073417_phase7_blog';
import * as migration_20261011_081742_phase8_newsletter from './20261011_081742_phase8_newsletter';
import * as migration_20261011_081920_phase8_subscriber_source_home from './20261011_081920_phase8_subscriber_source_home';
import * as migration_20261011_085408_phase9_chatbot from './20261011_085408_phase9_chatbot';

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
    name: '20261010_232638_phase4_pages_labels_cta',
  },
  {
    up: migration_20261011_000726_phase5_lead_engine.up,
    down: migration_20261011_000726_phase5_lead_engine.down,
    name: '20261011_000726_phase5_lead_engine',
  },
  {
    up: migration_20261011_013446_phase6_portfolio.up,
    down: migration_20261011_013446_phase6_portfolio.down,
    name: '20261011_013446_phase6_portfolio',
  },
  {
    up: migration_20261011_073417_phase7_blog.up,
    down: migration_20261011_073417_phase7_blog.down,
    name: '20261011_073417_phase7_blog',
  },
  {
    up: migration_20261011_081742_phase8_newsletter.up,
    down: migration_20261011_081742_phase8_newsletter.down,
    name: '20261011_081742_phase8_newsletter',
  },
  {
    up: migration_20261011_081920_phase8_subscriber_source_home.up,
    down: migration_20261011_081920_phase8_subscriber_source_home.down,
    name: '20261011_081920_phase8_subscriber_source_home',
  },
  {
    up: migration_20261011_085408_phase9_chatbot.up,
    down: migration_20261011_085408_phase9_chatbot.down,
    name: '20261011_085408_phase9_chatbot'
  },
];
