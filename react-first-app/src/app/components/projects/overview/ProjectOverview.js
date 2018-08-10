import React from "react";
import ReactDOM from 'react-dom';
import Graph from 'vis-react';
import "vis-react/node_modules/vis/dist/vis.css";
import 'bootstrap/dist/css/bootstrap.css';

var graph = {
    nodes: [
        {id: 1, label: 'Node 1', cid:1, group: 'users', title:'<button>1</button>'},
        {id: 2, label: 'Node 2', cid:1, group: 'users'},
        {id: 3, label: 'Node 3', group: 'users'},
        {id: 4, label: 'Node 4', group: 'users'},
        {id: 5, label: 'Node 5'}
      ],
    edges: [
        {from: 1, to: 2},
        {from: 1, to: 3},
        {from: 2, to: 4},
        {from: 2, to: 5}
      ]
  };

  var options = {
    layout: {
        improvedLayout: true,
        hierarchical: {
            direction: 'LR',
            sortMethod: 'directed' 
        }
    },
    edges: {
        color: "#000000"
    },
    autoResize: true,
    height: '500px',
    width: '100%',
    nodes: {
        fixed: false,
        font: '12px arial red',
        shadow: true
    },
    interaction:{
        dragNodes:true,
        dragView: true,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
        hover: false,
        hoverConnectedEdges: true,
        keyboard: {
          enabled: false,
          speed: {x: 10, y: 10, zoom: 0.02},
          bindToWindow: true
        },
        multiselect: false,
        navigationButtons: true,
        selectable: true,
        selectConnectedEdges: true,
        tooltipDelay: 300,
        zoomView: true
    },
    manipulation: {
        enabled: true,
        initiallyActive: true,
        addNode: true,
        addEdge: true,
        editNode: function() {

        },
        editEdge: true,
        deleteNode: true,
        deleteEdge: true,
        controlNodeStyle:{
          // all node options are valid.
        }
    },
    groups: {
        users: {
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf007',
                size: 50,
                color: '#aaaaaa'
            }
        }
    }
};

var events = {
    select: function(event) {
        var { nodes, edges } = event;
        console.log(event);
    },
   
    oncontext: function(a,b,c) {
        console.log(a);
        console.log(b);
        console.log(c);
    }
}

const myTreeData = [
    {
      name: 'Top Level',
      attributes: {
        keyA: 'val A',
        keyB: 'val B',
        keyC: 'val C',
      },
      children: [
        {
          name: 'Level 2: A',
          attributes: {
            keyA: 'val A',
            keyB: 'val B',
            keyC: 'val C',
          },
        },
        {
          name: 'Level 2: B',
        },
      ],
    },
  ];


  
export class ProjectOverview extends React.Component {
    constructor (props) {
        super();
        var network;
        var nodes;
        this.state = {
            key : 1,
            id: 1
        }
    }

    getNetwork(network) {
        this.network = network;
        console.log(this.network)
    }

    getNodes(nodes) {
        this.nodes = nodes;
        
    }

    componentDidMount() {
        var clusterOptions = {
            joinCondition:function(nodeOptions) {
              return nodeOptions.cid === 1;
            }
        };
        console.log(this.network);
        //console.log(this.network.clustering.cluster(clusterOptions));
    }

    render() {
        
        return (
            <div className="container">
                <Graph graph={graph} options={options} events={events} getNetwork={this.getNetwork.bind(this)} getNodes={this.getNodes.bind(this)}/>
            </div>
        );
    }
}