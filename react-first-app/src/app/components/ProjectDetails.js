import React from "react";
import {Tabs, Tab,TabList, TabPanel} from 'react-tabs';
import {Tree} from 'react-d3-tree';
import "react-tabs/style/react-tabs.css";
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

export class ProjectDetails extends React.Component {
    constructor (props) {
        super();
        this.state = {
            key : 1,
            id: 1
        }
    }

    handleSelect() {

    }

    render() {
        return (
            <div className="container">
                <Tabs >
                    <TabList >
                        <Tab>Overview</Tab>
                        <Tab>Current Activities</Tab>
                        <Tab>Project Store</Tab>
                        <Tab>Hierarchy</Tab>
                    </TabList>
                    <TabPanel>
                        <div className="row">
                            <Tree data={myTreeData} />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        Current plan of activities and actions that can be taken here
                    </TabPanel>
                    <TabPanel>
                        Here project store attribute will be visible & user will be able to create and update attributes
                    </TabPanel>
                    <TabPanel>
                        Here project hierarchy tree will be shown
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}