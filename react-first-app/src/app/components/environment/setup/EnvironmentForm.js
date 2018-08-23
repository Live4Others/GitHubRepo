import React from 'react';
import FloatingLabel from 'floating-label-react';

export class EnvironmentForm extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            envName:"",
            envHost:"",
            envPort:"",
            envUser:"",
            dbHost:"",
            dbPort:"",
            affSid:"",
            affUsername:"",
            affPassword:"",
            refSid:"",
            refUsername:"",
            refPassword:"",
            altRefSid:"",
            altRefUsername:"",
            altRefPassword:"",
            adding: false
        };
        this.indexComponent = props.indexComponent;
    }

    add() {
        console.log(this.state);
        this.indexComponent('hi this is me');
        this.setState({
            adding: true
        })
    }
  
    onChange(event) {
        var name = event.target.name;
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    render() {
        const customStyle = {
            maxWidth: '30%'
        };

        const floatingStyles = {
            floating: {
                color: 'grey'
            },
            focus: {
                borderColor: 'grey',
                borderBottomWidth: 2,
            },
            input: {
                borderBottomColor: 'black',
                width: '95%'
            }
        };

        return (
            <div>
                <div className="modal-dialog modal-dialog-centered" style={customStyle}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Welcome to the world of simplicity!!!</h4>
                        </div>
                        <div className="modal-body">
                            <div className="container">
                                <h5>Environment Details</h5>
                                <div className="mb-3">
                                    <FloatingLabel styles={floatingStyles} element='input' name='envName' value={this.state.name} placeholder='Environment Name' type='text' onChange={this.onChange.bind(this)}/>
                                </div>
                                <div className="mb-3">
                                    <FloatingLabel styles={floatingStyles} element='input' name='envHost' value={this.state.envHost} placeholder='Host' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='envPort' value={this.state.envPort} placeholder='Port' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='envUser' value={this.state.envUser} placeholder='User' type='text' onChange={this.onChange.bind(this)}/>
                                </div>
                                <h5>Database Details</h5>
                                <div className="mb-3">
                                    <FloatingLabel styles={floatingStyles} element='input' name='dbHost' value={this.state.dbHost} placeholder='Host' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='dbPort' value={this.state.dbPort} placeholder='Port' type='text' onChange={this.onChange.bind(this)}/>
                                </div>
                                <h6>AFF User Details</h6>
                                <div className="mb-3">
                                    <FloatingLabel styles={floatingStyles} element='input' name='affSid' value={this.state.affSid} placeholder='SID' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='affUsername' value={this.state.affUsername} placeholder='Username' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='affPassword' value={this.state.affPassword} placeholder='Password' type='text' onChange={this.onChange.bind(this)}/>
                                </div>
                                <h6>REF User Details</h6>
                                <div className="mb-3">
                                    <FloatingLabel styles={floatingStyles} element='input' name='refSid' value={this.state.refSid} placeholder='SID' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='refUsername' value={this.state.refUsername} placeholder='Username' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='refPassword' value={this.state.refPassword} placeholder='Password' type='text' onChange={this.onChange.bind(this)}/>
                                </div>
                                <h6>ALT REF User Details</h6>
                                <div className="mb-3">
                                    <FloatingLabel styles={floatingStyles} element='input' name='altRefSid' value={this.state.altRefSid} placeholder='SID' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='altRefUsername' value={this.state.altRefUsername} placeholder='Username' type='text' onChange={this.onChange.bind(this)}/>
                                    <FloatingLabel styles={floatingStyles} element='input' name='altRefPassword' value={this.state.altRefPassword} placeholder='Password' type='text' onChange={this.onChange.bind(this)}/>
                                </div>
                                <div>
                                    {
                                        this.state.adding ? 
                                        <div>
                                            <i className="fa fa-spinner fa-spin" /> Saving...
                                        </div> 
                                        :
                                        <button type="button" className="btn btn-primary" onClick={this.add.bind(this)}>Add</button> 
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
