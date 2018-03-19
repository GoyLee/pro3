import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu,
  InputNumber, DatePicker, Modal, Badge, Divider, Popconfirm,message } from 'antd';
import StandardTable from '../../components/StandardTable';
import ReqForm from '../Forms/ReqForm';
import EventForm from '../Forms/EventForm';
import ImplForm from '../Forms/ImplForm';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


import styles from './TableList.less';

const { Header, Content, Footer, Sider } = Layout;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
//const TreeNode = Tree.TreeNode;
//initialize the List--------------------------------------------------------------------------------
@connect(({ requirement, party, loading, user }) => ({
  requirement,
  userList: party.userList,
  loading: loading.models.requirement,
  currentUser: user.currentUser,
}))
@Form.create()
export default class RequirementList extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框
    eventModalVisible: false, //是否显示事件列表的对话框
    implModalVisible: false, //是否显示事件列表的对话框

    expandForm: false,
    collapsed: false,
    //for standardlist
    selectedRows: [],
    queryParams: {}, //search conditions from search forms and requirementTable
  };
  
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'requirement/fetch',});
    dispatch({ type: 'party/fetchTagTree', });
    dispatch({ type: 'party/fetchUserList', payload: {}, }); //username: name
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    //const { formValues } = this.state;
    //message.success(JSON.stringify(filtersArg));
    //把对象中的每个属性的值由数组变成了由‘,’分隔的字符串
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});
    //params和后台egg‘s ctx.query二者匹配即可，中间过程可不管！
    const params = {
      ...this.state.queryParams,
      ...filters,
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      //...formValues,
    };
    if (sorter.field) { //判断对象sorter是否为空{}
    //message.success(JSON.stringify(sorter.order));
      params.sorter = ((sorter.order === 'ascend') ? '':'-') + sorter.field;
      //this.setState({sorter: params.sorter});
    }
    this.setState({ queryParams: params})
    //message.success(JSON.stringify(params));
    dispatch({
      type: 'requirement/fetch',
      payload: params,
    });
  }
  
  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'requirement/remove',
          payload: {
            id: selectedRows.map(row => row._id).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }
//for search form ---------------------------------------------------------------------------
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      //formValues: {},
      queryParams: {},
    });
    dispatch({
      type: 'requirement/fetch',
      payload: {},
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      //const values = {
      //  ...fieldsValue,
      //  updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      //};

      //this.setState({
      //  formValues: values,
      //});
      const params = {
        ...this.state.queryParams,
        ...fieldsValue
      }
      this.setState({ queryParams: params});
      dispatch({
        type: 'requirement/fetch',
        payload: params, //不能用queryParams, 因其是异步更新，现在还是旧值！
      });
    });
  }
  
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
      <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="部门">
            {getFieldDecorator('department')(
              <Input placeholder="请输入" />
            )}
          </FormItem>
        </Col>
        <Col md={8} sm={24}>
          <FormItem label="需求">
            {getFieldDecorator('reqname')(
              <Input placeholder="请输入" />
            )}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label="状态">
            {getFieldDecorator('state')(
              <Select placeholder="请选择" style={{ width: '100%' }}>
                <Option value="提出">提出</Option>
                <Option value="处理中">处理中</Option>
                <Option value="挂起">挂起</Option>
                <Option value="取消">取消</Option>
                <Option value="关闭">关闭</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col md={4} sm={24}>
          <span className={styles.submitButtons}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            {/* <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              展开 <Icon type="down" />
            </a> */}
          </span>
        </Col>
      </Row>
    </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="需求">
              {getFieldDecorator('reqname')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="调用次数">
              {getFieldDecorator('number')(
                <InputNumber style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="更新日期">
              {getFieldDecorator('updatedAt')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status3')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status4')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }
  
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }
//for record updating, coupled with ReqForm.js---------------------------------------------------------
  handleModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      modalVisible: flag,
    });
    if(isRecordUpdated) {
      this.props.dispatch({
        type: 'requirement/fetch',
        payload: this.state.queryParams, 
      });
    }
  }
  onCreate = () => { //新增记录
    //this.setState({recordNew: true});
    //message.success(JSON.stringify(currentUser));
    const { currentUser, userList } = this.props;
    const name = currentUser.name;
    // this.props.dispatch({ type: 'party/fetchUserList', payload: {}, }); //username: name

    // this.props.dispatch({ type: 'party/setUser', payload: name, }); // 缺省需求人是currentUser
    // this.props.dispatch({ type: 'party/fetchUserDept', payload: {id: currentUser.pid[1]}, });
    const user = userList.find((element) => (element.username === name));
    const dept = user.pid.length > 1 ? user.pid[1].username : user.pid[0].username;
    
    //初始化“需求”记录, 如注释掉，则下次新建时会自动带着上次的信息！
    const record = {demander: name, department: dept, type:'应用', state:'提出'}; //设定默认值
    this.props.dispatch({ type: 'requirement/setRecord', payload: record, });
    
    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    // this.props.dispatch({ type: 'party/fetchUserList', payload: {username: name}, });    
    // this.props.dispatch({ type: 'party/setUser', payload: record.demander, }); 
    //this.props.dispatch({ type: 'party/fetchUserDept', payload: {id:record.pid[1]}, });
    // this.props.dispatch({ type: 'party/saveUserDept', payload: {username: record.department}, });   
    this.props.dispatch({ type: 'requirement/setRecord', payload: record, }); //保存到store
    //this.setState({recordNew: false});
    this.handleModalVisible(true);
  }
  onRemove = (record) => { //删除记录
    //message.success(JSON.stringify(record));
    this.props.dispatch({
      type: 'requirement/remove',
      payload: {id: record._id}, // {
    });
    this.props.dispatch({
      type: 'requirement/fetch',
      payload: this.state.queryParams, 
    });
  }
//for requirements tracking, coupled with EventForm.js & ImplForm.js-------------------------------------------------
  handleImplModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      implModalVisible: flag,
    });
    // if(isRecordUpdated) {
      this.props.dispatch({ type: 'requirement/fetch', payload: this.state.queryParams, });
    // }
  }  
  handleEventModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      eventModalVisible: flag,
    });
    // if(isRecordUpdated) {
      this.props.dispatch({ type: 'requirement/fetch', payload: this.state.queryParams, });
    // }
  }
  
  onTrack = (record) => { //跟踪事件
    this.props.dispatch({ type: 'event/fetch', payload: {pid: record._id}, });
    //this.props.dispatch({ type: 'party/setUser', payload: record.demander, }); 
    //this.props.dispatch({ type: 'party/saveUserDept', payload: {username: record.department}, });   
    //this.props.dispatch({ type: 'party/fetchUserDept', payload: {id:record.pid[1]}, });
    this.props.dispatch({ type: 'requirement/setRecord', payload: record, }); //保存到store
    //this.setState({recordNew: false});
    this.handleEventModalVisible(true);
  }

// Render the List-------------------------------------------------------------------------------------
  render() {
    const { requirement: { data }, loading } = this.props;
    const { selectedRows, modalVisible, eventModalVisible, implModalVisible } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );
    const statusMap = {'提出':'default', '处理中':'processing', '关闭':'success', '挂起':'warning', '取消':'error'};  
    const status = ['提出', '处理中', '关闭', '挂起', '取消'];
    const columns = [
      { //显示行号
        title: 'No',
        dataIndex: 'no',
        align: 'center',
        width: 40,
        render: (text, record, index) => <span> {index+1} </span>,
      },
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
        title: '类别',
        dataIndex: 'type',
        sorter: true,
        //render: val => `${val} 万`,
      },
      {
        title: '需求',
        dataIndex: 'reqname',
        // width: 500,
      },
      {
        title: '估价',
        dataIndex: 'amount',
        align: 'right',
        sorter: true,
        //render: val => `${val} 万`,
      },
      {
        title: '归属项目群',
        dataIndex: 'tagRecords',
        render(val) {
          // message.success(JSON.stringify(val));
          return  <span>{val.map(o => o.username).join('、')}</span>;
        }
      },
      //{
      //  title: '归属',
      //  dataIndex: 'pid',
      //},
      {
        title: '状态',
        dataIndex: 'state',
        
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
          {
            text: status[4],
            value: status[4],
          },
        ],
        //render: val => <span>{val}</span>,
        render(val) {
          return <Badge status={statusMap[val]} text={val} />;
        },
      },
      {
        title: '更新日期',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '操作',
        //dataIndex: 'operation',
        //record中是list中的一条记录
        render: (text, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a onClick={() => this.onEdit(record)}>编辑</a>
              </Menu.Item>
              <Menu.Item>
                <Popconfirm title="Sure to delete?" onConfirm={() => this.onRemove(record)}>
                  <a href="#">删除</a>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          );
          return (
            <Fragment>
                <a onClick={() => this.onTrack(record)}>跟踪</a>
              <Divider type="vertical" />
              <Dropdown overlay={menu}>
                <a>更多<Icon type="down" /></a>
              </Dropdown>
            </Fragment>
            //  <a onClick={() => this.props.onRemove(record)}>删除</a>
            //<a onClick={() => message.success(record._id)}>编辑</a>
            //<a onClick={() => this.save(record.key)}>Save</a>    
            //this.state.dataSource.length > 1 ?
            //(
              //<Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.key)}>
              //  <a href="#">Delete</a>
              //</Popconfirm>
            //) : null
          );
        },
      },
      /*
      {
        title: '操作',
        render: () => (
          <Fragment>
            <a href="">配置</a>
            <Divider type="vertical" />
            <a href="">订阅警报</a>
          </Fragment>
        ),
      },*/
    ];
    
    return (
      <PageHeaderLayout title="信息化需求管理">
        <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>
                  {this.renderForm()}
                </div>
                <div className={styles.tableListOperator}>
                  <Button icon="plus" type="primary" onClick={() => this.onCreate()}>
                    新建
                  </Button>
                  {
                    selectedRows.length > 0 && (
                      <span>
                        <Button>批量操作</Button>
                        <Dropdown overlay={menu}>
                          <Button>
                            更多操作 <Icon type="down" />
                          </Button>
                        </Dropdown>
                      </span>
                    )
                  }
                </div>
                <StandardTable
                  selectedRows={selectedRows}
                  loading={loading}
                  columns={columns}
                  data={data}
                  expandedRowRender={record => <p style={{ margin: 0, color: '#f00' }}>
                                            {'必要性：' + record.necessity}</p>}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                  />
              </div>
        </Card>
        <ReqForm
            handleModalVisible={this.handleModalVisible}
            modalVisible={modalVisible}
        />
        <EventForm
            handleModalVisible={this.handleEventModalVisible}
            handleImplModalVisible={this.handleImplModalVisible}
            modalVisible={eventModalVisible}
        />
        <ImplForm
            handleModalVisible={this.handleImplModalVisible}
            modalVisible={implModalVisible}
        />
      </PageHeaderLayout>
    );
  }
}
