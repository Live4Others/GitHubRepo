import React from "react";

export class ProjectDetails extends React.Component {
    constructor (props) {
        super();
        
    }

    render() {
        return (
            <div id={this.props.id} className="container">
                This is project details....
            </div>
        );
    }
}