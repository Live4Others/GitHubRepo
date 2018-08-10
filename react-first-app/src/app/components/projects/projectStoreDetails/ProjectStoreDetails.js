import React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";
import 'bootstrap/dist/css/bootstrap.css';

function getColumns(attributes) { 
    return [{
        Header: "OSS Attribute Store",
        columns: [{
            Header: "Code",
            accessor: "code",
            Cell: cellInfo => (
                attributes.renderDivCell(cellInfo.row.code)
            )
        }, {
            Header: "Value",
            accessor: "value",
            Cell: cellInfo => (
                attributes.renderEditable(cellInfo)
            )
        }, {
            Header: "Last Updated",
            accessor: "updated",
            Cell: cellInfo => (
                attributes.renderDivCell(cellInfo.row.updated)
            )
        }]
    }];
}
export class ProjectStoreDetails extends React.Component {

    constructor (props) {
        super();
        this.state = {};
    }

    renderEditable(cellInfo) {
        return (
          <input className="form-control"
            style={{ backgroundColor: "#fafafa" }}
            contentEditable
            suppressContentEditableWarning
            value = {this.state.data[cellInfo.index][cellInfo.column.id]}
            onChange={e => {
                console.log(cellInfo.row.value)
                const data = [this.state.data];
                if(e.target && e.target.value) {
                    data[cellInfo.index][cellInfo.index][cellInfo.column.id] = e.target.value;
                    data[cellInfo.index][cellInfo.index]['modified'] = true;
                    this.setState({ data });
                }
            }}
          />
        );
    }

    renderDivCell(value) {
        return (
          <div className="input-group-text">{value}</div>
        );
    }

    render() {
        var data = [{
            code:"CFS_Spec",
            value: "IP VPN Service",
            updated: "10/07/2018"
        }, {
            code:"Root_Order_Line_Action",
            value: "Provide",
            updated: "10/07/2018"
        }];
        this.state = {
            data: data
        }
        return (
            <div>
                <div className="container">
                    { 
                        <ReactTable
                            filterable
                            data={data}
                            columns={getColumns(this)}
                            defaultPageSize={10}
                            className="-striped -highlight"
                        />
                    }
                    <br />
                </div>
                
            </div>
        );
    }
}
