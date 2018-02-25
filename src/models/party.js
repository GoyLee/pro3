import { queryUserList, queryUserDept, queryDeptTree, queryTagTree, queryParty, removeParty, addParty, updateParty } from '../services/api';

export default {
  namespace: 'party',

  state: {
    record: {}, //在list传给form的记录缓存
    user: '', //当前表单的填写人
    userDept: {}, //当前表单填写人所属的部门
    userList: [], //根据user模糊查询出的list, 作为select‘s options

    dept: {
      list: [], // a tree list
      currentDept: '',
    },
    tag: {
      list: [], // a tree list
      currentTag: '',
    },
    data: {
      list: [], // a pure list
      pagination: {},
    },
  },

  effects: {
    *fetchUserList({ payload }, { call, put }) { //获取模糊查找员工
      const response = yield call(queryUserList, payload);
      yield put({
        type: 'saveUserList',
        payload: response,
      });
    },
    *fetchUserDept({ payload }, { call, put }) { //获取员工的部门
      const response = yield call(queryUserDept, payload);
      yield put({
        type: 'saveUserDept',
        payload: response,
      });
    },
    
    *fetchDeptTree({ payload }, { call, put }) { //获取部门树tree，not a plain list.
      const response = yield call(queryDeptTree, payload);
      yield put({
        type: 'saveDept',
        payload: response,
      });
    },
    *fetchTagTree({ payload }, { call, put }) { //获取部门树tree，not a plain list.
      const response = yield call(queryTagTree, payload);
      yield put({
        type: 'saveTag',
        payload: response,
      });
    },
    
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryParty, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    //add POST后的response会更新state！
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addParty, payload);
      if (callback) callback();
    },
    //add POST后的response会更新state！
    *update({ payload, callback }, { call, put }) {
      const response = yield call(updateParty, payload);
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeParty, payload);
      if (callback) callback();
    },
  },

  reducers: {
    saveUserList(state, action) {
      return {
        ...state,
        userList: action.payload,
      };
    },
    saveUserDept(state, action) {
      return {
        ...state,
        userDept: action.payload,
      };
    },
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    setUser(state, action) {
      return {
        ...state,
        user: action.payload,
      };
    },
    saveDept(state, action) {
      return {
        ...state,
        dept: action.payload,
      };
    },
    saveTag(state, action) {
      return {
        ...state,
        tag: action.payload,
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
