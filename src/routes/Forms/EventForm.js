import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, InputNumber, Modal, message } from 'antd';
import { Table, Alert, Menu, Badge, Dropdown, Icon, Divider, Popconfirm } from 'antd';
//import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

//CreateForm = Form.create()((props) => {
@connect(({requirement, party, user}) => ({
  data: requirement.data,
  demander: party.user,
  record: requirement.record,
  userList: party.userList,
  currentUser: user.currentUser.name,
  userDept: party.userDept,
  //deptTree: requirement.dept.list,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const { dispatch, record } = props;
    //message.success(JSON.stringify(changedFields.reqname.value));
    //每个form.getFieldDecorator的字段都需保存到store
    var fieldsValue = {
      ...record,
    }
    if(changedFields.reqname) { 
      fieldsValue = {
        ...fieldsValue,
        reqname: changedFields.reqname.value,
      }
    }
    if(changedFields.program) { 
      fieldsValue = {
        ...fieldsValue,
        program: changedFields.program.value,
      }
    }
    if(changedFields.type) { 
      fieldsValue = {
        ...fieldsValue,
        type: changedFields.type.value,
      }
    }
    if(changedFields.status) { 
      fieldsValue = {
        ...fieldsValue,
        status: changedFields.status.value,
      }
    }
    dispatch({ type: 'requirement/setRecord', payload: fieldsValue, });
    //props.onChange(changedFields);
  },
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
export default class EventForm extends PureComponent {
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
        demander: this.props.demander, //user._id,//缺省应有的字段
        department: this.props.userDept.username, //._id,//缺省应有的字段
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
        // username: fields.username, //TODO: 试一试仅fields.username是否可以！
        // password: fields.password,
        // type:
        // },
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
  componentDidMount() {
    // eslint-disable-next-line
    // alert(global.currentUser.name);
    //this.props.dispatch({ type: 'party/fetchUserDept', payload: {}, });
    //this.setState({demanderValue: this.props.currentUser.name});
  }

  handleBlur = (value) => {
  
    //const user = userList.find((element) => (element.username === value));
    //this.setState({demanderValue: user});
  } 
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
    const { data: { list, pagination }, loading } = this.props;
    //message.success(JSON.stringify(pagination));
    const statusMap = {'挂起':'default', '正常':'processing', '关闭':'success', '取消':'error'};  
    const status = ['正常', '关闭', '挂起', '取消'];

    const columns = [
      { //显示行号
        title: 'No',
        dataIndex: 'no',
        align: 'center',
        width: 40,
        render: (text, record, index) => <span> {index+1} </span>,
      },
      {
        title: '记录人',
        dataIndex: 'demander',//'recorder',
        //render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '跟踪事件',
        dataIndex: 'reqname',
        width: 300,
      },
            {
        title: '状态',
        dataIndex: 'status',
        
        filters: [
          {
            text: status[0],
            value: status[0],
          },
          {
            text: status[1],
            value: status[1],
          },
          {
            text: status[2],
            value: status[2],
          },
          {
            text: status[3],
            value: status[3],
          },
        ],
        //render: val => <span>{val}</span>,
        render(val) {
          return <Badge status={statusMap[val]} text={val} />;
        },
      },
      {
        title: '日期',
        dataIndex: 'createdAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
    ];
    
    return (
      <Modal title={record.reqname} width="50%" visible={modalVisible} onOk={this.okHandle} onCancel={() => handleModalVisible(false, false) } >
        <Table
          loading={loading}
          rowKey={record => record._id}
          dataSource={list}
          columns={columns}
          bordered
          size="small"
        />
     
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
