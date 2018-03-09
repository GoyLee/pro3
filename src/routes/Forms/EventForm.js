import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, InputNumber, Modal, message } from 'antd';
import { Table, Alert, Menu, Badge, Dropdown, Icon, Divider, Popconfirm } from 'antd';
//import styles from './TableList.less';
import ImplForm from '../Forms/ImplForm';


const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

//CreateForm = Form.create()((props) => {
@connect(({event, requirement, user, loading}) => ({
  list: event.data,
  //user: party.user,
  pRecord: requirement.record, // 父对象的记录，这里是需求的record
  //userList: party.userList,
  currentUser: user.currentUser.name,
  loading: loading.models.event,
  //userDept: party.userDept,
}))
@Form.create()
export default class EventForm extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框
  };
  // componentDidMount() {
  // }

  okHandle = () => {
    // handleModalVisible(false, true);
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { handleModalVisible } = this.props;
      const fields = { 
        ...fieldsValue, //装填可能更改的字段
        user: this.props.currentUser, //user._id,//缺省应有的字段：填写人
        pid:  this.props.pRecord._id, //缺省应有的字段：关于什么的事件
        createdAt: Date.now(), //缺省应有的字段：创建时间。必须有，避免上一条记录的遗留痕迹
        //department: this.props.userDept.username, //._id,//缺省应有的字段
      }
      //修改数据库
      //Create a new record
      this.props.dispatch({
        type: 'event/add',
        payload: fields, // {
      });
      message.success('添加成功:' + JSON.stringify(fields));
      this.props.dispatch({ type: 'event/fetch', payload: {pid: this.props.pRecord._id}, });
    });
  };

  onImplement = () => {
    if(this.props.pRecord.type === '设备'|'软件')
      this.props.dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    this.props.handleImplModalVisible(true, false);
  }
  render(){
    const { list, loading, pRecord, user, modalVisible, form, handleModalVisible } = this.props; //deptTree,
    //message.success(JSON.stringify(pagination));
    const status = ['正常', '关闭', '计划', '挂起'];
    const statusMap = {'计划':'default', '正常':'processing', '关闭':'success', '挂起':'error'};  

    const columns = [
      { //显示行号
        title: 'No',
        dataIndex: 'no',
        align: 'center',
        width: 30,
        render: (text, record, index) => <span> {index+1} </span>,
      },
      {
        title: '记录人',
        dataIndex: 'user',//'recorder',
        width: 40,
        //render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '跟踪事件',
        dataIndex: 'name',
        width: 250,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 40,
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
        width: 60,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '操作',
        width: 20,
        //dataIndex: 'operation',
        //record中是list中的一条记录
        render: (text, record) => {
          return (
            record.sid ?
              <Fragment>
                 <a onClick={() => this.onTrack(record)}>更新</a>
              </Fragment>
            :
              <Fragment>
                <a >----</a>
              </Fragment>
          );
        },
      },
    ];
    
    return (
      <Modal title={'跟踪：' + pRecord.reqname} width="45%" 
        visible={modalVisible} onCancel={() => handleModalVisible(false, false) }
        footer={[
          <Button key="submit" onClick={this.okHandle}>
            增加日常事件
          </Button>,
          <Divider type="vertical" />,
          <Button key="impl" type="primary" onClick={() => this.onImplement()}>
            新计划项         
          </Button>,
          <Button key="impl" onClick={() => this.onImplement()}>实现</Button>,
          <Button key="impl" onClick={() => this.onImplement()}>挂起</Button>,
          <Divider type="vertical" />,
          <Button key="cancel" onClick={() => handleModalVisible(false, false) }>取消</Button>,
        ]}
      >

        <Table
          loading={loading}
          rowKey={record => record._id}
          dataSource={list}
          columns={columns}
          bordered
          pagination={false}
          scroll={{ y: 300 }}
          size="small"
        />
        <br/>
        <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} label="日常跟踪事件">
          {form.getFieldDecorator('name', {
            initialValue: '',
            rules: [{ required: true, message: 'Please input tracking event...' }],
          })(
            <TextArea rows={2} placeholder="请输入"/>
          )}
        </FormItem>
        {/* <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} label="需求状态">
          {form.getFieldDecorator('status',{initialValue: '正常'})( //~defaultValue="部门"
            <Select  style={{ width: '100%' }}>
              <Option value="正常">正常</Option>
              <Option value="取消">取消</Option>
              <Option value="挂起">挂起</Option>
              <Option value="关闭">关闭</Option>
            </Select>
          )}
        </FormItem> */}
      </Modal>

    ); 
  }
}
