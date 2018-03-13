import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { TreeSelect, Row, Col, Card, Form, Input, Select, Icon, 
  Radio, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message } from 'antd';
  //import { toTreeData } from '../../utils/utils';
  
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
@connect(({implement, requirement, party, user}) => ({
  record: implement.record,
  pRecord: requirement.record,
  tagTree: party.tag.list,
  classList: party.classList,
  currentUser: user.currentUser.name,
  // loading: loading.models.implement,
}))
@Form.create({
  mapPropsToFields(props) { //绑定字段;
    //if(props.record._id) { //不空，是Update。要绑定values和fields。注意判断record对象是否为空对象的方法！不能用record==={}！
      return {
        //每个form.getFieldDecorator的字段都需map
        budgetyear: Form.createFormField({ ...props.record.budgetyear, value: props.record.budgetyear,}),
        name: Form.createFormField({ ...props.record.name, value: props.record.name,}),
        spec: Form.createFormField({ ...props.record.spec, value: props.record.spec,}),
        quantity: Form.createFormField({ ...props.record.quantity, value: props.record.quantity,}),
        price: Form.createFormField({ ...props.record.price, value: props.record.price,}),
        amount: Form.createFormField({ ...props.record.amount, value: props.record.amount,}),
        tags: Form.createFormField({ ...props.record.tags, value: props.record.tags,}),
        date: Form.createFormField({ ...props.record.date, value: moment(props.record.date, 'YYYY-MM-DD')}),
      };
    //}
  },
  onValuesChange(_, values) {
    // console.log(values);
  },
})
export default class ImplForm extends PureComponent {
  state = {
    // amountValue: 0,
    // tagTreeSelectValue: [],
  };
  // componentDidMount() {
  //   const { pRecord, dispatch} = this.props;
  //   eslint-disable-next-line
  //   alert(global.currentUser.name);
    // if(pRecord.type === '设备')
    //   this.props.dispatch({ type: 'party/fetchPartyClass', payload: {class: '设备'}, });
  //   this.setState({demanderValue: this.props.currentUser.name});
  // }
  // onTagChange = (value) => {
  //   this.setState({tagTreeSelectValue: value});
  // }
  onPriceChange = (value) => {
    var q = this.props.form.getFieldValue('quantity');
    this.props.form.setFieldsValue({
      amount:  q * value,
    });
  }
  onQuantityChange = (value) => {
    var p = this.props.form.getFieldValue('price');
    this.props.form.setFieldsValue({
      amount:  p * value,
    });
  }
  okHandle = () => {
    const { record, pRecord, currentUser, handleModalVisible, dispatch } = this.props;

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) return;
      // user = user || {_id: '', pid: [] }; //防止原来的demander已被删除
      const fields = { 
        ...record,  //装填未更改字段
        ...fieldsValue, //装填可能更改的字段
        user: currentUser, //user._id,//缺省应有的字段：填写人
        updatedAt: Date.now(), //缺省应有的字段：更新时间。必须有，避免上一条记录的遗留痕迹
        __v: (record.__v ? record.__v+1 : 1), //缺省应有的字段：更新次数。
      }
      //修改数据库
      if(record._id) { //Update exist record
        this.props.dispatch({
          type: 'implement/update',
          payload: fields, 
        });    
      } else { //Create a new record
        this.props.dispatch({
          type: 'implement/add',
          payload: fields, // {
        });
      }
      setTimeout(function () {
        dispatch({ type: 'event/fetch', payload: {pid: pRecord._id}, });
        // message.success('更改成功:' + JSON.stringify(fields));
      }, 2000); //setTimeout()中不能用this指针
      handleModalVisible(false, true);
    });
  };

  handleSelect = (value) => {
    const { classList } = this.props;
    const item = classList.find((element) => (element.username === value));
    const p = item.price || 0
    this.props.form.setFieldsValue({
      price: p,
    });
    this.onPriceChange(p);
  } 

//render the form-----------------------------------------------------------------------------------------
  //<pre className="language-bash"> {JSON.stringify(record, null, 2)} </pre>
  render(){
    const { tagTree, record, classList, pRecord, modalVisible, form, handleModalVisible } = this.props; //deptTree,
    //const options = userList.map(d => <Option key={d._id}>{d.username}</Option>);
    return (
      <Modal title={record.type + '项 | 需求：' + pRecord.reqname} visible={modalVisible} onOk={this.okHandle} 
            onCancel={() => handleModalVisible(false, false)}>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="年度">
          {form.getFieldDecorator('budgetyear',{initialValue: '2018'})( 
            <Select  style={{ width: '100%' }}>
              <Option value="2018">2018年</Option>
              <Option value="2019">2019年</Option>
              <Option value="2020">2020年</Option>
              <Option value="2021">2021年</Option>
            </Select>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="标的">
          {form.getFieldDecorator('name',{
            // initialValue: pRecord.reqname,
            rules: [{ required: true, message: 'Please input the request...' }],
          })( 
            (pRecord.type === '软件' || pRecord.type === '设备') ? 
              <Select mode='combobox' onSelect={this.handleSelect} style={{ width: '100%' }}>
                {classList.map(d => <Option key={d.username}>{d.username}</Option>)}
              </Select>
            :
              <Input placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="规格">
          {form.getFieldDecorator('spec', {
            initialValue: '',
            rules: [{ required: false, message: 'Please input the spec.s...' }],
          })(
            <TextArea rows={4} placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="数量">
          {form.getFieldDecorator('quantity', {
            initialValue: 1,
            rules: [{ required: true, message: 'Please input quantity...' }],
          })(
            <InputNumber onChange={this.onQuantityChange} placeholder="请输入"/>
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="单价">
          {form.getFieldDecorator('price', { initialValue: 0} )(
              <InputNumber onChange={this.onPriceChange} step={1} precision={2}  placeholder="请输入"/>
          )}
          <label>（万元）</label>
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="总价">
          {form.getFieldDecorator('amount')(
            // <InputNumber disabled precision={2}/>
            <InputNumber disabled precision={2}/>
          )}
          <label>（万元）</label>
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="标签">
          {form.getFieldDecorator('tags', {
            rules: [{ required: false, message: 'Please input the tags...' }],
          })(
            // <Cascader options={tagTree} placeholder="Please select" showSearch changeOnSelect expandTrigger="hover" style={{ width: '100%' }}/>,
            // Tags需可多选，但antd cascader还不支持多选！还需用TreeSelect。
            <TreeSelect treeCheckable showCheckedStrategy='SHOW_CHILD' allowClear multiple 
              treeNodeFilterProp='label' 
              treeData={tagTree} showSearch searchPlaceholder='搜索标签'
              onChange={this.onTagChange} style={{ width: '100%' }} 
            />
          )}
        </FormItem>
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="完成日期">
          {form.getFieldDecorator('date')(
            <DatePicker/>
          )}
        </FormItem>
      </Modal>
    ); 
  }
  //    treeDefaultExpandAll   value={this.state.tagTreeSelectValue} 
  // , {initialValue: moment(Date.now().toString()).format('YYYY-MM-DD')}
}
