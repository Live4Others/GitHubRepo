import React from "react";

import { BrowserRouter as Router, Route } from "react-router-dom";

import { Home } from "./Home";
import { Projects } from "./Projects";
import { ProjectDetails } from "./ProjectDetails";

export class MainPage extends React.Component {
    constructor(props) {
        super();
    }
    render() {
        return(
            <div>  
                <div >
                    <Router>
                        <div>
                            <Route path="/home" component={Home} />
                            <Route path="/projects" component={Projects} />
                            <Route exact path="/projectDetails" component={ProjectDetails} />
                            <Route exact path="/" component={Home} />
                        </div>
                    </Router>
                </div>
            </div>
        );
    }
}