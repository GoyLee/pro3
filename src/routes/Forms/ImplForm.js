import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { TreeSelect, Row, Col, Card, Form, Input, Select, Icon, 
  Radio, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
  //import { toTreeData } from '../../utils/utils';
  
  //import styles from './TableList.less';
  
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const { Header, Content, Footer, Sider } = Layout;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
//const TreeNode = Tree.TreeNode;

//CreateForm = Form.create()((props) => {
@connect(({implement, party, user}) => ({
  record: implement.record,
  tagTree: party.tag.list,
  currentUser: user.currentUser.name,
  loading: loading.models.event,
}))
@Form.create({
  mapPropsToFields(props) { //绑定字段;
    //if(props.record._id) { //不空，是Update。要绑定values和fields。注意判断record对象是否为空对象的方法！不能用record==={}！
      return {
        //每个form.getFieldDecorator的字段都需map
        //department: Form.createFormField({ ...props.record.department, value: props.record.department,}),
        reqname: Form.createFormField({ ...props.record.name, value: props.record.reqname,}),
        // program: Form.createFormField({ ...props.record.program, value: props.record.program,}),
        tags: Form.createFormField({ ...props.record.tags, value: props.record.tags,}),
        type: Form.createFormField({ ...props.record.type, value: props.record.type,}),
        //demander: Form.createFormField({ ...props.record.demander, value: props.record.demander,}),
        status: Form.createFormField({ ...props.record.status, value: props.record.status,}),
      };
    //}
  },
  onValuesChange(_, values) {
    // console.log(values);
  },
})
export default class ImplForm extends PureComponent {
  state = {
    // demanderValue: '',
    tagTreeSelectValue: [],
  };
  onTagChange = (value) => {
    this.setState({tagTreeSelectValue: value});
  }

  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { record, userList, handleModalVisible } = this.props;
      var user = userList.find((element) => (element.username === this.props.demander));
      user = user || {_id: '', pid: [] }; //防止原来的demander已被删除
      const fields = { 
        ...record,  //装填未更改字段
        ...fieldsValue, //装填可能更改的字段
        demander: this.props.demander, //user._id,//缺省应有的字段：用户名
        department: this.props.userDept.username, //._id,//缺省应有的字段：用户的部门名
        demanderId: user._id,
        deptIds: user.pid,
        updatedAt: Date.now(), //缺省应有的字段：更新时间。必须有，避免上一条记录的遗留痕迹
        __v: (record.__v ? record.__v+1 : 1), //缺省应有的字段：更新次数。
      }
     
      //this.props.dispatch({ type: 'implement/setRecord', payload: fieldsValue, });
      //修改数据库
      //this.props.handleAdd(fieldsValue);
      if(record._id) { //Update exist record
        //const { implement: { record } } = this.props;
        this.props.dispatch({
          type: 'implement/update',
          payload: fields, 
        });    
      } else { //Create a new record
        this.props.dispatch({
          type: 'implement/add',
          payload: fields, // {
        });
      }
      handleModalVisible(false, true);
      message.success('更改成功:' + JSON.stringify(fields));
    });
  };
  // componentDidMount() {
  //   eslint-disable-next-line
  //   alert(global.currentUser.name);
  //   this.props.dispatch({ type: 'party/fetchUserDept', payload: {}, });
  //   this.setState({demanderValue: this.props.currentUser.name});
  // }

//render the form-----------------------------------------------------------------------------------------
  //<pre className="language-bash"> {JSON.stringify(record, null, 2)} </pre>
  render(){
    const { tagTree, demander, userDept, userList, record, modalVisible, form, handleModalVisible } = this.props; //deptTree,
    //const options = userList.map(d => <Option key={d._id}>{d.username}</Option>);
    return (
      <Modal title="需求落实" visible={modalVisible} onOk={this.okHandle} onCancel={() => handleModalVisible(false, false)}>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="提出人">
          <Select
            mode="combobox"
            value={demander}
            defaultActiveFirstOption={true}
            showArrow={false}
            filterOption={false}
            style={{ width: '100%' }}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
          >
            {userList.map(d => <Option key={d.username}>{d.username}</Option>)}
          </Select>
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="部门">
          <span className="ant-form-text">{userDept.username}</span>
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="需求">
          {form.getFieldDecorator('reqname', {
            initialValue: '',
            rules: [{ required: true, message: 'Please input the implement...' }],
          })(
            <TextArea rows={4} placeholder="请输入"/>
          )}
        </FormItem>
        {/* <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="数量">
          {form.getFieldDecorator('quantity', {
            initialValue: 1,
            rules: [{ required: true, message: 'Please input quantity...' }],
          })(
            <InputNumber rows={4} placeholder="请输入"/>
          )}
        </FormItem> */}
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="标签">
          {form.getFieldDecorator('tags', {
            rules: [{ required: false, message: 'Please input the tags...' }],
          })(
            // <Cascader options={tagTree} placeholder="Please select" showSearch changeOnSelect expandTrigger="hover" style={{ width: '100%' }}/>,
            // Tags需可多选，但antd cascader还不支持多选！还需用TreeSelect。
            <TreeSelect treeCheckable showCheckedStrategy='SHOW_CHILD' allowClear multiple 
              treeNodeFilterProp='label' value={this.state.tagTreeSelectValue} 
              treeDefaultExpandAll treeData={tagTree} showSearch searchPlaceholder='搜索标签'
              onChange={this.onTagChange} style={{ width: '100%' }} 
            />
          )}
        </FormItem> 
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类别">
          {form.getFieldDecorator('type',{initialValue: '应用'})( 
            <RadioGroup width='100%'>
              <Radio value="应用">应用</Radio>
              <Radio value="设备">设备</Radio>
              <Radio value="软件">软件</Radio>
              <Radio value="服务">服务</Radio>
              <Radio value="网络">网络</Radio>
            </RadioGroup>
            // <Select  style={{ width: '100%' }}>
            //   <Option value="应用">应用</Option>
            //   <Option value="设备">设备</Option>
            //   <Option value="服务">服务</Option>
            //   <Option value="网络">网络</Option>
            // </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="状态">
          {form.getFieldDecorator('status',{initialValue: '正常'})( 
            <Select  style={{ width: '100%' }}>
              <Option value="正常">正常</Option>
              <Option value="取消">取消</Option>
              <Option value="挂起">挂起</Option>
              <Option value="关闭">关闭</Option>
            </Select>
          )}
        </FormItem>
      </Modal>
    ); 
  }
}
