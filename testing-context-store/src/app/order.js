import React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";
import 'bootstrap/dist/css/bootstrap.css';

function getColumns() {
    return [{
        Header: "Order Details",
        columns: [{
            Header: "",
            accessor: "",
            expander: true
        }, {
            Header: "Name",
            accessor: "name",
            Cell: cellInfo => (
                <button className="btn" onClick={() => alert('hi')}>
                    {cellInfo.row.name}
                </button>
            )
        }]
    }];
}

var counter = 0;

export class Order extends React.Component {

    constructor (props) {
        super();
    }

    createSubComponent(row, currentObject) {
        counter ++;
        var data = [{
            name:"Sales",
            id: "Project1",
            plan: 12345,
            parent: "-",
            status: "In Progress",
            orderId: 1,
            start: "03/08/2018",
            complete: "-"
        }];
        return (
            <div className="container">
                {
                    counter <= 3? 
                    <ReactTable
                        data={data}
                        columns={getColumns()}
                        showPagination={false}
                        defaultPageSize={data.length}
                        className="-striped -highlight"
                        SubComponent={(row) => currentObject.createSubComponent(row, currentObject)}
                    /> : 
                    <div>No more subchilds present....</div>
                }
            </div>
        );
    }

    render() {
        var data = [{
            name:"Sales",
            id: "Project1"
        }];
        
        var projectDetailsCmp = "";

        return (                 
            <ReactTable
                data={data}
                columns={getColumns(this)}
                defaultPageSize={data.length}
                showPagination={false}
                className="-striped -highlight"
                SubComponent={(row) => this.createSubComponent(row, this)}
            />
        );
    }
}
