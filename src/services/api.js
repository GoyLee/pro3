import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryDept(params) {
  return request(`/api/dept?${stringify(params)}`);
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

export async function fakeAccountLogin(params) {
  return request('api/login', {
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
