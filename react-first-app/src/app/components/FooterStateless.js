import React from "react";
import 'bootstrap/dist/css/bootstrap.css';
export const FooterStateless = (props) => {
    return (
        <footer className="footer">
            <div className="footer-copyright text-center">© 2018 Copyright:
                <a href={props.copyrightLink}>Live4Others</a>
            </div>
        </footer>
    );
}
