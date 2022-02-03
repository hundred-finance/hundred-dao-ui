import AccountStore from './accountStore';
import GaugeStore from './gaugeStore';

import { Dispatcher } from 'flux';
import { EventEmitter } from 'events';

const dispatcher = new Dispatcher();
const emitter = new EventEmitter();

const accountStore = new AccountStore(dispatcher, emitter);
const gaugeStore = new GaugeStore(dispatcher, emitter);

export default {
  accountStore: accountStore,
  gaugeStore: gaugeStore,
  dispatcher: dispatcher,
  emitter: emitter,
};
