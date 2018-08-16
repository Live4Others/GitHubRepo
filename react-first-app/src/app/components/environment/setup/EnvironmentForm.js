import React from 'react';
import FloatingLabel from 'floating-label-react';

export class EnvironmentForm extends React.Component {
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
                        <form className="container">
                            <h5>Environment Details</h5>
                            <div className="mb-3">
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Host' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Port' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='User' type='text'/>
                            </div>
                            <h5>Database Details</h5>
                            <div className="mb-3">
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Host' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Port' type='text'/>
                            </div>
                            <h6>AFF User Details</h6>
                            <div className="mb-3">
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='SID' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Username' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Password' type='text'/>
                            </div>
                            <h6>REF User Details</h6>
                            <div className="mb-3">
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='SID' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Username' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Password' type='text'/>
                            </div>
                            <h6>ALT REF User Details</h6>
                            <div className="mb-3">
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='SID' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Username' type='text'/>
                                <FloatingLabel styles={floatingStyles} element='input' name='email' placeholder='Password' type='text'/>
                            </div>
                            <button type="submit" className="btn btn-primary" >Add</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}
