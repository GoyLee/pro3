import React, { PureComponent, Fragment } from 'react';
import moment from 'moment';
import { Table, Alert, Menu, Badge, Dropdown, Icon, Divider, Popconfirm, message } from 'antd';
import styles from './index.less';

class RequirementTable extends PureComponent {
  state = {
    selectedRowKeys: [],
    totalNumber: 0, //可用于显示表格中已选择行的某数量字段的汇总值
  };
  
  componentWillReceiveProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      this.setState({
        selectedRowKeys: [],
        totalNumber: 0,
      });
    }
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    const totalNumber = selectedRows.reduce((sum, val) => {
      return sum + 1; //parseFloat(val.amount, 10); //amount应改成需要汇总的字段名
    }, 0);

    if (this.props.onSelectRow) {
      this.props.onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, totalNumber });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.onChange(pagination, filters, sorter);
  }

  handleRow = (record, index) => {
    //message.success(index + ':' + JSON.stringify(record));
    //record = {...record, no: index};
  }

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  }

  render() {
    const { selectedRowKeys, totalNumber } = this.state;
    const { data: { list, pagination }, loading } = this.props;
    //message.success(JSON.stringify(pagination));
    const statusMap = {'挂起':'default', '正常':'processing', '关闭':'success', '取消':'error'};  
    const status = ['正常', '关闭', '挂起', '取消'];
    
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
        title: '需求',
        dataIndex: 'reqname',
        width: 500,
      },
      {
        title: '标签',
        dataIndex: 'tagRecords',
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
          const menu = (
            <Menu>
              <Menu.Item>
                <a onClick={() => this.props.onEdit(record)}>编辑</a>
              </Menu.Item>
              <Menu.Item>
                <Popconfirm title="Sure to delete?" onConfirm={() => this.props.onRemove(record)}>
                  <a href="#">删除</a>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          );
          return (
            <Fragment>
                <a onClick={() => this.props.onTrack(record)}>跟踪</a>
              <Divider type="vertical" />
              <Dropdown overlay={menu}>
                <a href="#">
                  <Icon type="ellipsis" />
                </a>
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

    //onDelete = (key) => {
    //  const dataSource = [...this.state.dataSource];
    //  this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
    //}
    //分页属性
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };


    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          <Alert
            message={(
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                需求总计 <span style={{ fontWeight: 600 }}>{pagination.total}</span> 个&nbsp;&nbsp;
                选择总额 <span style={{ fontWeight: 600 }}>{totalNumber}</span> 个
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
              </div>
            )}
            type="info"
            showIcon
          />
        </div>
        <Table
          loading={loading}
          rowKey={record => record._id}
          rowSelection={rowSelection}
          dataSource={list}
          bordered
          columns={columns}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          size="small"
          onRow={this.handleRow}
        />
      </div>
    );
  }
}
export default RequirementTable;
