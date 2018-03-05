import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Cascader, TreeSelect, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

//CreateForm = Form.create()((props) => {
@connect(({party, loading}) => ({
  record: party.record,
  deptTree: party.dept.list,
  tagTree: party.tag.list,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    //props.onChange(changedFields);
  },
  mapPropsToFields(props) { //绑定字段; update时使用，用于传递原有record的字段
    if(props.record._id) { //不空，是Update。Update必须要绑定values和fields。注意判断record对象是否为空对象的方法！不能用record==={}！
      return {
        code: Form.createFormField({ ...props.record.code, value: props.record.code,}),
        username: Form.createFormField({ ...props.record.username, value: props.record.username,}),
        password: Form.createFormField({ ...props.record.password, value: props.record.password,}),
        mobile: Form.createFormField({ ...props.record.mobile, value: props.record.mobile,}),
        pid: Form.createFormField({ ...props.record.pid, value: props.record.pid,}),
        tags: Form.createFormField({ ...props.record.tags, value: props.record.tags,}),
        type: Form.createFormField({ ...props.record.type, value: props.record.type,}),
        status: Form.createFormField({ ...props.record.status, value: props.record.status,}),
      };
    }
  },
  onValuesChange(_, values) {
    // console.log(values);
  },
})
export default class PartyForm extends PureComponent {
  state = {
    deptTreeSelectValue: undefined,
    tagTreeSelectValue: [],
  };

  onDeptChange = (value) => {
    this.setState({deptTreeSelectValue: value});
  }
  onTagChange = (value) => {
    this.setState({tagTreeSelectValue: value});
  }

  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { record, handleModalVisible } = this.props;
      fieldsValue = { 
        ...fieldsValue, //装填原有字段
        updatedAt: Date.now(), //缺省应有的字段：更新时间。必须有，避免上一条记录的遗留痕迹
        __v: (record.__v ? record.__v+1 : 1), //缺省应有的字段：更新次数。
      }
    //   this.props.dispatch({
    //     type: 'party/setRecord',
    //     payload: fieldsValue, // {
    //   });
      if(record._id) { //Update exist record
        this.props.dispatch({
          type: 'party/update',
          payload: {...record, ...fieldsValue}, 
        }); 
      } else { //Create a new record
        this.props.dispatch({
          type: 'party/add',
          payload: fieldsValue, 
        });
      };
      message.success('添加成功:' + JSON.stringify(fieldsValue));
      handleModalVisible(false, true);
    });
  };

  render(){
    const { record, tagTree, deptTree, modalVisible, form, handleAdd, handleModalVisible } = this.props;
    return (
      <Modal title="新建用户" visible={modalVisible} onOk={this.okHandle} onCancel={() => handleModalVisible(false, false)}>
        {/* <pre className="language-bash"> {JSON.stringify(record, null, 2)} </pre> */}
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="工号">
          {form.getFieldDecorator('code', {
            initialValue: '',
            rules: [{ required: true, message: 'Please input user\'s code...' }],
          })(
            <Input placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="名称">
          {form.getFieldDecorator('username', {
            initialValue: '',
            rules: [{ required: true, message: 'Please input user\'s name...' }],
          })(
            <Input placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
          {form.getFieldDecorator('password', {
            rules: [{ required: false, message: 'Please input the password...' }],
          })(
            <Input placeholder="请输入"  type='password' />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号">
          {form.getFieldDecorator('mobile', {
            rules: [{ required: false, message: 'Please input user\'s mobile...' }],
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>      
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="部门">
          {form.getFieldDecorator('pid', {
            rules: [{ required: false, message: 'Please input the super...' }],
          })(
            <Cascader options={deptTree} placeholder="Please select" showSearch changeOnSelect expandTrigger="hover" style={{ width: '100%' }}/>,
            // <TreeSelect allowClear treeNodeFilterProp='label' value={this.state.deptTreeSelectValue} treeDefaultExpandAll treeData={deptTree} showSearch searchPlaceholder='搜索部门' onChange={this.onDeptChange} style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="标签（项目）">
          {form.getFieldDecorator('tags', {
            rules: [{ required: false, message: 'Please input the tags...' }],
          })(
            // <Cascader options={tagTree} placeholder="Please select" showSearch changeOnSelect expandTrigger="hover" style={{ width: '100%' }}/>,
            // Tags需可多选，但antd cascader还不支持多选！还需用TreeSelect。
            <TreeSelect treeCheckable showCheckedStrategy='SHOW_PARENT' allowClear  multiple treeNodeFilterProp='label' value={this.state.tagTreeSelectValue} treeDefaultExpandAll treeData={tagTree} showSearch searchPlaceholder='搜索标签' onChange={this.onTagChange} style={{ width: '100%' }} />
          )}
        </FormItem>  
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类别">
          {form.getFieldDecorator('type',{initialValue: '员工'})( //~defaultValue="部门"
            <Select  style={{ width: '100%' }}>
              <Option value="员工">员工</Option>
              <Option value="部门">部门</Option>
              <Option value="标签">标签</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="状态">
          {form.getFieldDecorator('status',{initialValue: '正常'})( //~defaultValue="部门"
            <Select  style={{ width: '100%' }}>
              <Option value="正常">正常</Option>
              <Option value="离职">离职</Option>
              <Option value="兼职">兼职</Option>
              <Option value="停职">停职</Option>
            </Select>
          )}
        </FormItem>
      </Modal>
    ); //options={options} onChange={onChange} 
  }
}
