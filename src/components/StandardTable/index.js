import React, { PureComponent } from 'react';
import { Table, Alert, message } from 'antd';
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
      return sum + ( val.amount ? parseFloat(val.amount, 10) : 0 ); //amount应改成需要汇总的字段名
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
    const { columns, data: { list, pagination }, loading } = this.props;
    //message.success(JSON.stringify(pagination));
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
                已选额 <span style={{ fontWeight: 600 }}>{totalNumber.toFixed(2)}</span> 
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
export default StandardTable;
