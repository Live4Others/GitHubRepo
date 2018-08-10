import React from "react";
import 'bootstrap/dist/css/bootstrap.css';

export class Footer extends React.Component {
    render() {
        return (
            <footer className="footer">
                <div className="footer-copyright text-center">© 2018 Copyright:
                    <a href="/#">Live4Others.com</a>
                </div>
            </footer>
        );
    }
}