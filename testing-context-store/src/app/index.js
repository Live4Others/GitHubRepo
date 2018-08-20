import React from "react";
import { render } from "react-dom";

class Index extends React.Component {
    render() {
        return (
            <div>
                  <nav className="navbar navbar-default">
                    <div className="container-fluid">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="#">WebSiteName</a>
                    </div>
                    <ul className="nav navbar-nav">
                        <li className="active"><a href="#">Home</a></li>
                        <li><a href="#">Page 1</a></li>
                        <li><a href="#">Page 2</a></li>
                        <li><a href="#">Page 3</a></li>
                    </ul>
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row content">
                        <div className="col-sm-3 sidenav">
                            Nav Bar
                        </div>
                        <div className="col-sm-9">
                            Right side panel
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}
render(<Index/>, window.document.getElementById('app'));