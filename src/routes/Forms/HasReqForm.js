import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';

import { Table, Row, Col, Card, Form, Input, Select, Icon,  Divider,
  Radio, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
  //import { toTreeData } from '../../utils/utils';
  import StandardTable from '../../components/StandardTable';
  
  //import styles from './TableList.less';
  
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

// const { Header, Content, Footer, Sider } = Layout;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
//const TreeNode = Tree.TreeNode;

//CreateForm = Form.create()((props) => {
@connect(({implement, party, user}) => ({
  // demander: party.user,
  record: implement.record,
  list: implement.reqList,
  user: user.currentUser.name,
}))
@Form.create()
export default class SelectReqForm extends PureComponent {
  // state = {
  //   selectedRows: [],
  //   queryParams: {}, //search conditions from search forms and requirementTable
  // }
  // componentDidMount() {
  // }

  okHandle = () => {
    const { record, list, user, dispatch } = this.props; //deptTree,
    const r = {...record, pid: list.map(o => o._id), updatedAt: Date.now(), user:user};
    dispatch({ type: 'implement/update', payload: r});    
    dispatch({ type: 'implement/fetch'});
      // message.success('更改成功:' + JSON.stringify(fields));
    // 更新对应需求的状态。注意这里仅提供了要更新的字段，其他字段自动保留！
    // for(var i in r.pid) {
    r.pid.map(i => 
      dispatch({ type: 'requirement/update', payload: {_id: i, state: '处理中', updatedAt: Date.now()}, })
    );
    
    this.props.handleModalVisible(false, true);
  };
  handleRemove = (record) => {
    const { list, dispatch } = this.props; //deptTree,
    const newlist = list.filter(item => item._id != record._id);
    this.props.dispatch({ type: 'implement/setReqList', payload: newlist });
  }
  onAddReq = () => {
    this.props.handleSelectReqModalVisible(true, false);
  };
//render the form-----------------------------------------------------------------------------------------
  render(){
    const { list, record, modalVisible, handleModalVisible } = this.props; //deptTree,
    // const { selectedRows } = this.state;
    const columns = [
      // { //显示行号
      //   title: 'No',
      //   dataIndex: 'no',
      //   align: 'center',
      //   width: 40,
      //   render: (text, record, index) => <span> {index+1} </span>,
      // },
      {
        title: '部门',
        dataIndex: 'department',
      },
      {
        title: '提出人',
        dataIndex: 'demander',
        //render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '需求',
        dataIndex: 'reqname',
        // width: 500,
      },
      // {
      //   title: '数量',
      //   dataIndex: 'quantity',
      //   // sorter: true,
      //   //render: val => `${val} 万`,
      // },
      // {
      //   title: '归属项目群',
      //   dataIndex: 'tagRecords',
      //   render(val) {
      //     // message.success(JSON.stringify(val));
      //     return  <span>{val.map(o => o.username).join('、')}</span>;
      //   }
      // },
      {
        title: '类别',
        dataIndex: 'type',
        // sorter: true,
        //render: val => `${val} 万`,
      },
      {
        title: '操作',
        // width: 15,
        //dataIndex: 'operation',
        //record中是list中的一条记录
        render: (text, record) => {
          return (
              <Fragment>
                 <a onClick={() => this.handleRemove(record)}>移除</a>
              </Fragment>
          );
        },
      },
    ];

    //const options = userList.map(d => <Option key={d._id}>{d.username}</Option>);
    return (
      <Modal title={"关联的需求 | 标的：" + record.name} visible={modalVisible} width="50%" 
          onCancel={() => handleModalVisible(false, false)}
          footer={[
            <Button key="submit"  type="primary" onClick={() => this.onAddReq()}>添加需求</Button>,
            <Divider type="vertical" />,
            // state_actions[pRecord.state || '提出'].map(a => action_Button[a]), //state->actions->Buttons
            // <Divider type="vertical" />,
            <Button key="ok" onClick={() => this.okHandle() }>确定</Button>,
            <Button key="cancel" onClick={() => handleModalVisible(false, false) }>取消</Button>,
          ]}
      >
        {/* <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="提出人">
          {form.getFieldDecorator('demander',
            {rules: [{ required: true, message: 'Please input the request...' }],}
          )( */}
        <Table
          // loading={loading}
          // rowKey={record => record._id}
          dataSource={list}
          columns={columns}
          bordered
          // pagination={false}
          // scroll={{ y: 300 }}
          size="small"
          style={{ fontSize: 10, color: '#066' } }
        />
        {/* '#08c'
        <StandardTable
          selectedRows={selectedRows}
          columns={columns}
          data={list}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
        /> */}
          {/* )}        
        </FormItem> */}
      </Modal>
    ); 
    // value={this.state.tagTreeSelectValue} treeDefaultExpandAll
  }
}
