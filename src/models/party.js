import { queryDept, queryParty, removeParty, addParty, updateParty } from '../services/api';

export default {
  namespace: 'party',

  state: {
    record: {},
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
      const response = yield call(queryParty, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      // eslint-disable-next-line
      //console.log(JSON.stringify(data));
    },
    //add POST后的response会更新state！
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addParty, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    //add POST后的response会更新state！
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateParty, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeParty, payload);
      yield put({
        type: 'save',
        payload: response,
      });
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
    setRecord(state, action) {
      return {
        ...state,
        record: action.payload,
      };
    },
  },
};
