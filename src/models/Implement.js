import { queryImplement, queryOnesImplement, addImplement, updateImplement, changeReqState } from '../services/api';

export default {
  namespace: 'implement',
  state: {
    record: {}, //从list传给form的记录缓存
    reqList: [], //某一个实现所支持的需求列表
    // type: '', //计划、实际
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchOne({ payload }, { call, put }) {
      const response = yield call(queryOneImplement, payload);
      yield put({
        type: 'saveOne',
        payload: response,
      });
    },

    *fetch({ payload }, { call, put }) {
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
    saveOne(state, action) {
      return {
        ...state,
        record: action.payload,
      };
    },
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
    setReqList(state, action) {
      return {
        ...state,
        reqList: action.payload,
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
