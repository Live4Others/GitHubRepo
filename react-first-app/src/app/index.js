import React from "react";
import { render } from "react-dom";
import { Header } from "./components/Header";
import { FooterStateless } from "./components/FooterStateless";
import { MainPage } from "./components/MainPage";
import 'bootstrap/dist/css/bootstrap.css';

class Index extends React.Component {
    render() {
        return(
            <div>
                <Header/>
                <hr/>
                <MainPage/>
                <FooterStateless copyrightLink="http://live4others.com" />
            </div>
        );
    }
}
render(<Index/>, window.document.getElementById('app'));