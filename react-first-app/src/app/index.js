import React from "react";
import { render } from "react-dom";
import { Header } from "./components/Header";
import { FooterStateless } from "./components/FooterStateless";
import { MainPage } from "./components/MainPage";
import { FirstTimePopUp } from "./components/environment/setup/FirstTimePopUp";
import { EnvironmentUtils } from "./components/environment/EnvironmentUtils";

class Index extends React.Component {

    indexComponent(value) {
        console.log("here in index.js file");
        setTimeout(() => {
            this.setState({
                existingUser: false
            })
        }, 1500);
    }

    constructor() {
        super();
        this.state = {
            existingUser: false,
            showLoading: true
        }

        setTimeout(() => {
            this.setState({
                existingUser: false, 
                showLoading: false,
            })
        }, 1500);

        var environments = new EnvironmentUtils().fetch();

        console.log("environment details :: " + environments);

        // var environments = new EnvironmentUtils().fetch();
        // environments.then((data) => {
        //     setTimeout(() => {
        //         this.setState({
        //             existingUser: (!!data) ? true:false, 
        //             showLoading: false,
        //         })
        //     }, 1500);
        // })
        

    }
    render() {
        return(
            <div>
                {
                    this.state.showLoading ? 
                        <div >
                            <div className="my-loader my-center"></div>
                            <img className="my-center" src='./img/please-wait-1.gif' />
                        </div>
                        :
                        !this.state.existingUser ?
                        <div>
                            <Header/>
                            <hr/>
                            <MainPage/>
                            <FooterStateless copyrightLink="http://live4others.com" />
                        </div>
                        :
                        <FirstTimePopUp indexComponent={this.indexComponent.bind(this)}/>
                }
            </div>
            
        );
    }
}
render(<Index/>, window.document.getElementById('app'));