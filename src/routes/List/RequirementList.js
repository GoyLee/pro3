import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { TreeSelect, Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import RequirementTable from '../../components/RequirementTable';
import ReqForm from '../Forms/ReqForm';
import EventForm from '../Forms/EventForm';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const { Header, Content, Footer, Sider } = Layout;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
//const TreeNode = Tree.TreeNode;

@connect(({ requirement, loading, user }) => ({
  requirement,
  loading: loading.models.requirement,
  currentUser: user.currentUser,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框
    eventModalVisible: false, //是否显示事件列表的对话框

    expandForm: false,
    collapsed: false,
    //for standardlist
    selectedRows: [],
    queryParams: {}, //search conditions from search forms and requirementTable
  };
  
  componentDidMount() {
    // eslint-disable-next-line
    // alert(global.currentUser.name);
    const { dispatch } = this.props;
 
    dispatch({
      type: 'requirement/fetch',
    });

    //dispatch({ // Myy
    //  type: 'user/changeUserName',
    //  payload: 'Hello World',
    //});
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
                  <Option value="正常">正常</Option>
                  <Option value="离职">离职</Option>
                  <Option value="兼职">兼职</Option>
                  <Option value="停职">停职</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
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
    const { currentUser } = this.props;
    const name = currentUser.name;
    this.props.dispatch({ type: 'party/fetchUserList', payload: {username: name}, });    
    this.props.dispatch({ type: 'party/setUser', payload: name, }); // 缺省需求人是currentUser
    this.props.dispatch({ type: 'party/fetchUserDept', payload: {id: currentUser.pid}, });
    
    //初始化“需求”记录
    const record = {reqname: '', program:'试飞一体化平台', type:'应用', status:'正常'}; //设定默认值
    this.props.dispatch({ type: 'requirement/setRecord', payload: record, });
    
    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    this.props.dispatch({ type: 'party/setUser', payload: record.demander, }); 
    this.props.dispatch({ type: 'party/saveUserDept', payload: {username: record.department}, });   
    //this.props.dispatch({ type: 'party/fetchUserDept', payload: {id:record.pid}, });
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
  //for requirements tracking, coupled with EventForm.js-------------------------------------------------
  handleEventModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      eventModalVisible: flag,
    });
    if(isRecordUpdated) {
      this.props.dispatch({
        type: 'requirement/fetch',
        payload: this.state.queryParams, 
      });
    }
  }
  
  onTrack = (record) => { //跟踪事件
    this.props.dispatch({ type: 'event/fetch', payload: {pid: record._id}, });
    //this.props.dispatch({ type: 'party/setUser', payload: record.demander, }); 
    //this.props.dispatch({ type: 'party/saveUserDept', payload: {username: record.department}, });   
    //this.props.dispatch({ type: 'party/fetchUserDept', payload: {id:record.pid}, });
    //this.props.dispatch({ type: 'requirement/setRecord', payload: record, }); //保存到store
    //this.setState({recordNew: false});
    this.handleEventModalVisible(true);
  }

// Render the List--------------------------------------------------------------------------
  render() {
    const { requirement: { data }, loading } = this.props;
    const { selectedRows, modalVisible, eventModalVisible } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

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
                <RequirementTable
                  selectedRows={selectedRows}
                  loading={loading}
                  data={data}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                  onEdit={this.onEdit}
                  onTrack={this.onTrack}
                  onRemove={this.onRemove}
                  />
              </div>
        </Card>
        <ReqForm
            handleModalVisible={this.handleModalVisible}
            modalVisible={modalVisible}
        />
        <EventForm
            handleModalVisible={this.handleEventModalVisible}
            modalVisible={eventModalVisible}
        />
      </PageHeaderLayout>
    );
  }
}
