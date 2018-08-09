import React from "react";
import {Tabs, Tab,TabList, TabPanel} from 'react-tabs';
import  { ProjectOverview } from "../overview/ProjectOverview";
import  { ActivityDetails } from "../activityDetails/ActivityDetails";
import  { ProjectStoreDetails } from "../projectStoreDetails/ProjectStoreDetails";
import  { ProjectHierarchy } from "../projectHierarchy/ProjectHierarchy";

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
                        <Tab>Activity Details</Tab>
                        <Tab>Project Store</Tab>
                        <Tab>Hierarchy</Tab>
                    </TabList>
                    <TabPanel>
                        <ProjectOverview />
                    </TabPanel>
                    <TabPanel>
                        <ActivityDetails/>
                    </TabPanel>
                    <TabPanel>
                        <ProjectStoreDetails/>
                    </TabPanel>
                    <TabPanel>
                        <ProjectHierarchy />
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}