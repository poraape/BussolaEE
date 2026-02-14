import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const contacts = JSON.parse(fs.readFileSync(new URL('../data/rede.json', import.meta.url), 'utf8'));

test('rede.json contém coordenadas válidas e campos obrigatórios para o mapa', () => {
  contacts.forEach((contact) => {
    assert.equal(typeof contact.name, 'string');
    assert.equal(typeof contact.type, 'string');
    assert.equal(typeof contact.phone, 'string');
    assert.equal(typeof contact.hours, 'string');
    assert.equal(typeof contact.notes, 'string');
    assert.equal(typeof contact.lat, 'number');
    assert.equal(typeof contact.lng, 'number');
  });
});

test('rede possui tipos filtráveis esperados', () => {
  const types = new Set(contacts.map((contact) => contact.type));
  ['Saúde', 'Assistência', 'Justiça'].forEach((expected) => assert.equal(types.has(expected), true));
});
