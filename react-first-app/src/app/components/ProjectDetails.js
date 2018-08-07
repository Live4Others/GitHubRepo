import React from "react";
import {Tabs, Tab,TabList, TabPanel} from 'react-tabs';
import  { ProjectOverview } from "./ProjectOverview";
import "react-tabs/style/react-tabs.css";

export class ProjectDetails extends React.Component {
    constructor (props) {
        super();
        this.state = {
            key : 1,
            id: 1
        }
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
                        <ProjectOverview />
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