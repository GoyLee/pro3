import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Tabs, Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import PartyForm from '../Forms/PartyForm';
//import { toTreeData } from '../../utils/utils';
import styles from './TableList.less';
import {saveAs} from 'file-saver';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const { Header, Content, Footer, Sider } = Layout;
const { TabPane } = Tabs;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
const TreeNode = Tree.TreeNode;

@connect(({ party, loading, }) => ({
  party,
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

  onCreate = () => { //新增记录
    this.props.dispatch({ type: 'party/setRecord', payload: {}, });
    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    this.props.dispatch({
      type: 'party/setRecord',
      payload: record, // {
    });
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
// Render and handle the Department Tree---------------------------------------------------------------------------
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
  onDownload = () => { //新增记录
    this.props.dispatch({ type: 'party/fetchExcel', payload: {}, });
    // const { party: { blobExcel }, loading } = this.props;
    // var link = document.createElement('a');
    // link.href = window.URL.createObjectURL(new Blob([blobExcel], {type: "application/octet-stream"}));
    // link.download = "test777.txt";
    // link.click();
    // window.URL.revokeObjectURL(link.href);

    // window.open("localhost:7001/partyexcel");
    
    // window.location.href="localhost:7001/partyexcel"

    // var elemIF = document.createElement("iframe");   
    // elemIF.src = "localhost:7001/partyexcel";   
    // elemIF.style.display = "none";   
    // document.body.appendChild(elemIF);   
    // var blob = new Blob(["欢迎访问 hangge.com"], {type: "text/plain;charset=utf-8"});
    // saveAs(blob, "test123.txt");

  // var Stream = new ActiveXObject("ADODB.Stream");
  // var adTypeBinary=1,adTypeText=2;
  // Stream.Type = adTypeText;
  // Stream.CharSet = "iso-8859-1";
  // Stream.Open();
  // //Stream.WriteText("\x00\x01\x02\xff\xff");
  // for(var i=0;i<256;i++){
  //   Stream.WriteText(String.fromCharCode(i));
  //   //Stream.WriteText(bin[i]);
  // }
  // Stream.SaveToFile("D:\\test.txt", 2);
  // Stream.Quit();
  // Stream = null;
  }
  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }
  render() {
    const { party: { data, blobExcel }, loading } = this.props;
    const { deptTree, tagTree } = this.props;
    const { selectedRows, modalVisible } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );
    // href="/api/partyexcel" //this works!!!
    // onClick={() => this.onDownload()} //cancelled.
    //href={window.URL.createObjectURL(new Blob([blobExcel?blobExcel.body:"try again"], {type: "application/octet-stream"}))} download="newName.txt"
    return (
      <PageHeaderLayout title="组织机构和人员">
        <Layout>
          <Sider width={250} style={{ background: '#fff', margin: 2}}>
            <Tabs defaultActiveKey="1" size='small'>
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
                  <Button icon="plus" type="primary" onClick={() => this.onCreate()}>
                    新建
                  </Button>
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
                  loading={loading}
                  data={data}
                  onSelectRow={this.handleSelectRows}
                  onChange={this.handleStandardTableChange}
                  onEdit={this.onEdit}
                  onRemove={this.onRemove}
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
