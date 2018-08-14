import React from "react";
import { render } from "react-dom";
import { Header } from "./components/Header";
import { FooterStateless } from "./components/FooterStateless";
import { MainPage } from "./components/MainPage";
import FirstTimePopUp from "./components/environment/setup/FirstTimePopUp"
import 'bootstrap/dist/css/bootstrap.css';


class Index extends React.Component {
    constructor() {
        super();
        this.state = {
            existingUser: false
        }
    }
    render() {
        return(
            <div>
                {
                    this.state.existingUser ?
                    <div>
                        <Header/>
                        <hr/>
                        <MainPage/>
                        <FooterStateless copyrightLink="http://live4others.com" />
                    </div>
                    :
                    <FirstTimePopUp />
                }
            </div>
            
        );
    }
}
render(<Index/>, window.document.getElementById('app'));