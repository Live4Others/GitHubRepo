import React from "react";
import 'bootstrap/dist/css/bootstrap.css';


export class Header extends React.Component {

    constructor() {
        super();
        this.state = {
            toDashboard: false,
            environment: 'Select an Environment',
        }
    }

    changeEnvironment(event) {
        this.setState({
            environment: event.target.value
        });
    }
   

    render() {
        return (
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <a className="nav-link" href="/home">Home</a>
                            </li>
                            <li className="nav-item ">
                                <a className="nav-link" href="/projects">Projects</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" href="#">Tasks</a>
                            </li>
                        </ul>
                        <div className="column form-inline my-2 my-lg-0">
                            <select className="form-control" value={this.state.environment} onChange={this.changeEnvironment.bind(this)}>
                            <option value="select">Select an Environment</option>
                            <option value="First">First</option>
                            <option value="Second">Second</option>
                            <option value="Third">Third</option>
                            </select>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}