import { Dispatcher } from 'flux';
import { EventEmitter } from 'events';
import AccountStore from './accountStore';
import GaugeStore from './gaugeStore';

const dispatcher = new Dispatcher();
const emitter = new EventEmitter();

const accountStore = new AccountStore(dispatcher, emitter);
const gaugeStore = new GaugeStore(dispatcher, emitter);

export default {
  accountStore,
  gaugeStore,
  dispatcher,
  emitter,
};
