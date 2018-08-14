import React from "react";
import { render } from "react-dom";
import { Header } from "./components/Header";
import { FooterStateless } from "./components/FooterStateless";
import { MainPage } from "./components/MainPage";
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
                    !this.state.existingUser ?
                    <div>
                        <Header/>
                        <hr/>
                        <MainPage/>
                        <FooterStateless copyrightLink="http://live4others.com" />
                    </div>
                    :
                    <div>
                        You are coming for the first time, lets do some configurations first
                    </div>
                }
            </div>
            
        );
    }
}
render(<Index/>, window.document.getElementById('app'));