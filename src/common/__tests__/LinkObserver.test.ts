import Project from '../data/Project';
import Link from '../data/Link';
import MutableField from '../data/MutableField';

const project = new Project();

function mocks(link: Link): [jest.Mock, jest.Mock, jest.Mock] {
  const add = jest.fn();
  const remove = jest.fn();
  const change = jest.fn();

  link.observe()
    .on('fieldAdded', add)
    .on('fieldRemoved', remove)
    .on('fieldChanged', change);

  return [add, remove, change];
}

let counter = 1;
function newField(): MutableField {
  return new MutableField(`field${counter++}`);
}

describe('can listen for field changes on a single field', () => {
  test('additions', () => {
    const obj = project.makeObject('test');
    const add = mocks(obj.getLink('test'))[0];

    obj.addOwnField('test', newField());
    expect(add).toHaveBeenCalledTimes(1);

    obj.addOwnField('test.scope.1', newField());
    expect(add).toHaveBeenCalledTimes(1);
  });

  test('removals', () => {
    const obj = project.makeObject('test');
    const remove = mocks(obj.getLink('test'))[1];

    obj.addOwnField('test', newField());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.addOwnField('test.scope.1', newField());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test');
    expect(remove).toHaveBeenCalledTimes(1);
  });

  test('changes', () => {
    const parent = project.makeObject('test');
    const obj = project.makeObject('test', parent);
    const change = mocks(obj.getLink('test'))[2];

    obj.addOwnField('test', newField());
    parent.addOwnField('test', newField());
    obj.addOwnField('test.scope.1', newField());
    expect(change).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test');
    expect(change).toHaveBeenCalledTimes(1);

    obj.addOwnField('test', newField());
    expect(change).toHaveBeenCalledTimes(2);

    obj.addOwnField('test', newField());
    expect(change).toHaveBeenCalledTimes(3);
  });
});

describe('can listen for field changes on multiple fields', () => {
  test('additions', () => {
    const obj = project.makeObject('test');
    const add = mocks(obj.getLink('test.*'))[0];

    obj.addOwnField('test', newField());
    expect(add).toHaveBeenCalledTimes(0);

    obj.addOwnField('test.1', newField());
    expect(add).toHaveBeenCalledTimes(1);

    obj.addOwnField('test.scope.1', newField());
    expect(add).toHaveBeenCalledTimes(2);
  });

  test('removals', () => {
    const obj = project.makeObject('test');
    const remove = mocks(obj.getLink('test.*'))[1];

    obj.addOwnField('test', newField());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.addOwnField('test.1', newField());
    obj.addOwnField('test.scope.1', newField());
    expect(remove).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test');
    expect(remove).toHaveBeenCalledTimes(0);

    obj.removeOwnField('test.scope.1');
    expect(remove).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test.1');
    expect(remove).toHaveBeenCalledTimes(2);
  });

  test('changes', () => {
    const parent = project.makeObject('test');
    const obj = project.makeObject('test', parent);
    const change = mocks(obj.getLink('test.*'))[2];

    obj.addOwnField('test', newField());
    obj.addOwnField('test.1', newField());
    parent.addOwnField('test.1', newField());
    expect(change).toHaveBeenCalledTimes(0);

    parent.addOwnField('test.scope.1', newField());
    obj.addOwnField('test.scope.1', newField());
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test');
    expect(change).toHaveBeenCalledTimes(1);

    obj.removeOwnField('test.1');
    expect(change).toHaveBeenCalledTimes(2);

    obj.addOwnField('test.scope.1', newField());
    expect(change).toHaveBeenCalledTimes(3);
  });
});