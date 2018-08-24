import React from "react";
import ReactTable from "react-table";
import Messaging from '../../../lib/amdocs/ossui/ossui-messaging';
import {ProjectDetails} from "./projectDetails/ProjectDetails";
import "react-table/react-table.css";
import 'bootstrap/dist/css/bootstrap.css';
var counter = 0;

export class Projects extends React.Component {

    constructor (props) {
        super();
        this.state = {
            mountProjectDetails: false,
        }
    }

    expandRows() {
        this.setState({
            expanded : { 
                0: true,
                0: {
                    0: true,
                    1: true
                }
            }
        });
        counter = 0;
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
            <div className="container">
                {
                    counter <= 3? 
                    <ReactTable
                        expanded={this.state.expanded}
                        data={data}
                        columns={this.getColumns(currentObject)}
                        showPagination={false}
                        defaultPageSize={data.length}
                        className="-striped -highlight"
                        getTheadThProps={this.injectThProps}
                        getTdProps={(state, rowInfo, column, instance) => {
                            return {
                              onClick: (e, handleOriginal) => {
                                if(column.Header === 'All') {
                                    //handleOriginal();
                                    this.expandRows();
                                } else {
                                    handleOriginal();
                                }
                              }
                            };
                        }}
                        SubComponent={(row) => currentObject.createSubComponent(row, currentObject)}
                    /> : 
                    <div>No more subchilds present....</div>
                }
            </div>
        );
    }

    mountProjectDetails(projectId) {
        
        var options = {
            targetUrl : Messaging.messageUtils.getTargetUrl(document.referrer),
            targetWindow : window.parent
        };
        var messageServiceFactory = Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, options);
        messageServiceFactory.publish({applicationName: 'Projects', payload: {projectId: projectId} }, 'portal.displayApplication');
    }

    fetchOrderDetails(event) {
        // TODO: try to find a better option for showing context store using the react pop
        // render() {
        //     return <p>
        //         Here are your options:
        //         <TriggeredModalForm trigger={
        //             <strong>Options</strong>
        //         } required onSubmit={this.handleSubmit}>
        //         <p>No way out until you choose.</p>
        //         <ul>
        //           <li><button type="submit">You must choose me.</button></li>
        //         </ul>
        //       </TriggeredModalForm>
        //     </p>;
        // }
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

    injectThProps = (state, rowInfo, column) => {
        return {
            style: { display: 'none' }
        }
    }

    getColumns(project) { 
        return [{
            //Header: "Project",
            columns: [{
                Header: "",
                accessor: "",
                expander: true,
            }, {
                Header: "All",
                accessor: "",
                expander: true,
                Expander: ({ isExpanded, ...rest }) =>
                    <div>
                        {isExpanded
                        ? <span>&#x2299;</span>
                        : <span>&#x2295;</span>}
                    </div>
                
            }, {
                Header: "Name",
                accessor: "name"
            }, {
                Header: "Id",
                accessor: "id",
                Cell: cellInfo => (
                    <button className="btn" >
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
            //Header: "Main Attributes",
            columns: [{
                Header: "OrderId",
                accessor: "orderId",
                Cell: cellInfo => (
                    <button className="btn" onClick={() => project.fetchOrderDetails()}>{cellInfo.row.orderId}</button>
                )
            }]
        }, {
            //Header: "Additional Info",
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

    getData() {
        return [{
            name:"Sales",
            id: "Project3050",
            plan: 12345,
            parent: "-",
            status: "In Progress",
            orderId: 1,
            start: "03/08/2018",
            complete: "-"
        }, {
            name:"Site",
            id: "Project3118",
            plan: 54321,
            parent: "Project1",
            status: "Completed",
            orderId: 2,
            start: "03/08/2018",
            complete: "04/08/2018"
        }];
    }

    render() {
        var data = [{
            name:"Sales",
            id: "Project1964",
            plan: 12345,
            parent: "-",
            status: "In Progress",
            orderId: 1,
            start: "03/08/2018",
            complete: "-"
        }, {
            name:"Site",
            id: "Project2983",
            plan: 54321,
            parent: "Project1",
            status: "Completed",
            orderId: 2,
            start: "03/08/2018",
            complete: "04/08/2018"
        }];
        
        var projectDetailsCmp = "";

        return (
            <div>
                <div className="container">
                    { 
                        this.state.mountProjectDetails? 
                        <div className="container">
                            <img className="btn" src="app/img/back.png" onClick={this.mountProjectDetails.bind(this)}></img>
                            <ProjectDetails /> 
                        </div> :
                        <ReactTable
                            data={this.getData(this)}
                            expanded={this.state.expanded}
                            columns={this.getColumns(this)}
                            defaultPageSize={data.length}
                            className="-striped -highlight"
                            getTdProps={(state, rowInfo, column, instance) => {
                                return {
                                  onClick: (e, handleOriginal) => {
                                    console.log("A Td Element was clicked!");
                                    console.log("it produced this event:", e);
                                    console.log("It was in this column:", column);
                                    console.log("It was in this row:", rowInfo);
                                    console.log("It was in this table instance:", instance);
                                    
                                    // instance.setState({
                                    //     expanded: {
                                    //         [rowInfo.index]: !instance.state.expanded[rowInfo.index]
                                    //     }
                                    // });

                                    console.log("It was in this table instance:", instance);
                                    // IMPORTANT! React-Table uses onClick internally to trigger
                                    // events like expanding SubComponents and pivots.
                                    // By default a custom 'onClick' handler will override this functionality.
                                    // If you want to fire the original onClick handler, call the
                                    // 'handleOriginal' function.
                                    if(column.Header == 'Id') {
                                        this.mountProjectDetails(rowInfo.row.id);
                                    } else if(column.Header === 'All') {
                                        //handleOriginal();
                                        this.expandRows();
                                    } else {
                                        handleOriginal();
                                    }
                                  }
                                };
                            }}
                            SubComponent={(row) => this.createSubComponent(row, this)}
                        />
                    }
                    <br />
                </div>
                
            </div>
        );
    }
}
