import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}
//Event=============================================================================
export async function queryEvent(params) {
  //alert(stringify(params));
  return request(`/api/event?${stringify(params)}`);
}
export async function addEvent(params) {
  return request('/api/event', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
//Party=============================================================================
export async function queryUserList(params) {
  return request(`/api/userlist?${stringify(params)}`);
}
export async function queryUserDept(params) {
  return request(`/api/userdept?${stringify(params)}`);
}
export async function queryDeptTree(params) {
  return request(`/api/depttree?${stringify(params)}`);
}
export async function queryTagTree(params) {
  return request(`/api/tagtree?${stringify(params)}`);
}
export async function queryParty(params) {
  //alert(stringify(params));
  return request(`/api/party?${stringify(params)}`);
}
export async function removeParty(params) {
  return request('/api/party', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}
export async function addParty(params) {
  return request('/api/party', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updateParty(params) {
  return request('/api/party', {
    method: 'POST',
    body: {
      ...params,
      method: 'update',
    },
  });
}
//Requirement========================================================
export async function queryRequirement(params) {
  //alert(stringify(params));
  return request(`/api/requirement?${stringify(params)}`);
}
export async function removeRequirement(params) {
  return request('/api/requirement', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}
export async function addRequirement(params) {
  return request('/api/requirement', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
export async function updateRequirement(params) {
  return request('/api/requirement', {
    method: 'POST',
    body: {
      ...params,
      method: 'update',
    },
  });
}
//====================================================================

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function accountLogin(params) {
  return request('/api/login', {
    method: 'POST',
    body: params,
  });
}

export async function accountLogout(params) {
  return request('/api/logout', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}
