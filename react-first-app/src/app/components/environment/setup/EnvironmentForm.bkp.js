import React from 'react';
import FloatingLabel from 'floating-label-react';

export class EnvironmentForm extends React.Component {
  render() {
    const customStyle = {
        maxWidth: 700
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
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Name</span>
                                </div>
                                <input type="text" className="form-control" placeholder="Name" />
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Host</span>
                                </div>
                                <input type="text" className="form-control" placeholder="Host" />
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Port</span>
                                </div>
                                <input type="text" className="form-control" placeholder="Port"  />
                            </div>
                            <h5>Database Details</h5>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Host</span>
                                </div>
                                <input type="text" className="form-control" placeholder="Host"  />
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Port</span>
                                </div>
                                <input type="text" className="form-control" placeholder="Port"  />
                            </div>
                            <h6>DB User Details</h6>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">AFF</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="AFF SID"/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">User</span>
                                </div>
                                <input type="text" className="form-control" placeholder="AFF Username"/>
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Password</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="AFF Password"/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">REF</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="REF SID"/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">User</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="REF Username"/>
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Password</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="REF Password"/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">ALT</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="ALT REF SID"/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">User</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="ALT REF Username"/>
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Password</span>
                                </div>
                                <input type="text" className="form-control"  placeholder="ALT REF Password"/>
                            </div>
                            <button type="submit" className="btn btn-primary" >Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}
