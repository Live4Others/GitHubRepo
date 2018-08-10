import React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";
import 'bootstrap/dist/css/bootstrap.css';

function getColumns(project) { 
    return [{
        Header: "Activity",
        columns: [{
            Header: "Name",
            accessor: "name"
        }, {
            Header: "Id",
            accessor: "id",
            Cell: cellInfo => (
                <button className="btn">
                    {cellInfo.row.id}
                </button>
            )
        }, {
            Header: "Predecessor",
            accessor: "parent",
        }, {
            Header: "Successor",
            accessor: "plan",
        }]
    }, {
        Header: "Additional Info",
        columns: [{
            Header: "Status",
            accessor: "status"
        }, {
            Header: "Started",
            accessor: "start"
        }, {
            Header: "Completed",
            accessor: "complete"
        }]
    }];
}
export class ActivityDetails extends React.Component {

    constructor (props) {
        super();
       
    }

    render() {
        var data = [{
            name:"Sales",
            id: "Project1",
            plan: 12345,
            parent: "-",
            status: "In Progress",
            orderId: 1,
            start: "03/08/2018",
            complete: "-"
        }, {
            name:"Site",
            id: "Project2",
            plan: 54321,
            parent: "Project1",
            status: "Completed",
            orderId: 2,
            start: "03/08/2018",
            complete: "04/08/2018"
        }];
        
        return (
            <div>
                <div className="container">
                    { 
                        <ReactTable
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
