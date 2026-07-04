-- Normalise the "On & Off" archetype id to the canonical 'onoff'.
-- The admin Community Voices / We Remember screens previously wrote 'onandoff',
-- while the public RedFlag app, ArchetypesTab and everything else use 'onoff'.
-- This migrates any stray rows so labels resolve and public queries match.

update archetype_voices   set archetype_id = 'onoff' where archetype_id = 'onandoff';
update archetype_memorial set archetype_id = 'onoff' where archetype_id = 'onandoff';
update archetype_content  set archetype_id = 'onoff' where archetype_id = 'onandoff';
