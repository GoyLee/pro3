import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
// import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import RenderAuthorized from '../../components/Authorized';
import {Tabs, Tree, Layout, Row, Col, Card, Form, Alert, Badge, Divider, Popconfirm, 
    Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import PartyForm from '../Forms/PartyForm';
//import { toTreeData } from '../../utils/utils';
import styles from './TableList.less';
// import {saveAs} from 'file-saver';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const { Header, Content, Footer, Sider } = Layout;
const { TabPane } = Tabs;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
const TreeNode = Tree.TreeNode;

@connect(({ party, user, loading, }) => ({
  party,
  authority: user.currentUser.authority,
  deptTree: party.dept.list,
  tagTree: party.tag.list,
  loading: loading.models.party,
}))
@Form.create()
export default class PartyList extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框

    expandForm: false,
    collapsed: false,
    formValues: {}, //search conditions from search forms
    //for standardlist
    selectedRows: [],
    queryParams: {}, 
    //sorter: '',
    //selectedDept: '',
    
    //for dept tree
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    selectedKeys: [],
    //treeSelectValue: '',
  };
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'party/fetch', });
    dispatch({ type: 'party/fetchDeptTree', });
    dispatch({ type: 'party/fetchTagTree', });
  }
// for record updating, coupled with PartyForm.js--------------------------------------------------------
  handleModalVisible = (flag, isRecordUpdated) => {
    this.setState({
      modalVisible: flag,
    });
    if(isRecordUpdated) {
      this.props.dispatch({
        type: 'party/fetch',
        payload: this.state.queryParams, 
      });
      this.props.dispatch({ type: 'party/fetchDeptTree', });
      this.props.dispatch({ type: 'party/fetchTagTree', });
    }
  }
  onCreate = (obj) => { //新增记录
    this.props.dispatch({ type: 'party/setRecord', payload: obj, }); //清空缓存
    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    //承接后端mongoose.populate()的字段，提取_id, 还原为原数据库中的字段
    const r = {...record, tags: record.tags.map(o => o._id)};
    this.props.dispatch({type: 'party/setRecord', payload: r, });
    this.handleModalVisible(true);
  }
  onRemove = (record) => { //删除记录
    this.props.dispatch({
      type: 'party/remove',
      payload: {id: record._id}, // {
    });
    this.props.dispatch({
      type: 'party/fetch',
      payload: this.state.queryParams, 
    });
    this.props.dispatch({ type: 'party/fetchDeptTree', });
    this.props.dispatch({ type: 'party/fetchTagTree', });
  }

// for search form ---------------------------------------------------------------------------
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
        type: 'party/fetch',
        payload: params, //不能用queryParams, 因其是异步更新，现在还是旧值！
      });
    });
  }
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      //formValues: {},
      queryParams: {},
    });
    dispatch({ type: 'party/fetch', payload: {}, });
  }

  toggleFormtoggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="名称">
              {getFieldDecorator('username')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="类别">
              {getFieldDecorator('type')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="标签">标签</Option>
                  <Option value="员工">员工</Option>
                  <Option value="部门">部门</Option>
                  {/* <Option value="正常">正常</Option>
                  <Option value="离职">离职</Option>
                  <Option value="兼职">兼职</Option>
                  <Option value="停职">停职</Option> */}
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
            <FormItem label="名称">
              {getFieldDecorator('no')(
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
              {getFieldDecorator('date')(
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
// Render and handle Department & Tags Tree---------------------------------------------------------------------------
  onExpand = (expandedKeys) => {
    //console.log('onExpand', arguments);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  //onCheck = (checkedKeys) => {
    //console.log('onCheck', checkedKeys);
    //message.success(checkedKeys);
  //  this.setState({ checkedKeys });
  //}
  onDeptSelect = (selectedKeys, info) => {
    //console.log('onSelect', info);
    // eslint-disable-next-line
    //alert(selectedKeys);
    //message.success('info:' +JSON.stringify(info.event));
    //if(info.selected) { //TreeNode‘s selected 是开关键，连续的2个点击中，第1次是选中，第2次是未选
      //message.success('Keys:' +selectedKeys[0]);
      var params = {
        ...this.state.queryParams,
        selectedDept: selectedKeys[0],// || this.state.selectedDept,
        selectedTag: null, //需和Dept互斥
      };
      // message.success(JSON.stringify(params));
      this.setState({ queryParams: params}) //dva/redux this.setstate()是异步的，本次调用状态是不变的！下次状态才会变!
      //message.success(selectedKeys.length);
      //message.success(params.selectedDept);
      this.props.dispatch({
        type: 'party/fetch',
        payload: params,
      });
      this.setState({ selectedKeys });
    //}
  }
  onTagSelect = (selectedKeys, info) => {
    //console.log('onSelect', info);
    // eslint-disable-next-line
    //alert(selectedKeys);
    //message.success('info:' +JSON.stringify(info.event));
    //if(info.selected) { //TreeNode‘s selected 是开关键，连续的2个点击中，第1次是选中，第2次是未选
      //message.success('Keys:' +selectedKeys[0]);
      var params = {
        ...this.state.queryParams,
        selectedDept: null,
        selectedTag: selectedKeys[0],// //需和Dept互斥
      };
      // message.success(JSON.stringify(params));
      this.setState({ queryParams: params}) //dva/redux this.setstate()是异步的，本次调用状态是不变的！下次状态才会变!
      //message.success(selectedKeys.length);
      //message.success(params.selectedDept);
      this.props.dispatch({
        type: 'party/fetch',
        payload: params,
      });
      this.setState({ selectedKeys });
    //}
  }
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.label} key={item.value} disableCheckbox>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.label} key={item.value}  disableCheckbox/>;
    });
  }
  //{...item} dataRef={item}
  renderTree(list, type) {
    const { loading } = this.props;
    //var treeData = list.map( (item) => {return {title:item.username, key: item._id,};} );
    //var treeData = toTreeData(list);
    //alert(JSON.stringify(list));
    //checkable
    //onCheck={this.onCheck}
    //checkedKeys={this.state.checkedKeys}
    //message.success("renderDept......");
    return (
      <Tree
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        loading={loading}
        onSelect={type ? this.onDeptSelect : this.onTagSelect}
        selectedKeys={this.state.selectedKeys}
        defaultExpandAll={true}
      >
        {this.renderTreeNodes(list)}
      </Tree>
    );
  }

// Render and handle the List-------------------------------------------------------------------------------------
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
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
      type: 'party/fetch',
      payload: params,
    });
    //dispatch({
    //   type: 'party/fetchDeptTree',
    //});
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'party/remove',
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
  // onDownload = () => { //新增记录
  //   this.props.dispatch({ type: 'party/fetchExcel', payload: {}, });
  // }
  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  
  render() {
    const { party: { data, blobExcel }, loading , authority} = this.props;
    const { deptTree, tagTree } = this.props;
    const { selectedRows, modalVisible } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );
    //权限控制！
    const Authorized = RenderAuthorized(authority);

    const status = ['正常', '临时', '终止', '暂停'];
    const statusMap = {'暂停':'default', '临时':'processing', '正常':'success', '终止':'error'};  

    const columns = [
      {
        title: '编号',
        dataIndex: 'code',
      },
      {
        title: '名称',
        dataIndex: 'username',
      },
      {
        title: '标签',
        dataIndex: 'tags',
        // dataIndex: 'tagRecords',
        render(val) {
          return  <span>{val.map(o => o.username).join('、')}</span>;
        }
      },
      {
        title: '类别',
        dataIndex: 'type',
        sorter: true,
        //align: 'right',
        //render: val => `${val} 万`,
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
          return (
            // <Fragment>
              <Authorized authority={['user', 'admin']}>
                <a onClick={() => this.onEdit(record)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm title="Sure to delete?" onConfirm={() => this.onRemove(record)}>
                  <a href="#">删除</a>
                </Popconfirm>
              </Authorized>             
            // </Fragment>
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
    ];

    // href="/api/partyexcel" //this works!!!
    // onClick={() => this.onDownload()} //cancelled.
    //href={window.URL.createObjectURL(new Blob([blobExcel?blobExcel.body:"try again"], {type: "application/octet-stream"}))} download="newName.txt"
    return (
      <PageHeaderLayout title="组织机构和人员">
        <Layout>
          <Sider width={250} style={{ background: '#fff', margin: 2}}>
            <Tabs defaultActiveKey="2" size='small'>
              <TabPane tab="部门" key="1">
                {this.renderTree(deptTree, true)}
              </TabPane>
              <TabPane tab="标签" key="2">
                {this.renderTree(tagTree, false)}
              </TabPane>
            </Tabs>          
          </Sider>
          <Content style={{ background: '#fff', margin: 2}}>
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListForm}>
                  {this.renderForm()}
                </div>
                <div className={styles.tableListOperator}>
                  <Button icon="plus" type="primary" onClick={() => this.onCreate({type:'员工'})}>新建员工</Button>
                  <Button icon="plus" onClick={() => this.onCreate({type:'部门'})}>新建部门</Button>
                  <Button icon="plus" onClick={() => this.onCreate({type:'标签'})}>新建标签</Button>
                  <Button icon="download" type="primary" href="/api/partyexcel">
                    导出Excel
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
                  columns={columns}
                  loading={loading}
                  data={data}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          </Content>
          <PartyForm
            handleModalVisible={this.handleModalVisible}
            modalVisible={modalVisible}
          />
        </Layout>
      </PageHeaderLayout>
    );
  }
}
