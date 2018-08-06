import React from "react";
import propTypes from 'prop-types';

export class Home extends React.Component {
    constructor (props) {
        super();
        this.state = {
            age: 25,
            status: 0
        }
        setTimeout(() => { 
            // check to prevent calling the setState if component is unmounted before 2 seconds
            if(this.mountComponent) {
                this.setState({
                    status : 1
                })
            }
        }, 2000);
    }

    makeMeOlder() {
        console.log("making me older");
        this.age += 5;
        this.setState({
            age: this.state.age + 5
        });
    }

    render() {
        var mountComponent;
        return (
            <div className="container">
                <p><b>This is my first ReactJS Application page.</b></p>  
                <hr/>
                <div>my current age is : {this.state.age}</div>
                <hr/>
                <button className="btn btn-primary" onClick={() => this.makeMeOlder()} >Make me older!</button>
                <hr/>
                
            </div>
        );
    }

    componentWillMount() {
        this.mountComponent = true
        console.log("component will mount")
    }

    componentDidMount() {
        console.log("component did mount")
    }

    componentWillReceiveProps() {
        console.log("component will receive properties")
    }

    shouldComponentUpdate(nextState, nextProps) {
        // if(nextProps.status === 1) {
        //     return false;
        // }
        return true;
    }

    componentWillUpdate() {
        console.log("component will mount")
    }

    componentDidUpdate() {
        console.log("component did update")
    }

    componentWillUnmount() {
        this.mountComponent = false;
        console.log("component will unmount")
    }

}
 
// can use this propTypes for the validations
Home.propTypes = {
    name: propTypes.string,
    initialAge: propTypes.number
}