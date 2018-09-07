import React from "react";
import { render } from "react-dom";
import { Order } from './order';

class Index extends React.Component {
    render() {
        return (
            <div>
                  <nav className="navbar navbar-default">
                    <div className="container-fluid">
                    <div className="navbar-header">
                        <h3>Welcome to the context store application</h3>
                    </div>
                    </div>
                </nav>
                <div className="container-fluid">
                    <div className="row content">
                        <div className="col-sm-3 sidenav">
                            <Order ></Order>
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