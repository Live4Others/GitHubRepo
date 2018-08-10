import React from "react";
import 'bootstrap/dist/css/bootstrap.css';


export class Header extends React.Component {
    constructor() {
        super();
        this.state = {
            searchValue: "",
            toDashboard: false,
        }
        this.searchProject = this.searchProject.bind(this);
        this.upateSearchValue = this.upateSearchValue.bind(this);
    }

    searchProject(event) {
        this.setState({
            searchValue: event.target.value
        });
        this.props.history.push('/projectDetails');
    }

    upateSearchValue(event) {
        this.setState({
            searchValue: event.target.value
        })
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
                            <input className="form-control mr-sm-2" type="search" placeholder="Search" value={this.state.searchValue} onChange={this.upateSearchValue}/>
                            <button className="btn btn-outline-success my-2 my-sm-0" type="button" onClick={this.searchProject}>Search</button>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}