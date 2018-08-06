import React from "react";

import ReactTable from "react-table";
import {ProjectDetails} from "./ProjectDetails";
import "react-table/react-table.css";

function getColumns(project) { 
    return [{
        Header: "Project",
        columns: [{
            Header: "Name",
            accessor: "name"
        }, {
            Header: "Id",
            accessor: "id",
            Cell: cellInfo => (
                <button className="btn" onClick={() => project.mountProjectDetails()}>
                    {cellInfo.row.id}
                </button>
            )
        }, {
            Header: "Parent Project",
            accessor: "parent",
        }, {
            Header: "Plan",
            accessor: "plan",
        }]
    }, {
        Header: "Main Attributes",
        columns: [{
            Header: "OrderId",
            accessor: "orderId",
            Cell: cellInfo => (
                <button className="btn" onClick={() => project.fetchOrderDetails()}>{cellInfo.row.orderId}</button>
            )
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
export class Projects extends React.Component {

    constructor (props) {
        super();
        this.state = {
            mountProjectDetails: false
        }
    }

    mountProjectDetails(event) {
        this.setState({
            mountProjectDetails: !this.state.mountProjectDetails
        });
    }

    fetchOrderDetails(event) {
        var contextStoreElement = $("#contextStore");
        contextStoreElement[0].style.display='block';
        contextStoreElement[0].innerHTML = 'hey this is me';
        contextStoreElement.dialog({
            modal: true,
            buttons: {
                Ok: function() {
                    $( this ).dialog("close");
                }
            }
        });
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
        
        var projectDetailsCmp = "";
        if(this.state.mountProjectDetails) {
            projectDetailsCmp = <ProjectDetails />
        }

        return (
            <div>
                <div className="container">
                    <ReactTable
                        data={data}
                        columns={getColumns(this)}
                        defaultPageSize={10}
                        className="-striped -highlight"
                        SubComponent={row => {
                            return (
                                <div style={{ padding: "10px" }}>
                                    <ReactTable
                                        data={data}
                                        columns={getColumns(this)}
                                        showPagination={false}
                                        defaultPageSize={2}
                                        className="-striped -highlight"
                                    />
                                </div>
                            );
                        }}
                    />
                    <br />
                </div>
                {projectDetailsCmp}
            </div>
        );
    }
}
