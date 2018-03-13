import { queryImplement, addImplement, updateImplement, changeReqState } from '../services/api';

export default {
  namespace: 'implement',
  state: {
    record: {}, //从list传给form的记录缓存
    // type: '', //计划、实际
    // data: {
    //   list: [],
    //   pagination: {},
    // },
  },

  effects: {
    *fetchOne({ payload }, { call, put }) {
      const response = yield call(queryImplement, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    //add POST后的response会更新state！
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addImplement, payload);
      if (callback) callback();
    },
    //add POST后的response会更新state！
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateImplement, payload);
      if (callback) callback();
    },
    // *action({ payload, callback }, { call, put }) {
    //   const response = yield call(changeReqState, payload);
    //   if (callback) callback();
    // },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        record: action.payload,
      };
    },

    setRecord(state, action) {
      return {
        ...state,
        record: action.payload,
      };
    },
    // setType(state, action) {
    //   return {
    //     ...state,
    //     type: action.payload,
    //   };
    // },
  },
};
