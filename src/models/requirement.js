import { queryDept, queryRequirement, removeRequirement, addRequirement, updateRequirement } from '../services/api';

export default {
  namespace: 'requirement',

  state: {
    record: {}, //从list传给form的记录缓存
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRequirement, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      // eslint-disable-next-line
      //console.log(JSON.stringify(data));
    },
    //add POST后的response会更新state！
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addRequirement, payload);
      if (callback) callback();
    },
    //add POST后的response会更新state！
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateRequirement, payload);
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRequirement, payload);
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },

    setRecord(state, action) {
      return {
        ...state,
        record: action.payload,
      };
    },
  },
};
