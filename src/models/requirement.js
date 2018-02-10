import { queryDept, queryRequirement, removeRequirement, addRequirement, updateRequirement } from '../services/api';

export default {
  namespace: 'requirement',

  state: {
    demander: '',
    record: {}, //在list传给form的记录缓存
    //recordNew: true,
    dept: {
      list: [],
      currentDept: '',
    },
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetchDept({ payload }, { call, put }) { //获取部门树tree，not a plain list.
      const response = yield call(queryDept, payload);
      yield put({
        type: 'saveDept',
        payload: response,
      });
      // eslint-disable-next-line
      //console.log(JSON.stringify(dept));
    },
    
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
    saveDept(state, action) {
      return {
        ...state,
        dept: action.payload,
      };
    },
    setDemander(state, action) {
      return {
        ...state,
        demander: action.payload,
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
