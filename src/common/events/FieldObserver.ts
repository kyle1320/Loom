import EventEmitter from '../util/EventEmitter';

// FieldObservers watch for changes to the value of a particular field.
// These can either be recursive or not, and should emit an 'update' event
// whenever the immediate or recursive content of a field changes.
export default abstract class FieldObserver
  extends EventEmitter<{ update: void }> {

  public abstract destroy(): void;
}