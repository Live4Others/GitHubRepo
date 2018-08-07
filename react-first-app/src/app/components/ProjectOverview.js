import React from "react";
import ReactDOM from 'react-dom';
import Graph from 'vis-react';

var graph = {
    nodes: [
        {id: 1, label: 'Node 1', cid:1},
        {id: 2, label: 'Node 2', cid:1},
        {id: 3, label: 'Node 3'},
        {id: 4, label: 'Node 4'},
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
    interaction: {
        navigationButtons: true,
        keyboard: true
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
        network.interactionHandler.navigationHandler.navigationButtons = true;
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
        this.network.interactionHandler.navigationHandler.navigationButtons = true;
        console.log(this.network);
        this.network.redraw();
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