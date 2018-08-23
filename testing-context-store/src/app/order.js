import React from "react";

import ReactTable from "react-table";
import TreeView from 'treeview-react-bootstrap';

import "react-table/react-table.css";
import 'bootstrap/dist/css/bootstrap.css';


export class Order extends React.Component {

    constructor (props) {
        super();
    }

    onClick(data, node) {
        console.log(data);
        console.log(node);
    }

    componentDidUpdate(nextProps, nextState) {
        console.log(nextProps);
        console.log(nextState);
    }

    render() {
        var data = [{
            name:"Sales",
            id: "Project1"
        }];

        var tree = [
            {
              text: "Parent 1",
              nodes: [
                {
                  text: "Child 1",
                  nodes: [
                    {
                      text: "Grandchild 1"
                    },
                    {
                      text: "Grandchild 2"
                    }
                  ]
                },
                {
                  text: "Child 2"
                }
              ]
            },
            {
              text: "Parent 2"
            }
          ];
        
        var projectDetailsCmp = "";

        return (                 
            // <ReactTable
            //     data={data}
            //     columns={getColumns(this)}
            //     defaultPageSize={data.length}
            //     showPagination={false}
            //     className="-striped -highlight"
            //     SubComponent={(row) => this.createSubComponent(row, this)}
            // />
            <TreeView data={tree} selectable={false} onClick={this.onClick.bind(this)}/>
        );
    }
}
