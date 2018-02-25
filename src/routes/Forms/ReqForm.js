import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { TreeSelect, Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';

//import { toTreeData } from '../../utils/utils';

//import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const { Header, Content, Footer, Sider } = Layout;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
//const TreeNode = Tree.TreeNode;

//CreateForm = Form.create()((props) => {
@connect(({requirement, party, user}) => ({
  demander: party.user,
  record: requirement.record,
  userList: party.userList,
  currentUser: user.currentUser,
  userDept: party.userDept,
  //deptTree: requirement.dept.list,
}))
@Form.create({
  // 下列代码没必要，因每个form.getFieldDecorator的字段在form.validateFields((err, fieldsValue))中，
  // 都由包含在fieldsValue对象中了，在okHandle时，使用即可。
  // onFieldsChange(props, changedFields) {
  //   const { dispatch, record } = props;
  //   //message.success(JSON.stringify(changedFields.reqname.value));
  //   //每个form.getFieldDecorator的字段都需保存到store
  //   var fieldsValue = {
  //     ...record,
  //   }
  //   if(changedFields.reqname) { 
  //     fieldsValue = {
  //       ...fieldsValue,
  //       reqname: changedFields.reqname.value,
  //     }
  //   }
  //   if(changedFields.program) { 
  //     fieldsValue = {
  //       ...fieldsValue,
  //       program: changedFields.program.value,
  //     }
  //   }
  //   if(changedFields.type) { 
  //     fieldsValue = {
  //       ...fieldsValue,
  //       type: changedFields.type.value,
  //     }
  //   }
  //   if(changedFields.status) { 
  //     fieldsValue = {
  //       ...fieldsValue,
  //       status: changedFields.status.value,
  //     }
  //   }
  //   dispatch({ type: 'requirement/setRecord', payload: fieldsValue, });
  //   //props.onChange(changedFields);
  // },
  mapPropsToFields(props) { //绑定字段;
    //if(props.record._id) { //不空，是Update。要绑定values和fields。注意判断record对象是否为空对象的方法！不能用record==={}！
      return {
        //每个form.getFieldDecorator的字段都需map
        //department: Form.createFormField({ ...props.record.department, value: props.record.department,}),
        reqname: Form.createFormField({ ...props.record.reqname, value: props.record.reqname,}),
        program: Form.createFormField({ ...props.record.program, value: props.record.program,}),
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
export default class ReqForm extends PureComponent {
  //state = {
    //demanderValue: '',
  //};

  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { record, handleModalVisible } = this.props;
      //const user = userList.find((element) => (element.username === this.props.demander));
      const fields = { 
        ...record,  //装填未更改字段
        ...fieldsValue, //装填可能更改的字段
        demander: this.props.demander, //user._id,//缺省应有的字段：用户名
        department: this.props.userDept.username, //._id,//缺省应有的字段：用户的部门名
        updatedAt: Date.now(), //缺省应有的字段：更新时间。必须有，避免上一条记录的遗留痕迹
        __v: (record.__v ? record.__v+1 : 1), //缺省应有的字段：更新次数。
      }
     
      //this.props.dispatch({ type: 'requirement/setRecord', payload: fieldsValue, });
      //修改数据库
      //this.props.handleAdd(fieldsValue);
      if(record._id) { //Update exist record
        //const { requirement: { record } } = this.props;
        this.props.dispatch({
          type: 'requirement/update',
          payload: fields, 
        });    
      } else { //Create a new record
        this.props.dispatch({
          type: 'requirement/add',
          payload: fields, // {
        });
      }
      handleModalVisible(false, true);
      message.success('添加成功:' + JSON.stringify(fields));
    });
  };
  // componentDidMount() {
  //   eslint-disable-next-line
  //   alert(global.currentUser.name);
  //   this.props.dispatch({ type: 'party/fetchUserDept', payload: {}, });
  //   this.setState({demanderValue: this.props.currentUser.name});
  // }
  //for 'demander' select event handling-------------------------------------------------------------------
  //随输入关键字的变化，即时模糊查询匹配的用户列表供选择，并设置store中的user，来更新select，保证输入和显示的一致性
  handleChange = (value) => {
    //message.success(JSON.stringify(value));
    //if(!value){
     // this.setState({demanderValue: record.demander});
    //} else {
    //  this.setState({demanderValue: value});
    //}
    this.props.dispatch({ type: 'party/setUser', payload: value,}); 
    this.props.dispatch({ type: 'party/fetchUserList', payload: {username: value}, });
  }
  //随用户选择变化，即时获取用户所属部门名称
  handleSelect = (value) => {
    //message.success(JSON.stringify(value));
    const { userList } = this.props;
    const user = userList.find((element) => (element.username === value));
    this.props.dispatch({ type: 'party/fetchUserDept', payload: {id: user.pid}, });
    //this.setState({demanderValue: value});
    //this.props.dispatch({ type: 'party/fetchUserList', payload: {username: value.key}, });
  } 
  
        //<pre className="language-bash"> {JSON.stringify(record, null, 2)} </pre>
  render(){
    const { demander, userDept, userList, record, modalVisible, form, handleModalVisible } = this.props; //deptTree,
    //const options = userList.map(d => <Option key={d._id}>{d.username}</Option>);
    return (
      <Modal title="信息化需求" visible={modalVisible} onOk={this.okHandle} onCancel={() => handleModalVisible(false, false)}>
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
            rules: [{ required: true, message: 'Please input user\'s name...' }],
          })(
            <TextArea rows={4} placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="归属项目群">
          {form.getFieldDecorator('program')(
            <Select  style={{ width: '100%' }}>
              <Option value="试飞一体化平台">试飞一体化平台</Option>
              <Option value="试飞工作门户">试飞工作门户</Option>
              <Option value="飞行运行控制系统">飞行运行控制系统</Option>
              <Option value="试飞数据分析平台">试飞数据分析平台</Option>
              <Option value="ERP实施">ERP实施</Option>
              <Option value="试飞数据处理平台">试飞数据处理平台</Option>
              <Option value="空地一体化分析平台">空地一体化分析平台</Option>
              <Option value="终端设备">终端设备</Option>
              <Option value="其他">其他</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="类别">
          {form.getFieldDecorator('type',{initialValue: '应用'})( //~defaultValue="部门"
            <Select  style={{ width: '100%' }}>
              <Option value="应用">应用</Option>
              <Option value="设备">设备</Option>
              <Option value="服务">服务</Option>
              <Option value="网络">网络</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="状态">
          {form.getFieldDecorator('status',{initialValue: '正常'})( //~defaultValue="部门"
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
