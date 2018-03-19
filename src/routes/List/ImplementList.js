import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu,
  InputNumber, DatePicker, Modal, Badge, Divider, Popconfirm,message } from 'antd';
import StandardTable from '../../components/StandardTable';
import ImplForm from '../Forms/ImplForm';
import HasReqForm from '../Forms/HasReqForm';
import SelectReqForm from '../Forms/SelectReqForm';
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
@connect(({ implement, loading, party, user }) => ({
  implement,
  // userList: party.userList,
  reqList: implement.reqList,
  loading: loading.models.implement,
  // currentUser: user.currentUser,
}))
@Form.create()
export default class ImplList extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框
    selectModalVisible: false, //是否显示事件列表的对话框
    hasReqModalVisible: false, //是否显示实现列表的对话框
    expandForm: false,
    collapsed: false,
    //for standardlist
    selectedRows: [],
    queryParams: {}, //search conditions from search forms and requirementTable
  };
  
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'implement/fetch',});
    dispatch({ type: 'party/fetchTagTree', });


    // dispatch({ type: 'party/fetchUserList', payload: {}, }); //username: name
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
      type: 'implement/fetch',
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
          type: 'implement/remove',
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
      type: 'implement/fetch',
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
        type: 'implement/fetch',
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
            <FormItem label="计划">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="类别">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="应用">应用</Option>
                  <Option value="设备">设备</Option>
                  <Option value="软件">软件</Option>
                  <Option value="网络">网络</Option>
                  <Option value="服务">服务</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('state')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="计划">计划</Option>
                  <Option value="启动">启动</Option>
                  <Option value="采购">采购</Option>
                  <Option value="到货">到货</Option>
                  <Option value="完成">完成</Option>
                  <Option value="暂停">暂停</Option>
                  <Option value="取消">取消</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
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
            <FormItem label="">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="类别">
              {getFieldDecorator('type')(
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
//for record updating, coupled with ImplForm/HasReqForm/SelectReqForm.js---------------------------------------------------------
  handleModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      modalVisible: flag,
    });
    if(isRecordUpdated) {
      this.props.dispatch({
        type: 'implement/fetch',
        payload: this.state.queryParams, 
      });
    }
  }
  handleHasReqModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      hasReqModalVisible: flag,
    });
    // if(isRecordUpdated) {
    // }
  }
  handleSelectReqModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      selectModalVisible: flag,
    });
    // if(isRecordUpdated) {
    // }
  }
  //把选择来的需求加到implement.reqList中去，并去重
  handleSelectedReq = (selectedReqs) => {
    const {reqList, dispatch} = this.props;
    var list = reqList;//.concat(selectedReqs);
    selectedReqs.map(s => {
      list = list.filter(item => item._id != s._id);
      list.push(s);
    });
    dispatch({ type: 'implement/setReqList', payload: list}); //去重，并保存到store //[...new Set(list)]
  }
  onCreate = (type) => { //新增记录
    const {dispatch} = this.props;
    //初始化“需求”记录, 如注释掉，则下次新建时会自动带着上次的信息！
    const rec = {
      // budgetyear: '2018',
      budgetyear: moment(Date.now()).format('YYYY'),
      type: type, 
      pid: [],
      action: '计划', //对需求的行动，将导致需求的状态为‘处理中’。Rule：仅'提出'、'处理中'、'挂起'三种state中的需求可以被‘计划’~实现。
      state: '计划', //实现本身的状态，初始态是‘计划’。
      quantity: 1,
      price: 1.00,
      amount: 1.00,
      date: moment(Date.now()).format('YYYY-MM-DD'), //'2018-12-31'
    }
    dispatch({ type: 'implement/setRecord', payload: rec }); 
    if(type === '设备')
      dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    if(type === '软件')
      dispatch({ type: 'party/fetchPartyClass', payload: {class: '软件'}, });
    // dispatch({ type: 'requirement/fetch', payload: {state: '提出,处理中,挂起', type: type} });
    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    const {dispatch} = this.props;
    const r = {...record, tags: record.tags.map(o => o._id)};
    dispatch({ type: 'implement/setRecord', payload: r, }); //保存到store
    if(r.type === '设备')
      dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    if(r.type === '软件')
      dispatch({ type: 'party/fetchPartyClass', payload: {class: '软件'}, });

    this.handleModalVisible(true);
  }
  onHas = (record) => { //显示实现的需求列表
    const { dispatch } = this.props;
    // var list = [];
    // record.pid.map( r => )
    const r = {...record, tags: record.tags.map(o => o._id)};
    this.props.dispatch({ type: 'implement/setRecord', payload: r, }); //保存到store
    dispatch({ type: 'implement/setReqList', payload: record.pid }); //保存到store
    //准备对应类型的需求列表备选
    dispatch({ type: 'requirement/fetch', payload: {state: '提出,处理中,挂起', type: record.type} }); 
    this.handleHasReqModalVisible(true);
  }
  onSelect = (record) => { //从需求列表中选择几个需求
    this.handleSelectReqModalVisible(true);
  }
  onRemove = (record) => { //删除记录
    //message.success(JSON.stringify(record));
    this.props.dispatch({
      type: 'implement/remove',
      payload: {id: record._id}, // {
    });
    this.props.dispatch({
      type: 'implement/fetch',
      payload: this.state.queryParams, 
    });
  }
  onTrack = (record, action) => { //
    const { dispatch } = this.props; //deptTree,
    var r = {_id: record._id, state: action, updatedAt: Date.now()};
    if (action === '完成') {
      r.actualdate = Date.now();
    }
    if (action === '恢复') {
      r.state = '启动';
    }
    dispatch({ type: 'implement/update', payload: r}); 
    //刷新主列表
    dispatch({ type: 'implement/fetch'});
    message.success('行动为:' + action);
  }
// Render the List-------------------------------------------------------------------------------------
  render() {
    const { implement: { data }, loading } = this.props;
    const { selectedRows, modalVisible, selectModalVisible, hasReqModalVisible} = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );
    const statusMap = {'计划':'default', '启动':'processing', '采购':'processing', '到货':'processing', '完成':'success', '暂停':'warning', '取消':'error'};  
    const status = ['计划', '启动', '关闭', '挂起', '取消'];
    const columns = [
      { //显示行号
        title: 'No',
        dataIndex: 'no',
        align: 'center',
        width: 40,
        render: (text, record, index) => <span> {index+1} </span>,
      },
      {
        title: '标签',
        dataIndex: 'tags',
        // dataIndex: 'tagRecords',
        render(val) {
          // message.success(JSON.stringify(val));
          return  <span>{val.map(o => o.username).join('、')}</span>;
        }
      },
      {
        title: '类别',
        dataIndex: 'type',
        sorter: true,
        //render: val => `${val} 万`,
      },
      {
        title: '标的物',
        dataIndex: 'name',
        width: 100,
      },
      {
        title: '规格',
        dataIndex: 'spec',
        width: 400,
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        align: 'right',
        sorter: true,
        // render: val => `${val} （万元）`,
      },
      {
        title: '单价',
        dataIndex: 'price',
        align: 'right',
        sorter: true,
        // render: val => `${val} （万元）`,
      },
      {
        title: '金额',
        dataIndex: 'amount',
        align: 'right',
        sorter: true,
        render: val => `${val.toFixed(2)}`,
      },
      //{
      //  title: '归属',
      //  dataIndex: 'pid',
      //},
      {
        title: '状态',
        dataIndex: 'state',
      //   filters: [
      //     {
      //       text: status[0],
      //       value: status[0],
      //     },
      //     {
      //       text: status[1],
      //       value: status[1],
      //     },
      //     {
      //       text: status[2],
      //       value: status[2],
      //     },
      //     {
      //       text: status[3],
      //       value: status[3],
      //     },
      //     {
      //       text: status[4],
      //       value: status[4],
      //     },
      //   ],
      //   //render: val => <span>{val}</span>,
        render(val) {
          return <Badge status={statusMap[val]} text={val} />;
        },
      },
      {
        title: '责任人',
        dataIndex: 'user',
        //render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
      {
        title: '计划日期',
        dataIndex: 'date',
        sorter: true,
        render: val => val? <span>{moment(val).format('YYYY-MM-DD')}</span> : <span/>,
      },
      {
        title: '完成日期',
        dataIndex: 'actualdate',
        sorter: true,
        render: val => val? <span>{moment(val).format('YYYY-MM-DD')}</span> : <span/>,
      },
      {
        title: '操作',
        //dataIndex: 'operation',
        //record中是list中的一条记录
        render: (text, record) => {
          //PetriNet, 定义了：需求的每个状态下可选的落实行动
          const state_actions = {
            '计划': ['启动','取消','暂停','Divider','编辑','删除'], //还有 '计划'，但'计划'的计划项本身又是个子PetriNet, 在Implement中处理
            '启动': ['采购','取消','暂停','Divider','编辑'], //还有 '计划'，但'计划'的计划项本身又是个子PetriNet, 在Implement中处理
            '采购': ['到货','取消','暂停','Divider','编辑'], //还有 '计划'
            '到货': ['完成','取消','暂停','Divider','编辑'], //还有 '计划'
            '暂停': ['恢复','取消','Divider','编辑','删除'],
            '完成': [],
            '取消': ['删除'],
          };
          const action_menuitem = {
            // '计划': <Button key="impl" type="primary" onClick={() => this.handleCreateImpl('计划')}>新增计划项</Button>,
            // '实际': <Button key="impl" onClick={() => this.handleCreateImpl('实际')}>新增实际项</Button>,
            '启动': <Menu.Item> <a onClick={() => this.onTrack(record,'启动')}>启动</a></Menu.Item>,
            '采购': <Menu.Item> <a onClick={() => this.onTrack(record,'采购')}>采购</a></Menu.Item>,
            '到货': <Menu.Item> <a onClick={() => this.onTrack(record,'到货')}>到货</a></Menu.Item>,
            '完成': <Menu.Item> <a onClick={() => this.onTrack(record,'完成')}>完成</a></Menu.Item>,
            '暂停': <Menu.Item> <a onClick={() => this.onTrack(record,'暂停')}>暂停</a></Menu.Item>,
            '恢复': <Menu.Item> <a onClick={() => this.onTrack(record,'恢复')}>恢复</a></Menu.Item>,
            '取消': <Menu.Item> <a onClick={() => this.onTrack(record,'取消')}>取消</a></Menu.Item>,
            '编辑': <Menu.Item> <a onClick={() => this.onEdit(record)}>编辑</a></Menu.Item>,
            '删除': <Menu.Item><Popconfirm title="Sure to delete?" onConfirm={() => this.onRemove(record)}><a>删除</a></Popconfirm></Menu.Item>,
            'Divider': <Menu.Divider />
          };

          const menu = (
            <Menu>
              {state_actions[record.state || '计划'].map(a => action_menuitem[a])} 
            </Menu>
          );
          return (
            <Fragment>
            {/* <Authorized authority={['user', 'admin']}> */}
              <a onClick={() => this.onHas(record)}>需求</a>
              <Divider type="vertical" />
              <Dropdown overlay={menu}>
                <a>更多<Icon type="down"/></a>
              </Dropdown>
              {/* <a onClick={() => this.onEdit(record)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="Sure to delete?" onConfirm={() => this.onRemove(record)}>
                <a href="#">删除</a>
              </Popconfirm> */}
            {/* </Authorized>              */}
            </Fragment>
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
      <PageHeaderLayout title="信息化需求实现计划管理">
        <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>
                  {this.renderForm()}
                </div>
                <div className={styles.tableListOperator}>
                  <Button icon="plus" type="primary" onClick={() => this.onCreate('应用')}>新应用</Button>
                  <Button icon="plus" onClick={() => this.onCreate('设备')}>新设备</Button>
                  <Button icon="plus" onClick={() => this.onCreate('软件')}>新软件</Button>
                  <Button icon="plus" onClick={() => this.onCreate('网络')}>新网络</Button>
                  <Button icon="plus" onClick={() => this.onCreate('服务')}>新服务</Button>
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
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                  />
              </div>
        </Card>
        <ImplForm
            handleModalVisible={this.handleModalVisible}
            modalVisible={modalVisible}
        />
        <HasReqForm
            handleModalVisible={this.handleHasReqModalVisible}
            handleSelectReqModalVisible={this.handleSelectReqModalVisible}
            modalVisible={hasReqModalVisible}
        />
        <SelectReqForm
            handleModalVisible={this.handleSelectReqModalVisible}
            returnSelectedRows={this.handleSelectedReq}
            modalVisible={selectModalVisible}
        />
      </PageHeaderLayout>
    );
  }
}
