import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, InputNumber, Modal, message } from 'antd';
import { Table, Alert, Menu, Badge, Dropdown, Icon, Divider, Popconfirm } from 'antd';
//import styles from './TableList.less';
import ImplForm from '../Forms/ImplForm';
// import 'moment/locale/zh-cn';
// moment.locale('zh-cn');


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
  // type: implement.type,
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

  handleCreateImpl = (type) => {
    const {pRecord, dispatch} = this.props;
    //初始化缓存
    if(type==='计划') {
      const rec = {
        budgetyear: '2018',
        type: type, 
        pid: pRecord._id,
        quantity: 1,
        price: 1,
        amount: 1,
        date: moment(Date.now()).format('YYYY-MM-DD'), //'2018-12-31'
      }
      dispatch({ type: 'implement/setRecord', payload: rec }); 
    } else { //新实际项，要准备record。//获取当前需求的最近的1条计划项，并告诉后端要做必要的设置
      dispatch({ type: 'implement/fetchOne', payload: {type: '计划', pid: pRecord._id, newActual:1 } }); 
    }
    if(pRecord.type === '设备')
      dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    if(pRecord.type === '软件')
      dispatch({ type: 'party/fetchPartyClass', payload: {class: '软件'}, });
    this.props.handleImplModalVisible(true, false);
  };
  handleUpdateImpl = (record) =>{
    this.props.dispatch({ type: 'implement/fetchOne', payload: {id: record.sid}, });
    if(this.props.pRecord.type === '设备')
      this.props.dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    if(this.props.pRecord.type === '软件')
      this.props.dispatch({ type: 'party/fetchPartyClass', payload: {class: '软件'}, });
    this.props.handleImplModalVisible(true, true);
  };
  changeReqState = (action) => {
    const {pRecord, currentUser, dispatch, handleModalVisible} = this.props;
    //初始化缓存
    const rec = {
      action: action,
      user: currentUser,
      pid: pRecord._id, 
      reqname: pRecord.reqname,
      state: action,
    }
    dispatch({ type: 'implement/action', payload: rec });
    // dispatch({ type: 'event/fetch', payload: {pid: pRecord._id}, });
    // handleModalVisible(false, false);
    const rec2 = {
      ...pRecord,
      state: action,
      }
    dispatch({ type: 'requirement/setRecord', payload: rec2 }); 
  }

  render(){
    const { list, loading, pRecord, user, modalVisible, form, handleModalVisible } = this.props; //deptTree,
    //message.success(JSON.stringify(pagination));
    const actionMap = {'关闭':'default', '计划':'processing', '实际':'success', '挂起':'warning', '取消':'error'};  
    // const state = ['提出', '计划', '实际', '挂起', '取消'];
    const columns = [
      { //显示行号
        title: 'No',
        dataIndex: 'no',
        align: 'center',
        width: 20,
        render: (text, record, index) => <span> {index+1} </span>,
      },
      {
        title: '行动',
        dataIndex: 'action', //事件(~行动）的“分类”，对于需求则是达到某“状态”。这里事件和状态的配合，构成了状态机/PetriNet!
        width: 30,
        // render(val) {
        //   return <Badge status={actionMap[val]} text={val} />;
        // },
      },
      {
        title: '跟踪事件',
        dataIndex: 'name',
        width: 300,
      },
      {
        title: '跟踪人',
        dataIndex: 'user',//'recorder',
        width: 30,
        //render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '跟踪日期',
        dataIndex: 'createdAt',
        width: 48,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '操作',
        width: 15,
        //dataIndex: 'operation',
        //record中是list中的一条记录
        render: (text, record) => {
          return (
            record.sid && (pRecord.state==='处理中' || pRecord.state ==='挂起') ?
              <Fragment>
                 <a onClick={() => this.handleUpdateImpl(record)}>更新</a>
              </Fragment>
            :
              <Fragment>
                <a >----</a>
              </Fragment>
          );
        },
      },
    ];
    //PetriNet, 定义了：需求的每个状态下可选的落实行动
    const state_actions = {
      '提出': ['计划','取消','挂起'],
      '处理中': ['计划','实际','挂起','关闭','取消'],
      '挂起': ['计划','实际','取消'],
      '关闭': [],
      '取消': [],
    };
    const action_Button = {
      '计划': <Button key="impl" type="primary" onClick={() => this.handleCreateImpl('计划')}>新增计划项</Button>,
      '实际': <Button key="impl" onClick={() => this.handleCreateImpl('实际')}>新增实际项</Button>,
      '关闭': <Button key="impl" onClick={() => this.changeReqState('关闭')}>关闭需求</Button>,
      '挂起': <Button key="impl" onClick={() => this.changeReqState('挂起')}>挂起需求</Button>,
      '取消': <Button key="impl" onClick={() => this.changeReqState('取消')}>取消需求</Button>,
    };
    return (
      <Modal title={'需求跟踪事件表 | 需求：' + pRecord.reqname + ' [ ' + pRecord.state + ' ]'} width="50%" 
        visible={modalVisible} onCancel={() => handleModalVisible(false, false) }
        footer={[
          <Button key="submit" onClick={this.okHandle}>新增日常事件</Button>,
          <Divider type="vertical" />,
          state_actions[pRecord.state || '提出'].map(a => action_Button[a]), //state->actions->Buttons
          <Divider type="vertical" />,
          <Button key="cancel" onClick={() => handleModalVisible(false, false) }>关闭窗口</Button>,
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
          {form.getFieldDecorator('state',{initialValue: '正常'})( //~defaultValue="部门"
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
