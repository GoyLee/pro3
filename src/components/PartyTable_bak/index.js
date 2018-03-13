import React, { PureComponent, Fragment } from 'react';
import moment from 'moment';
import { Table, Alert, Badge, Divider, Popconfirm, message } from 'antd';
import styles from './index.less';


class StandardTable extends PureComponent {
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

  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  }

  render() {
    const { selectedRowKeys, totalNumber } = this.state;
    const { data: { list, pagination }, loading } = this.props;


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
                总数 <span style={{ fontWeight: 600 }}>{pagination.total}</span> 个&nbsp;&nbsp;
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
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
          columns={columns}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          size="small"
        />
      </div>
    );
  }
}

export default StandardTable;
