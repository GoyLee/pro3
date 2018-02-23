import { queryEvent, addEvent } from '../services/api';

export default {
  namespace: 'event',

  state: {
    //record: {}, //从list传给form的记录缓存
    data: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryEvent, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    //add POST后的response会更新state！
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addEvent, payload);
      if (callback) callback();
    },
    //add POST后的response会更新state！
    // *update({ payload, callback }, { call, put }) {
    //   const response = yield call(updateEvent, payload);
    //   if (callback) callback();
    // },
    // *remove({ payload, callback }, { call, put }) {
    //   const response = yield call(removeEvent, payload);
    //   if (callback) callback();
    // },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },

    // setRecord(state, action) {
    //   return {
    //     ...state,
    //     record: action.payload,
    //   };
    // },
  },
};
