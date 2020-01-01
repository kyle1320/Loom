import Project from '../data/Project';

test('can be instantiated', () => {
  new Project();
});

test('can be serialized and deserialized', () => {
  const proj = new Project();
  const serial = proj.serialize();
  Project.deserialize(serial, []);
});

// TODO: test adding extensions, etc.