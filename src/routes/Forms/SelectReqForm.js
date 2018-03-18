import React, { PureComponent } from 'react';
import { connect } from 'dva';

import { TreeSelect, Tree, Layout, Row, Col, Card, Form, Input, Select, Icon, 
  Radio, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
  //import { toTreeData } from '../../utils/utils';
import StandardTable from '../../components/StandardTable';
  
import styles from '../List/TableList.less';
  
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
@connect(({requirement, party, user}) => ({
  // demander: party.user,
  record: requirement.record,
  data: requirement.data,
}))
@Form.create()
export default class SelectReqForm extends PureComponent {
  state = {
    selectedRows: [],
    queryParams: {}, //search conditions from search forms and requirementTable
  }

  okHandle = () => {
      const {  handleModalVisible, returnSelectedRows } = this.props;
      handleModalVisible(false, true);
      // message.success('更改成功:' + JSON.stringify(fields));
      returnSelectedRows(this.state.selectedRows);
      this.setState({selectedRows: []});
  };

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
    dispatch({
      type: 'requirement/fetch',
      payload: params,
    });
  }
  
  handleSelectRows = (rows) => {
    // message.success(JSON.stringify(rows));
    this.setState({
      selectedRows: rows,
    });
  }

  // componentDidMount() {
  //   eslint-disable-next-line
  //   alert(global.currentUser.name);
  //   this.props.dispatch({ type: 'party/fetchUserDept', payload: {}, });
  //   this.setState({demanderValue: this.props.currentUser.name});
  // }
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

//render the form-----------------------------------------------------------------------------------------
  render(){
    const { data, modalVisible, handleModalVisible } = this.props; //deptTree,
    const { selectedRows } = this.state;
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
        width: 500,
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
      // {
      //   title: '类别',
      //   dataIndex: 'type',
      //   sorter: true,
      //   //render: val => `${val} 万`,
      // },
      {
        title: '状态',
        dataIndex: 'state',
        sorter: true,
        //render: val => `${val} 万`,
      },
      // {
      //   title: '操作',
      //   width: 15,
      //   //dataIndex: 'operation',
      //   //record中是list中的一条记录
      //   render: (text, record) => {
      //     return (
      //       record.sid && (pRecord.state==='处理中' || pRecord.state ==='挂起') ?
      //         <Fragment>
      //            <a onClick={() => this.handleUpdateImpl(record)}>更新</a>
      //         </Fragment>
      //       :
      //         <Fragment>
      //           <a >----</a>
      //         </Fragment>
      //     );
      //   },
      // },
    ];

    //const options = userList.map(d => <Option key={d._id}>{d.username}</Option>);
    return (
      <Modal title="选择需求" visible={modalVisible} width="50%" 
          onOk={this.okHandle} onCancel={() => handleModalVisible(false, false)}>
        <div className={styles.tableListForm}>
          {this.renderSimpleForm()}
        </div>

        {/* <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="提出人">
          {form.getFieldDecorator('demander',
            {rules: [{ required: true, message: 'Please input the request...' }],}
          )( */}
        <StandardTable
          selectedRows={selectedRows}
          columns={columns}
          data={data}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
        />
          {/* )}        
        </FormItem> */}
      </Modal>
    ); 
    // value={this.state.tagTreeSelectValue} treeDefaultExpandAll
  }
}
