import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { TreeSelect, Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
import RequirementTable from '../../components/RequirementTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
//import { toTreeData } from '../../utils/utils';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const { Header, Content, Footer, Sider } = Layout;
//const SubMenu = Menu.SubMenu;
//const TreeNode2 = TreeSelect.TreeNode;
//const TreeNode = Tree.TreeNode;

//CreateForm = Form.create()((props) => {
@connect(({requirement, party, user}) => ({
  demander: requirement.demander,
  record: requirement.record,
  userList: party.userList,
  currentUser: user.currentUser,
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
class PartyForm extends PureComponent {
  //state = {
    //demanderValue: '',
  //};

  okHandle = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { userList, record } = this.props;
      //const user = userList.find((element) => (element.username === this.props.demander));
      fieldsValue = { 
        ...record,  //装填未更改字段
        ...fieldsValue,
        demander: this.props.demander, //user._id,
        department: this.props.userDept.username, //._id,
      }
     
      //this.props.dispatch({ type: 'requirement/setRecord', payload: fieldsValue, });
      //修改数据库
      this.props.handleAdd(fieldsValue);
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
    this.props.dispatch({ type: 'requirement/setDemander', payload: value,}); 
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
  
  render(){
    const { demander, userDept, userList, record, modalVisible, form, handleAdd, handleModalVisible } = this.props; //deptTree,
    //const options = userList.map(d => <Option key={d._id}>{d.username}</Option>);
    return (
      <Modal title="信息化需求" visible={modalVisible} onOk={this.okHandle} onCancel={() => handleModalVisible()}>
        <pre className="language-bash"> {JSON.stringify(record, null, 2)} </pre>
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

@connect(({ requirement, loading, user }) => ({
  requirement,
  loading: loading.models.requirement,
  currentUser: user.currentUser,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false, //是否显示编辑记录的对话框
    //recordNew: true, //是否“新增”记录
    expandForm: false,
    collapsed: false,
    //formValues: {}, //search conditions from search forms
    //for standardlist
    selectedRows: [],
    queryParams: {}, 
  };
  
  componentDidMount() {
    // eslint-disable-next-line
    // alert(global.currentUser.name);
    const { dispatch } = this.props;
    //dispatch({
    //  type: 'requirement/fetchDept',
    //});

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
    //dispatch({
    //   type: 'requirement/fetchDept',
    //});
  }

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

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
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

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
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

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }
/*
  handleFormChange = (changedFields) => {
    this.setState({
      fields: { ...this.state.fields, ...changedFields },
    });
  }
*/
  handleAdd = (fields) => {
    if(this.props.requirement.record._id) { //Update exist record
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
    //this.props.dispatch({
    //  type: 'requirement/fetchDept',
    //});
    this.props.dispatch({
      type: 'requirement/fetch',
      payload: this.state.queryParams, 
    });
    message.success('添加成功:' + JSON.stringify(fields));
    this.setState({
      modalVisible: false,
    });
  }
  onCreate = () => { //新增记录
    //this.setState({recordNew: true});
    //message.success(JSON.stringify(currentUser));
    const { currentUser } = this.props;
    this.props.dispatch({ type: 'party/fetchUserDept', payload: {id: currentUser.pid}, });
    
    const name = currentUser.name;
    this.props.dispatch({ type: 'party/fetchUserList', payload: {username: name}, });    
    this.props.dispatch({ type: 'requirement/setDemander', payload: name, }); // 缺省需求人是currentUser
    
    
    const record = {reqname: '', program:'试飞一体化平台', type:'应用', status:'正常'};
    this.props.dispatch({ type: 'requirement/setRecord', payload: record, });
    
    this.handleModalVisible(true);
  }
  onEdit = (record) => { //修改记录
    this.props.dispatch({ type: 'requirement/setDemander', payload: record.demander, }); 
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
  onSelect = (selectedKeys, info) => {
    //console.log('onSelect', info);
    // eslint-disable-next-line
    //alert(selectedKeys);
    //message.success('info:' +JSON.stringify(info.event));
    //if(info.selected) { //TreeNode‘s selected 是开关键，连续的2个点击中，第1次是选中，第2次是未选
      //message.success('Keys:' +selectedKeys[0]);
      var params = {
        ...this.state.queryParams,
        selectedDept: selectedKeys[0],// || this.state.selectedDept,
      };
      message.success(JSON.stringify(params));
      this.setState({ queryParams: params}) //dva/redux this.setstate()是异步的，本次调用状态是不变的！下次状态才会变!
      //message.success(selectedKeys.length);
      //message.success(params.selectedDept);
      this.props.dispatch({
        type: 'requirement/fetch',
        payload: params,
      });
      this.setState({ selectedKeys });
    //}
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="需求">
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
            <FormItem label="需求">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
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
  
  render() {
    const { requirement: { data }, loading } = this.props;
    const { selectedRows, modalVisible } = this.state;

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量审批</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

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
                  onRemove={this.onRemove}
                  />
              </div>
        </Card>
        <PartyForm
            {...parentMethods}
            modalVisible={modalVisible}
        />
      </PageHeaderLayout>
    );
  }
}
