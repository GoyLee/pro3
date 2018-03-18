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
    dispatch({ type: 'requirement/fetch', payload: {} });

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
//for record updating, coupled with ReqForm.js---------------------------------------------------------
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
  onCreate = () => { //新增记录
    const {dispatch} = this.props;
    //初始化“需求”记录, 如注释掉，则下次新建时会自动带着上次的信息！
    const rec = {
      budgetyear: '2018',
      // type: type, 
      quantity: 1,
      price: 1.00,
      amount: 1.00,
      state:'计划',
      date: moment(Date.now()).format('YYYY-MM-DD'), //'2018-12-31'
    }
    dispatch({ type: 'implement/setRecord', payload: rec }); 
    // } else { //新实际项，要准备record。//获取当前需求的最近的1条计划项，并告诉后端要做必要的设置
    //   dispatch({ type: 'implement/fetchOne', payload: {type: '计划', pid: pRecord._id, newActual:1 } }); 
    // }
    // if(type === '设备')
    //   dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    // if(type === '软件')
    //   dispatch({ type: 'party/fetchPartyClass', payload: {class: '软件'}, });

    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    const {dispatch} = this.props;
    const r = {...record, tags: record.tags.map(o => o._id)};
    // dispatch({ type: 'implement/setRecord', payload: r, }); //保存到store
    // if(r.type === '设备')
    //   dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
    // if(r.type === '软件')
    //   dispatch({ type: 'party/fetchPartyClass', payload: {class: '软件'}, });

    //this.setState({recordNew: false});
    this.handleModalVisible(true);
  }
  onHas = (record) => { //显示实现的需求列表
    const { dispatch } = this.props;
    // var list = [];
    // record.pid.map( r => )
    const r = {...record, tags: record.tags.map(o => o._id)};
    this.props.dispatch({ type: 'implement/setRecord', payload: r, }); //保存到store

    dispatch({ type: 'implement/setReqList', payload: record.pid }); //保存到store
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
        title: '责任人',
        dataIndex: 'user',
        //render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
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
        title: '单价（万元）',
        dataIndex: 'price',
        align: 'right',
        sorter: true,
        // render: val => `${val} （万元）`,
      },
      {
        title: '金额（万元）',
        dataIndex: 'amount',
        align: 'right',
        sorter: true,
        render: val => `${val.toFixed(2)}`,
      },
      {
        title: '经费渠道',
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
      //   render(val) {
      //     return <Badge status={statusMap[val]} text={val} />;
      //   },
      },
      {
        title: '计划日期',
        dataIndex: 'date',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '更新日期',
        dataIndex: 'updatedAt',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '操作',
        //dataIndex: 'operation',
        //record中是list中的一条记录
        render: (text, record) => {
          const menu = (
            <Menu>
              <Menu.Item> <a onClick={() => this.onEdit(record)}>编辑</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>启动</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>采购</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>到货</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>完成</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>取消</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>暂停</a></Menu.Item>
              <Menu.Item> <a onClick={() => this.onTrack(record)}>恢复</a></Menu.Item>
              <Menu.Item>
                <Popconfirm title="Sure to delete?" onConfirm={() => this.onRemove(record)}>
                  <a href="#">删除</a>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          );
          return (
            <Fragment>
            {/* <Authorized authority={['user', 'admin']}> */}
              <a onClick={() => this.onHas(record)}>需求</a>
              <Divider type="vertical" />
              <Dropdown overlay={menu}>
                <a href="#">
                  <Icon type="ellipsis" />
                </a>
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
                  <Button icon="plus" type="primary" onClick={() => this.onCreate()}>新计划项</Button>
                  {/* <Button icon="plus" type="primary" onClick={() => this.onCreate('设备')}>新设备计划项</Button>
                  <Button icon="plus" type="primary" onClick={() => this.onCreate('软件')}>新软件计划项</Button> */}
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
